import { buildTrainingDayDetail } from '../../data/workouts/workoutSession.js';
import { appState, hasManualSelection, navigateTo } from './appState.js';

function appendTargetGrid(wrapper, target) {
  const grid = document.createElement('div');
  grid.className = 'target-grid';

  [
    ['目标组数', target.sets ?? '-'],
    ['目标次数/时长', target.reps || target.durationSeconds || target.durationMinutes || '-'],
    ['休息时间', target.restSeconds !== null && target.restSeconds !== undefined ? `${target.restSeconds} 秒` : '-'],
    ['RIR', target.rir ?? '-'],
    ['训练节奏', target.tempo || '-']
  ].forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'target-pill';
    item.innerHTML = `<span class="stat-label">${label}</span><span class="stat-value">${value}</span>`;
    grid.appendChild(item);
  });

  wrapper.appendChild(grid);
}

function renderExerciseItem(item) {
  const wrapper = document.createElement('article');
  wrapper.className = 'exercise';

  const name = document.createElement('h3');
  name.className = 'exercise-title';
  name.textContent = item.detail ? item.detail.nameZh : item.exerciseId;
  wrapper.appendChild(name);

  if (item.detail && item.detail.nameEn) {
    const enName = document.createElement('span');
    enName.className = 'exercise-subtitle';
    enName.textContent = item.detail.nameEn;
    wrapper.appendChild(enName);
  }

  const muscles = document.createElement('p');
  muscles.textContent = `主练肌群：${item.detail ? item.detail.primaryMuscles.join('、') : '-'}`;
  wrapper.appendChild(muscles);

  appendTargetGrid(wrapper, item.target);

  const note = document.createElement('p');
  note.innerHTML = `<strong>训练备注：</strong>${item.target.note || '-'}`;
  wrapper.appendChild(note);

  const detail = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = '展开动作步骤和安全提示';
  detail.appendChild(summary);

  const stepsTitle = document.createElement('strong');
  stepsTitle.textContent = '步骤';
  detail.appendChild(stepsTitle);

  const steps = document.createElement('ol');
  (item.detail ? item.detail.steps : []).forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    steps.appendChild(li);
  });
  detail.appendChild(steps);

  const safetyTitle = document.createElement('strong');
  safetyTitle.textContent = '安全提示';
  detail.appendChild(safetyTitle);

  const safety = document.createElement('ul');
  (item.detail ? item.detail.safetyTips : []).forEach((tip) => {
    const li = document.createElement('li');
    li.textContent = tip;
    safety.appendChild(li);
  });
  detail.appendChild(safety);

  wrapper.appendChild(detail);
  return wrapper;
}

export function renderTrainingDetailPage(root) {
  const detail = appState.selectedRestDay
    ? {
        isRestDay: true,
        restMessage: '今日休息 / 低强度有氧'
      }
    : buildTrainingDayDetail({
        planDayId: appState.selectedPlanDayId || undefined
      });

  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  const title = document.createElement('h1');
  title.textContent = detail.isRestDay ? '今日休息' : detail.nameZh;
  page.appendChild(title);

  if (detail.isRestDay) {
    const hero = document.createElement('section');
    hero.className = 'hero-card';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = hasManualSelection() ? '手动选择' : '今日安排';
    hero.appendChild(eyebrow);

    const titleRest = document.createElement('h1');
    titleRest.textContent = '今日休息 / 低强度有氧';
    hero.appendChild(titleRest);

    const rest = document.createElement('p');
    rest.textContent = detail.restMessage;
    hero.appendChild(rest);

    const tip = document.createElement('div');
    tip.className = 'meta-card';
    tip.textContent = '恢复建议：轻松步行、活动度练习或完全休息都可以。保持睡眠和饮水，不需要补做训练量。';
    hero.appendChild(tip);

    page.appendChild(hero);
  } else {
    const hero = document.createElement('section');
    hero.className = 'hero-card';

    const duration = document.createElement('div');
    duration.className = 'big-value';
    duration.textContent = `${detail.estimatedDurationMinutes} 分钟`;
    hero.appendChild(duration);

    const durationLabel = document.createElement('p');
    durationLabel.textContent = '预计训练时长';
    hero.appendChild(durationLabel);

    page.appendChild(hero);

    const warmup = document.createElement('div');
    warmup.className = 'meta-card';
    warmup.innerHTML = `<strong>热身：</strong>`;
    const warmupList = document.createElement('ul');
    (detail.warmup.items || []).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      warmupList.appendChild(li);
    });
    warmup.appendChild(warmupList);
    page.appendChild(warmup);

    detail.exercises.forEach((item) => page.appendChild(renderExerciseItem(item)));
  }

  const actions = document.createElement('div');
  actions.className = 'actions';

  const backButton = document.createElement('button');
  backButton.textContent = '返回今日训练';
  backButton.addEventListener('click', () => navigateTo('today'));
  actions.appendChild(backButton);

  const startButton = document.createElement('button');
  startButton.textContent = '开始训练';
  startButton.disabled = detail.isRestDay;
  startButton.addEventListener('click', () => navigateTo('record'));
  actions.appendChild(startButton);

  page.appendChild(actions);
  root.appendChild(page);
}
