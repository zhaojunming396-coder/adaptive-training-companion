import {
  getLastExercisePerformance,
  getTodayTrainingSelection,
  buildTrainingDayDetail,
  readWorkoutHistory
} from '../../data/workouts/workoutSession.js';
import {
  buildTrainingOverview,
  getRecentSessionVolumeTrend
} from '../../data/workouts/workoutAnalytics.js';
import {
  getLastCompletedExerciseLog,
  recommendWeightForTarget,
  readUserTrainingProfile
} from '../../data/workouts/weightRecommendation.js';
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

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getSessionTime(session) {
  return new Date(session.endedAt || session.startedAt || session.date || 0).getTime();
}

function getCompletedSets(log) {
  return Array.isArray(log && log.sets) ? log.sets.filter((set) => set.completed === true) : [];
}

function getSetVolume(set) {
  const weight = toNumber(set && set.weight);
  const reps = toNumber(set && set.reps);
  return weight === null || reps === null ? 0 : weight * reps;
}

function getSessionVolume(session) {
  return (Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [])
    .reduce((sum, log) => sum + getCompletedSets(log).reduce((setSum, set) => setSum + getSetVolume(set), 0), 0);
}

function getCompletedSetCount(session) {
  return (Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [])
    .reduce((sum, log) => sum + getCompletedSets(log).length, 0);
}

function getPlannedTrainingCount() {
  const weeklyFrequency = Number(bodyRecomposition4DayPlan.weeklyFrequency);
  return Number.isFinite(weeklyFrequency) && weeklyFrequency > 0 ? weeklyFrequency : bodyRecomposition4DayPlan.weeklySchedule
    .filter((item) => item.planDayId)
    .length;
}

function getPreviousSamePlanDay(history, planDayId) {
  return (Array.isArray(history) ? history : [])
    .filter((session) => session.planDayId === planDayId && session.completed !== false)
    .slice()
    .sort((a, b) => getSessionTime(b) - getSessionTime(a))[0] || null;
}

function getSamePlanDayHistory(history, planDayId) {
  return (Array.isArray(history) ? history : [])
    .filter((session) => session.planDayId === planDayId && session.completed !== false)
    .slice()
    .sort((a, b) => getSessionTime(b) - getSessionTime(a));
}

function getLastSession(history) {
  return (Array.isArray(history) ? history : [])
    .filter((session) => session.completed !== false)
    .slice()
    .sort((a, b) => getSessionTime(b) - getSessionTime(a))[0] || null;
}

function formatVolume(value) {
  return `${Math.round(value || 0)} kg·次`;
}

function formatTargetText(target) {
  if (!target) {
    return '按计划完成';
  }

  const parts = [];

  if (target.sets) {
    parts.push(`${target.sets} 组`);
  }

  if (target.reps) {
    parts.push(`${target.reps} 次`);
  }

  if (target.durationSeconds) {
    parts.push(`${target.durationSeconds} 秒`);
  }

  if (target.durationMinutes) {
    parts.push(`${target.durationMinutes} 分钟`);
  }

  if (target.rir !== null && target.rir !== undefined) {
    parts.push(`RIR ${target.rir}`);
  }

  return parts.length > 0 ? parts.join(' · ') : '按计划完成';
}

function buildTrainingFeedback({ history, selection, detail }) {
  const plannedCount = getPlannedTrainingCount();
  const overview = buildTrainingOverview(history);
  const volumeTrend = getRecentSessionVolumeTrend(history, 4);
  const lastSession = getLastSession(history);
  const previousSameDay = detail && detail.planDayId
    ? getPreviousSamePlanDay(history, detail.planDayId)
    : null;
  const previousVolume = previousSameDay ? getSessionVolume(previousSameDay) : 0;
  const recentVolume = volumeTrend.length > 0 ? volumeTrend[volumeTrend.length - 1].volume : 0;
  const weekPercent = plannedCount > 0
    ? Math.min(100, Math.round((overview.weeklyTrainingCount / plannedCount) * 100))
    : 0;

  if (selection.isRestDay) {
    return {
      status: overview.weeklyTrainingCount >= plannedCount ? 'recovery' : 'catch_up',
      label: overview.weeklyTrainingCount >= plannedCount ? '恢复日' : '本周缺口',
      headline: overview.weeklyTrainingCount >= plannedCount
        ? '本周训练量已经够，今天优先恢复。'
        : '今天是休息日，但本周训练次数还没打满。',
      advice: overview.weeklyTrainingCount >= plannedCount
        ? '建议做 20-30 分钟低强度活动度或散步，保留下一次主训练表现。'
        : '如果状态很好，可以手动切换到漏掉的训练日；如果疲劳明显，就保持休息。',
      evidence: lastSession
        ? `最近一次训练：${lastSession.date}，完成 ${getCompletedSetCount(lastSession)} 组，容量 ${formatVolume(getSessionVolume(lastSession))}。`
        : '暂无历史训练记录，先用 1-2 周建立个人基准。',
      weekPercent,
      overview,
      previousSameDay,
      recentVolume
    };
  }

  if (!previousSameDay) {
    return {
      status: 'baseline',
      label: '建立基准',
      headline: '今天先建立这个训练日的第一组数据。',
      advice: '先按建议重量保守完成目标次数，记录重量、次数和 RIR。下次系统才能判断该加重量、加次数还是保持。',
      evidence: lastSession
        ? `最近一次训练：${lastSession.date}，容量 ${formatVolume(getSessionVolume(lastSession))}。`
        : '暂无历史训练记录，今天的数据会成为后续反馈的起点。',
      weekPercent,
      overview,
      previousSameDay,
      recentVolume
    };
  }

  const samePlanDayHistory = getSamePlanDayHistory(history, detail.planDayId);
  const latestSameDay = samePlanDayHistory[0] || null;
  const earlierSameDay = samePlanDayHistory[1] || null;
  const latestSameDayVolume = latestSameDay ? getSessionVolume(latestSameDay) : 0;
  const earlierSameDayVolume = earlierSameDay ? getSessionVolume(earlierSameDay) : 0;

  if (!earlierSameDay) {
    return {
      status: 'maintain',
      label: '稳定复现',
      headline: '已经有一次同类训练记录，今天先复现并微调。',
      advice: '保持上次主要重量，目标是多完成 1-2 次或让 RIR 更接近计划值。完成后系统会开始判断趋势。',
      evidence: `上次同类训练：${latestSameDay.date}，完成 ${getCompletedSetCount(latestSameDay)} 组，容量 ${formatVolume(latestSameDayVolume)}。`,
      weekPercent,
      overview,
      previousSameDay,
      recentVolume
    };
  }

  const diff = latestSameDayVolume - earlierSameDayVolume;
  const diffPercent = earlierSameDayVolume > 0 ? Math.round((diff / earlierSameDayVolume) * 100) : 0;

  if (diffPercent >= 8) {
    return {
      status: 'progress',
      label: '可推进',
      headline: '最近表现高于上次同类训练，今天可以小幅推进。',
      advice: '优先把目标次数做满；如果主项动作稳定且 RIR 仍有余量，再尝试增加一个最小重量档位。',
      evidence: `最近两次同类训练：${earlierSameDay.date} → ${latestSameDay.date}，容量变化约 ${diffPercent}%。`,
      weekPercent,
      overview,
      previousSameDay,
      recentVolume
    };
  }

  if (diffPercent <= -12) {
    return {
      status: 'reduce',
      label: '保守调整',
      headline: '最近训练容量下降，今天先保护动作质量。',
      advice: '主项重量降低 5-10% 或少做 1 组，重点记录 RIR 和疲劳原因，避免把下降误判成失败。',
      evidence: `最近两次同类训练：${earlierSameDay.date} → ${latestSameDay.date}，容量变化约 ${diffPercent}%。`,
      weekPercent,
      overview,
      previousSameDay,
      recentVolume
    };
  }

  return {
    status: 'maintain',
    label: '稳定推进',
    headline: '最近表现接近上次，今天目标是把质量做稳。',
    advice: '保持上次重量，争取每组多 1 次或让 RIR 更接近目标。达标后下一次再加重量。',
    evidence: `最近两次同类训练：${earlierSameDay.date} → ${latestSameDay.date}，容量变化约 ${diffPercent}%。`,
    weekPercent,
    overview,
    previousSameDay,
    recentVolume
  };
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

function renderFeedbackPanel(page, feedback) {
  const card = document.createElement('section');
  card.className = `feedback-card feedback-${feedback.status}`;
  card.innerHTML = [
    `<div class="feedback-label">${feedback.label}</div>`,
    `<h2>${feedback.headline}</h2>`,
    `<p>${feedback.advice}</p>`,
    `<p class="feedback-evidence">${feedback.evidence}</p>`
  ].join('');
  page.appendChild(card);

  const progressCard = document.createElement('section');
  progressCard.className = 'exercise compact-card';
  const title = document.createElement('h2');
  title.textContent = '本周训练反馈';
  progressCard.appendChild(title);
  progressCard.appendChild(renderStatGrid([
    ['本周完成', `${feedback.overview.weeklyTrainingCount}/${getPlannedTrainingCount()} 次`],
    ['完成度', `${feedback.weekPercent}%`],
    ['累计组数', `${feedback.overview.totalCompletedSets} 组`],
    ['累计容量', formatVolume(feedback.overview.totalVolume)]
  ]));

  const bar = document.createElement('div');
  bar.className = 'feedback-progress';
  bar.innerHTML = `<span style="width: ${feedback.weekPercent}%"></span>`;
  progressCard.appendChild(bar);
  page.appendChild(progressCard);
}

function formatLastPerformance(performance) {
  if (!performance || !Array.isArray(performance.sets) || performance.sets.length === 0) {
    return '暂无上次记录';
  }

  return performance.sets.slice(0, 3).map((set) => {
    if (set.durationSeconds) {
      return `${set.durationSeconds}s`;
    }

    if (set.weight !== null && set.weight !== undefined && set.reps !== null && set.reps !== undefined) {
      return `${set.weight}kg × ${set.reps}`;
    }

    return set.reps ? `${set.reps} 次` : '已完成';
  }).join(' / ');
}

function getRecommendationTone(strategy) {
  if (strategy === '建议加重量' || strategy === '建议增加时长') {
    return 'progress';
  }

  if (strategy === '建议降低重量') {
    return 'reduce';
  }

  if (strategy === '参考基准力量' || strategy === '暂无建议') {
    return 'baseline';
  }

  return 'maintain';
}

function getNextUpdateText(recommendation, exercise) {
  const exerciseName = exercise && exercise.detail && exercise.detail.nameZh
    ? exercise.detail.nameZh
    : '这个动作';

  if (recommendation.strategy === '建议加重量') {
    return `${exerciseName} 如果这次仍能完成目标次数并保留余力，下次继续小幅加重量；如果动作变形，下次退回当前重量。`;
  }

  if (recommendation.strategy === '建议降低重量') {
    return `${exerciseName} 这次先把动作质量和目标次数做稳；下次只有在大多数完成组达标时再恢复重量。`;
  }

  if (recommendation.strategy === '建议增加时长') {
    return `${exerciseName} 这次优先稳定呼吸和节奏；如果完成轻松，下次再增加一小段时长。`;
  }

  if (recommendation.strategy === '参考基准力量' || recommendation.strategy === '暂无建议') {
    return `${exerciseName} 今天的数据会成为基准。请记录重量、次数和 RIR，下次系统会开始给出更准确的更新建议。`;
  }

  return `${exerciseName} 本次先保持强度，争取多做 1-2 次或让 RIR 更接近目标；达标后下次再推进。`;
}

function getRecommendationValueText(recommendation, exercise) {
  if (recommendation.type === 'time') {
    return recommendation.suggestedDurationText && recommendation.suggestedDurationText !== '暂无建议'
      ? `建议时长：${recommendation.suggestedDurationText}`
      : `目标：${formatTargetText(exercise.target)}`;
  }

  return recommendation.suggestedWeightText && recommendation.suggestedWeightText !== '暂无建议'
    ? `建议重量：${recommendation.suggestedWeightText}`
    : `先按计划目标建立基准：${formatTargetText(exercise.target)}`;
}

function renderKeyExerciseFeedback(page, detail) {
  const card = document.createElement('section');
  card.className = 'exercise';

  const title = document.createElement('h2');
  title.textContent = '关键动作建议';
  card.appendChild(title);

  const profile = readUserTrainingProfile();
  const list = document.createElement('div');
  list.className = 'feedback-list';

  detail.exercises.slice(0, 3).forEach((exercise) => {
    const lastExerciseLog = getLastCompletedExerciseLog(exercise.exerciseId, readWorkoutHistory());
    const recommendation = recommendWeightForTarget({
      planExercise: {
        exerciseId: exercise.exerciseId,
        target: exercise.target
      },
      lastExerciseLog,
      userProfile: profile
    });
    const lastPerformance = getLastExercisePerformance(exercise.exerciseId);
    const strategyText = recommendation.strategy === '暂无建议'
      ? '建立基准'
      : recommendation.strategy;
    const row = document.createElement('div');
    row.className = `feedback-row feedback-row-${getRecommendationTone(recommendation.strategy)}`;
    row.innerHTML = [
      `<div class="feedback-row-head">`,
      `<strong>${exercise.detail ? exercise.detail.nameZh : exercise.exerciseId}</strong>`,
      `<span>${strategyText}</span>`,
      `</div>`,
      `<span>计划目标：${formatTargetText(exercise.target)}</span>`,
      `<span>上次表现：${formatLastPerformance(lastPerformance)}</span>`,
      `<span>本次建议：${getRecommendationValueText(recommendation, exercise)}</span>`,
      `<p>原因：${recommendation.reason}</p>`,
      `<small>下次更新：${getNextUpdateText(recommendation, exercise)}</small>`
    ].join('');
    list.appendChild(row);
  });

  card.appendChild(list);
  page.appendChild(card);
}

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

  card.appendChild(renderStatGrid([
    ['今日蛋白质', `${progress.proteinIntakeGram}g / ${progress.proteinTargetGram}g`],
    ['还差', `${progress.remainingGram}g`],
    ['今日肌酸', supplementStatus.creatineTaken ? '已记录' : '未记录'],
    ['蛋白粉', supplementStatus.proteinPowderTaken ? '已记录' : '未记录']
  ]));

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
  const history = readWorkoutHistory();

  if (selection.isRestDay) {
    const feedback = buildTrainingFeedback({ history, selection, detail: null });

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
    renderFeedbackPanel(page, feedback);
  } else {
    const detail = buildTrainingDayDetail({ planDayId: selection.planDay.planDayId });
    const feedback = buildTrainingFeedback({ history, selection, detail });

    const hero = document.createElement('section');
    hero.className = 'hero-card';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = `${getSelectionSourceText()} · ${selection.date}`;
    hero.appendChild(eyebrow);

    const name = document.createElement('h1');
    name.textContent = detail.nameZh;
    hero.appendChild(name);

    hero.appendChild(renderStatGrid([
      ['预计时长', `${detail.estimatedDurationMinutes} 分钟`],
      ['训练重点', focusText[selection.planDay.focus] || detail.notes || '-'],
      ['今日反馈', feedback.label],
      ['本周完成', `${feedback.overview.weeklyTrainingCount}/${getPlannedTrainingCount()} 次`]
    ]));

    const warmup = document.createElement('div');
    warmup.className = 'meta-card';
    warmup.innerHTML = `<strong>热身内容</strong><p>${(detail.warmup.items || []).slice(0, 3).join('；')}</p>`;
    hero.appendChild(warmup);

    const startButton = document.createElement('button');
    startButton.textContent = '开始训练';
    startButton.addEventListener('click', () => navigateTo('record'));
    hero.appendChild(startButton);

    page.appendChild(hero);
    renderFeedbackPanel(page, feedback);
    renderKeyExerciseFeedback(page, detail);

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
