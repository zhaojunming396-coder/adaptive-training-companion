import { exercises } from '../../data/exercises/exercises.js';
import {
  readEquipmentWeightRules,
  readUserTrainingProfile,
  saveEquipmentWeightRules,
  saveUserTrainingProfile,
  upsertBaselineLift
} from '../../data/workouts/weightRecommendation.js';
import { navigateTo, toNumberOrNull } from './appState.js';

function createNumberInput({ label, value, step = '1' }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'field-label';
  wrapper.append(label);

  const input = document.createElement('input');
  input.type = 'number';
  input.inputMode = 'decimal';
  input.min = '0';
  input.step = step;
  input.value = value ?? '';
  wrapper.appendChild(input);

  return { wrapper, input };
}

function renderBaselineList(profile, page) {
  const card = document.createElement('section');
  card.className = 'exercise';

  const title = document.createElement('h2');
  title.textContent = '已保存基准力量';
  card.appendChild(title);

  if (!Array.isArray(profile.baselineLifts) || profile.baselineLifts.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = '暂无基准力量。';
    card.appendChild(empty);
    page.appendChild(card);
    return;
  }

  const exerciseNameMap = new Map(exercises.map((exercise) => [exercise.id, exercise.nameZh]));
  const list = document.createElement('ul');
  profile.baselineLifts.forEach((lift) => {
    const item = document.createElement('li');
    item.textContent = `${exerciseNameMap.get(lift.exerciseId) || lift.exerciseId}：${lift.weight}${lift.weightUnit || 'kg'} × ${lift.reps || '-'}，RIR ${lift.rir ?? '-'}，来源 ${lift.sourceType || '-'}，可信度 ${lift.confidence || '-'}${lift.recommendedStartWeight ? `，建议起步 ${lift.recommendedStartWeight}${lift.weightUnit || 'kg'}` : ''}${lift.note ? `。${lift.note}` : ''}`;
    list.appendChild(item);
  });
  card.appendChild(list);
  page.appendChild(card);
}

function renderEquipmentRules(page, root) {
  const rules = readEquipmentWeightRules();
  const card = document.createElement('section');
  card.className = 'exercise';

  const title = document.createElement('h2');
  title.textContent = '配重档位设置';
  card.appendChild(title);

  const tip = document.createElement('p');
  tip.textContent = '不同健身房器械档位不同，建议按实际器械手动调整。';
  card.appendChild(tip);

  const grid = document.createElement('div');
  grid.className = 'set-row';
  const dumbbell = createNumberInput({ label: '哑铃档位（kg）', value: rules.dumbbell.incrementKg, step: '0.5' });
  const barbell = createNumberInput({ label: '杠铃档位（kg）', value: rules.barbell.incrementKg, step: '0.5' });
  const cable = createNumberInput({ label: '绳索器械档位（kg）', value: rules.cable_machine.incrementKg, step: '0.5' });
  const machine = createNumberInput({ label: '固定器械档位（kg）', value: rules.machine.incrementKg, step: '0.5' });

  grid.appendChild(dumbbell.wrapper);
  grid.appendChild(barbell.wrapper);
  grid.appendChild(cable.wrapper);
  grid.appendChild(machine.wrapper);
  card.appendChild(grid);

  const saveButton = document.createElement('button');
  saveButton.textContent = '保存配重档位';
  saveButton.addEventListener('click', () => {
    saveEquipmentWeightRules({
      dumbbell: {
        incrementKg: dumbbell.input.value,
        note: `哑铃按 ${dumbbell.input.value || rules.dumbbell.incrementKg}kg 档位取整。`
      },
      barbell: {
        incrementKg: barbell.input.value,
        note: `杠铃按 ${barbell.input.value || rules.barbell.incrementKg}kg 档位取整。`
      },
      cable_machine: {
        incrementKg: cable.input.value,
        note: `绳索器械按 ${cable.input.value || rules.cable_machine.incrementKg}kg 档位取整。`
      },
      machine: {
        incrementKg: machine.input.value,
        note: `固定器械按 ${machine.input.value || rules.machine.incrementKg}kg 档位取整。`
      }
    });
    renderProfilePage(root);
  });
  card.appendChild(saveButton);
  page.appendChild(card);
}

export function renderProfilePage(root) {
  const profile = readUserTrainingProfile();
  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  const hero = document.createElement('section');
  hero.className = 'hero-card';
  hero.innerHTML = '<p class="eyebrow">本地保存</p><h1>我的训练档案</h1><p>用于给训练记录页生成本次建议重量，不会自动填入训练记录。</p><p>建议重量仅供参考，请以动作稳定和 RIR 为准。</p>';
  page.appendChild(hero);

  const basic = document.createElement('section');
  basic.className = 'exercise';
  const basicTitle = document.createElement('h2');
  basicTitle.textContent = '基础资料';
  basic.appendChild(basicTitle);

  const basicGrid = document.createElement('div');
  basicGrid.className = 'set-row';
  const bodyWeight = createNumberInput({ label: '体重（kg）', value: profile.bodyWeightKg, step: '0.1' });
  const height = createNumberInput({ label: '身高（cm）', value: profile.heightCm, step: '1' });
  const experience = createNumberInput({ label: '训练年限', value: profile.trainingExperienceYears, step: '0.5' });

  const levelLabel = document.createElement('label');
  levelLabel.className = 'field-label';
  levelLabel.append('力量水平');
  const level = document.createElement('select');
  level.innerHTML = [
    '<option value="beginner">初级</option>',
    '<option value="intermediate">中级</option>',
    '<option value="advanced">高级</option>'
  ].join('');
  level.value = profile.strengthLevel || 'beginner';
  levelLabel.appendChild(level);

  basicGrid.appendChild(bodyWeight.wrapper);
  basicGrid.appendChild(height.wrapper);
  basicGrid.appendChild(experience.wrapper);
  basicGrid.appendChild(levelLabel);
  basic.appendChild(basicGrid);

  const saveBasic = document.createElement('button');
  saveBasic.textContent = '保存基础资料';
  saveBasic.addEventListener('click', () => {
    saveUserTrainingProfile({
      ...profile,
      bodyWeightKg: bodyWeight.input.value,
      heightCm: height.input.value,
      trainingExperienceYears: experience.input.value,
      strengthLevel: level.value
    });
    renderProfilePage(root);
  });
  basic.appendChild(saveBasic);
  page.appendChild(basic);

  const baseline = document.createElement('section');
  baseline.className = 'exercise';
  const baselineTitle = document.createElement('h2');
  baselineTitle.textContent = '基准力量';
  baseline.appendChild(baselineTitle);

  const baselineGrid = document.createElement('div');
  baselineGrid.className = 'set-row';

  const exerciseLabel = document.createElement('label');
  exerciseLabel.className = 'field-label';
  exerciseLabel.append('动作');
  const exerciseSelect = document.createElement('select');
  exercises
    .filter((exercise) => exercise.trackingType === 'weight_reps')
    .forEach((exercise) => {
      const option = document.createElement('option');
      option.value = exercise.id;
      option.textContent = exercise.nameZh;
      exerciseSelect.appendChild(option);
    });
  exerciseLabel.appendChild(exerciseSelect);

  const baselineWeight = createNumberInput({ label: '重量（kg）', value: '', step: '0.5' });
  const baselineReps = createNumberInput({ label: '次数', value: '', step: '1' });
  const baselineRir = createNumberInput({ label: 'RIR', value: '', step: '1' });

  baselineGrid.appendChild(exerciseLabel);
  baselineGrid.appendChild(baselineWeight.wrapper);
  baselineGrid.appendChild(baselineReps.wrapper);
  baselineGrid.appendChild(baselineRir.wrapper);
  baseline.appendChild(baselineGrid);

  const noteLabel = document.createElement('label');
  noteLabel.textContent = '备注';
  const note = document.createElement('textarea');
  note.placeholder = '例如：单只哑铃重量。';
  noteLabel.appendChild(note);
  baseline.appendChild(noteLabel);

  const saveBaseline = document.createElement('button');
  saveBaseline.textContent = '保存基准力量';
  saveBaseline.addEventListener('click', () => {
    const weight = toNumberOrNull(baselineWeight.input.value);
    const reps = toNumberOrNull(baselineReps.input.value);

    if (weight === null || reps === null) {
      window.alert('请填写基准力量的重量和次数。');
      return;
    }

    upsertBaselineLift({
      exerciseId: exerciseSelect.value,
      weight,
      weightUnit: 'kg',
      reps,
      rir: toNumberOrNull(baselineRir.input.value),
      note: note.value
    });
    renderProfilePage(root);
  });
  baseline.appendChild(saveBaseline);
  page.appendChild(baseline);

  renderEquipmentRules(page, root);
  renderBaselineList(profile, page);

  const actions = document.createElement('div');
  actions.className = 'actions';
  const todayButton = document.createElement('button');
  todayButton.className = 'secondary-button';
  todayButton.textContent = '返回今日训练';
  todayButton.addEventListener('click', () => navigateTo('today'));
  actions.appendChild(todayButton);
  const backupButton = document.createElement('button');
  backupButton.className = 'secondary-button';
  backupButton.textContent = '数据备份';
  backupButton.addEventListener('click', () => navigateTo('backup'));
  actions.appendChild(backupButton);
  page.appendChild(actions);

  root.appendChild(page);
}
