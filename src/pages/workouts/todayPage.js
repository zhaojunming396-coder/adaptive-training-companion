import { getTodayTrainingSelection, buildTrainingDayDetail } from '../../data/workouts/workoutSession.js';
import {
  appState,
  getSelectionSourceText,
  hasManualSelection,
  navigateTo,
  restoreAutoRecommendation,
  selectTrainingDay,
  trainingDayOptions
} from './appState.js';
import { bodyRecomposition4DayPlan } from '../../data/trainingPlans/bodyRecomposition4DayPlan.js';
import {
  getTodayProteinProgress,
  getTodaySupplementStatus
} from '../../data/workouts/dailyNutrition.js';

const focusText = {
  upper_body_chest_back: '胸背主导',
  lower_body_quad: '股四头主导',
  upper_body_shoulder_back_arms: '肩背手臂',
  lower_body_posterior_chain: '臀腿后侧',
  cardio_core: '有氧与核心'
};

function getManualPlanDay(planDayId) {
  return bodyRecomposition4DayPlan.planDays.find((day) => day.planDayId === planDayId) || null;
}

function renderManualSelector(page, root) {
  const card = document.createElement('section');
  card.className = 'exercise';

  const title = document.createElement('h2');
  title.textContent = '手动选择训练日';
  card.appendChild(title);

  const hint = document.createElement('p');
  hint.className = 'source-line';
  hint.textContent = `当前来源：${getSelectionSourceText()}`;
  card.appendChild(hint);

  const description = document.createElement('p');
  description.textContent = '今天想练哪一天，可以在这里手动切换。';
  card.appendChild(description);

  const grid = document.createElement('div');
  grid.className = 'choice-grid';

  trainingDayOptions.forEach((option) => {
    const button = document.createElement('button');
    button.className =
      option.planDayId === appState.selectedPlanDayId || (!option.planDayId && appState.selectedRestDay)
        ? 'choice-button active'
        : 'choice-button secondary-button';
    button.textContent = option.label;
    button.addEventListener('click', () => {
      selectTrainingDay(option.planDayId);
      renderTodayPage(root);
    });
    grid.appendChild(button);
  });

  card.appendChild(grid);

  if (hasManualSelection()) {
    const restoreButton = document.createElement('button');
    restoreButton.className = 'restore-auto-button';
    restoreButton.textContent = '恢复今日自动推荐';
    restoreButton.addEventListener('click', () => {
      restoreAutoRecommendation();
      renderTodayPage(root);
    });
    card.appendChild(restoreButton);
  }

  page.appendChild(card);
}

function renderNutritionSummaryCard(page) {
  const progress = getTodayProteinProgress();
  const supplementStatus = getTodaySupplementStatus();
  const card = document.createElement('section');
  card.className = 'exercise';

  const title = document.createElement('h2');
  title.textContent = '今日蛋白质 / 补剂';
  card.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'stat-grid';
  [
    ['今日蛋白质', `${progress.proteinIntakeGram}g / ${progress.proteinTargetGram}g`],
    ['还差', `${progress.remainingGram}g`],
    ['今日肌酸', supplementStatus.creatineTaken ? '已记录' : '未记录'],
    ['蛋白粉', supplementStatus.proteinPowderTaken ? '已记录' : '未记录']
  ].forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'stat-item';
    item.innerHTML = `<span class="stat-label">${label}</span><span class="stat-value">${value}</span>`;
    grid.appendChild(item);
  });
  card.appendChild(grid);

  const button = document.createElement('button');
  button.className = 'secondary-button';
  button.textContent = '进入补剂记录';
  button.addEventListener('click', () => navigateTo('nutrition'));
  card.appendChild(button);

  page.appendChild(card);
}

export function renderTodayPage(root) {
  const todaySelection = getTodayTrainingSelection();
  const manualPlanDay = appState.selectedPlanDayId ? getManualPlanDay(appState.selectedPlanDayId) : null;
  const selection = appState.selectedRestDay
    ? {
        ...todaySelection,
        isRestDay: true,
        restMessage: '今日休息 / 低强度有氧',
        planDay: null
      }
    : manualPlanDay
      ? {
          ...todaySelection,
          isRestDay: false,
          planDay: manualPlanDay
        }
      : todaySelection;

  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  if (selection.isRestDay) {
    const hero = document.createElement('section');
    hero.className = 'hero-card';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = `${getSelectionSourceText()} · ${selection.date}`;
    hero.appendChild(eyebrow);

    const title = document.createElement('h1');
    title.textContent = '今日休息';
    hero.appendChild(title);

    const rest = document.createElement('p');
    rest.textContent = selection.restMessage || '休息 / 低强度有氧';
    hero.appendChild(rest);

    const tip = document.createElement('div');
    tip.className = 'meta-card';
    tip.textContent = '恢复提示：可以轻松散步、做活动度练习，避免把休息日做成高强度训练。';
    hero.appendChild(tip);

    page.appendChild(hero);
  } else {
    const detail = buildTrainingDayDetail({ planDayId: selection.planDay.planDayId });

    const hero = document.createElement('section');
    hero.className = 'hero-card';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = `${getSelectionSourceText()} · ${selection.date}`;
    hero.appendChild(eyebrow);

    const name = document.createElement('h1');
    name.textContent = detail.nameZh;
    hero.appendChild(name);

    const stats = document.createElement('div');
    stats.className = 'stat-grid';
    [
      ['预计时长', `${detail.estimatedDurationMinutes} 分钟`],
      ['训练重点', focusText[selection.planDay.focus] || detail.notes || '-']
    ].forEach(([label, value]) => {
      const item = document.createElement('div');
      item.className = 'stat-item';
      item.innerHTML = `<span class="stat-label">${label}</span><span class="stat-value">${value}</span>`;
      stats.appendChild(item);
    });
    hero.appendChild(stats);

    const warmup = document.createElement('div');
    warmup.className = 'meta-card';
    warmup.innerHTML = `<strong>热身内容</strong><p>${(detail.warmup.items || []).slice(0, 3).join('；')}</p>`;
    hero.appendChild(warmup);

    const startButton = document.createElement('button');
    startButton.textContent = '开始训练';
    startButton.addEventListener('click', () => navigateTo('record'));
    hero.appendChild(startButton);

    page.appendChild(hero);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const detailButton = document.createElement('button');
    detailButton.className = 'secondary-button';
    detailButton.textContent = '查看训练详情';
    detailButton.addEventListener('click', () => navigateTo('detail'));
    actions.appendChild(detailButton);

    const historyButton = document.createElement('button');
    historyButton.className = 'secondary-button';
    historyButton.textContent = '查看训练记录';
    historyButton.addEventListener('click', () => navigateTo('history'));
    actions.appendChild(historyButton);

    const profileButton = document.createElement('button');
    profileButton.className = 'secondary-button';
    profileButton.textContent = '我的训练档案';
    profileButton.addEventListener('click', () => navigateTo('profile'));
    actions.appendChild(profileButton);

    page.appendChild(actions);
  }

  if (selection.isRestDay) {
    const actions = document.createElement('div');
    actions.className = 'actions';

    const historyButton = document.createElement('button');
    historyButton.textContent = '查看训练记录';
    historyButton.addEventListener('click', () => navigateTo('history'));
    actions.appendChild(historyButton);

    const profileButton = document.createElement('button');
    profileButton.className = 'secondary-button';
    profileButton.textContent = '我的训练档案';
    profileButton.addEventListener('click', () => navigateTo('profile'));
    actions.appendChild(profileButton);
    page.appendChild(actions);
  }

  renderNutritionSummaryCard(page);
  renderManualSelector(page, root);
  root.appendChild(page);
}
