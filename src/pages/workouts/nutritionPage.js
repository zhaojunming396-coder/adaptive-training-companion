import {
  getTodayDateText,
  getTodayProteinProgress,
  readDailyNutritionLog,
  readDailySupplementLog,
  saveDailyNutritionLog,
  saveDailySupplementLog
} from '../../data/workouts/dailyNutrition.js';
import { navigateTo } from './appState.js';

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function renderStatGrid(items) {
  const grid = document.createElement('div');
  grid.className = 'stat-grid';
  items.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'stat-item';
    item.innerHTML = `<span class="stat-label">${label}</span><span class="stat-value">${value}</span>`;
    grid.appendChild(item);
  });
  return grid;
}

function createNumberField({ label, value, step = '1' }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'field-label';
  wrapper.append(label);

  const input = document.createElement('input');
  input.type = 'number';
  input.inputMode = 'decimal';
  input.min = '0';
  input.step = step;
  input.value = value ?? '';
  input.placeholder = label;
  wrapper.appendChild(input);

  return { wrapper, input };
}

function createCheckboxField({ label, checked }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'set-completed';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  wrapper.appendChild(input);
  wrapper.append(label);

  return { wrapper, input };
}

function createNoteField({ label, value }) {
  const wrapper = document.createElement('label');
  wrapper.textContent = label;

  const input = document.createElement('textarea');
  input.value = value || '';
  input.placeholder = label;
  wrapper.appendChild(input);

  return { wrapper, input };
}

function renderSupplementCard({ title, checked, fields = [], noteValue = '' }) {
  const card = document.createElement('section');
  card.className = 'exercise';

  const heading = document.createElement('h2');
  heading.textContent = title;
  card.appendChild(heading);

  const taken = createCheckboxField({ label: '今日已记录', checked });
  card.appendChild(taken.wrapper);

  const grid = document.createElement('div');
  grid.className = 'set-row';
  const fieldInputs = {};
  fields.forEach((field) => {
    const item = createNumberField(field);
    fieldInputs[field.key] = item.input;
    grid.appendChild(item.wrapper);
  });

  if (fields.length > 0) {
    card.appendChild(grid);
  }

  const note = createNoteField({ label: '备注', value: noteValue });
  card.appendChild(note.wrapper);

  return {
    card,
    takenInput: taken.input,
    fieldInputs,
    noteInput: note.input
  };
}

export function renderNutritionPage(root, message = '') {
  const date = getTodayDateText();
  const nutrition = readDailyNutritionLog(date);
  const supplement = readDailySupplementLog(date);
  const progress = getTodayProteinProgress({ date });

  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  const hero = document.createElement('section');
  hero.className = 'hero-card';
  hero.innerHTML = [
    `<p class="eyebrow">${date}</p>`,
    '<h1>补剂 / 蛋白质</h1>',
    '<p>轻量记录今日蛋白质目标和常用补剂。</p>'
  ].join('');
  page.appendChild(hero);

  if (message) {
    const notice = document.createElement('div');
    notice.className = 'notice success-notice';
    notice.textContent = message;
    page.appendChild(notice);
  }

  const proteinCard = document.createElement('section');
  proteinCard.className = 'exercise';
  const proteinTitle = document.createElement('h2');
  proteinTitle.textContent = '今日蛋白质';
  proteinCard.appendChild(proteinTitle);
  proteinCard.appendChild(renderStatGrid([
    ['目标', `${progress.proteinTargetGram}g`],
    ['已摄入', `${progress.proteinIntakeGram}g`],
    ['还差', `${progress.remainingGram}g`],
    ['完成度', `${progress.percent}%`]
  ]));

  const proteinGrid = document.createElement('div');
  proteinGrid.className = 'set-row';
  const targetField = createNumberField({
    label: '今日蛋白质目标（g）',
    value: nutrition.proteinTargetGram
  });
  const intakeField = createNumberField({
    label: '今日已摄入蛋白质（g）',
    value: nutrition.proteinIntakeGram
  });
  proteinGrid.appendChild(targetField.wrapper);
  proteinGrid.appendChild(intakeField.wrapper);
  proteinCard.appendChild(proteinGrid);

  const nutritionNote = createNoteField({ label: '蛋白质备注', value: nutrition.notes });
  proteinCard.appendChild(nutritionNote.wrapper);
  page.appendChild(proteinCard);

  const proteinPowderCard = renderSupplementCard({
    title: '蛋白粉',
    checked: supplement.proteinPowder.taken,
    fields: [{ key: 'proteinGram', label: '蛋白质含量（g）', value: supplement.proteinPowder.proteinGram }],
    noteValue: supplement.proteinPowder.note
  });
  page.appendChild(proteinPowderCard.card);

  const creatineCard = renderSupplementCard({
    title: '肌酸',
    checked: supplement.creatine.taken,
    fields: [{ key: 'doseGram', label: '剂量（g）', value: supplement.creatine.doseGram }],
    noteValue: supplement.creatine.note
  });
  page.appendChild(creatineCard.card);

  const fishOilCard = renderSupplementCard({
    title: '鱼油',
    checked: supplement.fishOil.taken,
    noteValue: supplement.fishOil.note
  });
  page.appendChild(fishOilCard.card);

  const curcuminCard = renderSupplementCard({
    title: '姜黄素',
    checked: supplement.curcumin.taken,
    noteValue: supplement.curcumin.note
  });
  page.appendChild(curcuminCard.card);

  const notice = document.createElement('section');
  notice.className = 'meta-card';
  notice.textContent = '补剂记录仅用于个人训练辅助，不作为医疗或营养处方。如有疾病、用药或不适，请咨询专业人士。';
  page.appendChild(notice);

  const backActions = document.createElement('div');
  backActions.className = 'actions';
  const todayButton = document.createElement('button');
  todayButton.className = 'secondary-button';
  todayButton.textContent = '返回今日训练';
  todayButton.addEventListener('click', () => navigateTo('today'));
  backActions.appendChild(todayButton);
  page.appendChild(backActions);

  const actions = document.createElement('div');
  actions.className = 'sticky-actions';
  const saveButton = document.createElement('button');
  saveButton.textContent = '保存';
  saveButton.addEventListener('click', () => {
    saveDailyNutritionLog({
      date,
      proteinTargetGram: toNumber(targetField.input.value, 120),
      proteinIntakeGram: toNumber(intakeField.input.value, 0),
      notes: nutritionNote.input.value
    });

    saveDailySupplementLog({
      date,
      proteinPowder: {
        taken: proteinPowderCard.takenInput.checked,
        proteinGram: toNumber(proteinPowderCard.fieldInputs.proteinGram.value, 0),
        note: proteinPowderCard.noteInput.value
      },
      creatine: {
        taken: creatineCard.takenInput.checked,
        doseGram: toNumber(creatineCard.fieldInputs.doseGram.value, 5),
        note: creatineCard.noteInput.value
      },
      fishOil: {
        taken: fishOilCard.takenInput.checked,
        note: fishOilCard.noteInput.value
      },
      curcumin: {
        taken: curcuminCard.takenInput.checked,
        note: curcuminCard.noteInput.value
      }
    });

    renderNutritionPage(root, '今日补剂和蛋白质记录已保存。');
  });
  actions.appendChild(saveButton);
  page.appendChild(actions);

  root.appendChild(page);
}
