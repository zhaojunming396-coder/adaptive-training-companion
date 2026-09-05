import {
  buildWorkoutSummary,
  buildTrainingDayDetail,
  createWorkoutSession,
  getLastExercisePerformance,
  readWorkoutHistory,
  saveWorkoutSession,
  updateWorkoutSet
} from '../../data/workouts/workoutSession.js';
import { exercises } from '../../data/exercises/exercises.js';
import { buildWorkoutProgressSummary } from '../../data/workouts/workoutAnalytics.js';
import {
  getLastCompletedExerciseLog,
  readUserTrainingProfile,
  recommendWeightForTarget
} from '../../data/workouts/weightRecommendation.js';
import {
  appState,
  navigateTo,
  notifyRestFinished,
  setRestVibrationEnabled,
  toNumberOrNull
} from './appState.js';

let restTimer = {
  secondsLeft: 0,
  status: '',
  intervalId: null
};
let setCompletionErrors = {};

function getExerciseDetailMap(detail) {
  return new Map(detail.exercises.map((item) => [item.exerciseId, item]));
}

function getFullExercise(exerciseId) {
  return exercises.find((exercise) => exercise.id === exerciseId) || null;
}

function setPatchFromInput(input) {
  const field = input.dataset.field;

  if (field === 'completed') {
    return { completed: input.checked };
  }

  return { [field]: toNumberOrNull(input.value) };
}

function getSetFields(exercise) {
  const trackingType = exercise && exercise.detail ? exercise.detail.trackingType : 'weight_reps';

  if (trackingType === 'time_based') {
    return [{ field: 'durationSeconds', label: '时长（秒）' }];
  }

  if (trackingType === 'reps_only') {
    return [
      { field: 'reps', label: '次数' },
      { field: 'rir', label: '剩余次数 RIR' }
    ];
  }

  if (trackingType === 'distance_time') {
    return [
      { field: 'durationSeconds', label: '时长（秒）' },
      { field: 'distance', label: '距离（公里）' }
    ];
  }

  return [
    { field: 'weight', label: '重量（kg）' },
    { field: 'reps', label: '次数' },
    { field: 'rir', label: '剩余次数 RIR' }
  ];
}

function getDetailForCurrentSelection() {
  if (appState.selectedRestDay) {
    return {
      isRestDay: true,
      restMessage: '今日休息 / 低强度有氧'
    };
  }

  return buildTrainingDayDetail({
    planDayId: appState.selectedPlanDayId || undefined
  });
}

function getFieldLabel(field) {
  const labels = {
    weight: '重量',
    reps: '次数',
    durationSeconds: '时长',
    setIndex: '组序号',
    completed: '完成状态'
  };

  return labels[field] || field;
}

function getSetErrorKey(exerciseId, setIndex) {
  return `${exerciseId}:${setIndex}`;
}

function getSetByIndex(session, exerciseId, setIndex) {
  const log = (Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [])
    .find((item) => item.exerciseId === exerciseId);

  if (!log || !Array.isArray(log.sets)) {
    return null;
  }

  return log.sets.find((set) => set.setIndex === setIndex) || null;
}

function formatSaveErrors(errors, detail) {
  const setErrors = errors && Array.isArray(errors.setErrors) ? errors.setErrors : [];
  const exerciseNames = new Map(
    (detail.exercises || []).map((item) => [
      item.exerciseId,
      item.detail && item.detail.nameZh ? item.detail.nameZh : item.exerciseId
    ])
  );

  if (setErrors.length === 0) {
    return ['请检查训练记录的必填内容。'];
  }

  return setErrors.map((error) =>
    `${exerciseNames.get(error.exerciseId) || '动作'} 第 ${error.setIndex || '-'} 组缺少${getFieldLabel(error.field)}。`
  );
}

function hasFilledNumber(value) {
  return value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value));
}

export function validateSetBeforeComplete({
  exercise,
  set,
  exerciseName = '动作',
  setIndex
}) {
  const trackingType = exercise && exercise.detail ? exercise.detail.trackingType : 'weight_reps';
  const missingFields = [];

  if (trackingType === 'weight_reps') {
    if (!hasFilledNumber(set && set.weight)) {
      missingFields.push('weight');
    }

    if (!hasFilledNumber(set && set.reps)) {
      missingFields.push('reps');
    }
  }

  if (trackingType === 'time_based' && !hasFilledNumber(set && set.durationSeconds)) {
    missingFields.push('durationSeconds');
  }

  if (missingFields.length === 0) {
    return {
      isValid: true,
      message: '',
      missingFields: []
    };
  }

  const missingText = missingFields
    .map((field) => getFieldLabel(field))
    .join('和');

  return {
    isValid: false,
    message: `${exerciseName} 第 ${setIndex || (set && set.setIndex) || '-'} 组还没填写${missingText}`,
    missingFields
  };
}

function getAnalysisCompletenessWarning(session, detail) {
  const exerciseDetailMap = getExerciseDetailMap(detail);
  const missingWeightReps = [];
  const missingTime = [];

  (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : []).forEach((log) => {
    const exercise = exerciseDetailMap.get(log.exerciseId);
    const trackingType = exercise && exercise.detail ? exercise.detail.trackingType : 'weight_reps';

    (Array.isArray(log.sets) ? log.sets : []).forEach((set) => {
      if (!set || set.completed !== true) {
        return;
      }

      if (trackingType === 'weight_reps' && (!hasFilledNumber(set.weight) || !hasFilledNumber(set.reps))) {
        missingWeightReps.push({ exerciseId: log.exerciseId, setIndex: set.setIndex });
      }

      if (trackingType === 'time_based' && !hasFilledNumber(set.durationSeconds)) {
        missingTime.push({ exerciseId: log.exerciseId, setIndex: set.setIndex });
      }
    });
  });

  if (missingWeightReps.length > 0 && missingTime.length > 0) {
    return '有已完成组缺少重量、次数或时长，保存后会影响数据分析。是否继续保存？';
  }

  if (missingWeightReps.length > 0) {
    return '有已完成组缺少重量或次数，保存后会影响数据分析。是否继续保存？';
  }

  if (missingTime.length > 0) {
    return '有已完成计时组缺少时长，保存后会影响数据分析。是否继续保存？';
  }

  return '';
}

function getWorkoutProgress(session) {
  const logs = Array.isArray(session.exerciseLogs) ? session.exerciseLogs : [];
  const totalSets = logs.reduce((count, log) => count + (Array.isArray(log.sets) ? log.sets.length : 0), 0);
  const completedSets = logs.reduce((count, log) =>
    count + (Array.isArray(log.sets) ? log.sets.filter((set) => set.completed === true).length : 0), 0);
  const completedExercises = logs.filter((log) =>
    Array.isArray(log.sets) && log.sets.some((set) => set.completed === true)
  ).length;
  const percent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return {
    totalSets,
    completedSets,
    totalExercises: logs.length,
    completedExercises,
    percent
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

function renderProgress(session) {
  const progress = getWorkoutProgress(session);
  const card = document.createElement('section');
  card.className = 'meta-card';

  const title = document.createElement('h2');
  title.textContent = '训练进度';
  card.appendChild(title);

  const grid = renderStatGrid([
    ['已完成组数', `${progress.completedSets} / ${progress.totalSets} 组`],
    ['动作进度', `${progress.completedExercises} / ${progress.totalExercises}`],
    ['完成度', `${progress.percent}%`]
  ]);
  card.appendChild(grid);

  return card;
}

function updateRestTimerView() {
  const element = document.querySelector('[data-rest-timer]');

  if (!element) {
    return;
  }

  element.textContent = restTimer.status || '完成一组后自动开始休息倒计时。';
}

function stopRestTimer(message = '') {
  if (restTimer.intervalId) {
    clearInterval(restTimer.intervalId);
  }

  restTimer = {
    secondsLeft: 0,
    status: message,
    intervalId: null
  };
  updateRestTimerView();
}

function startRestTimer(seconds) {
  const totalSeconds = Number(seconds);

  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return;
  }

  stopRestTimer();
  restTimer.secondsLeft = Math.round(totalSeconds);
  restTimer.status = `休息中：${restTimer.secondsLeft} 秒`;
  updateRestTimerView();

  restTimer.intervalId = setInterval(() => {
    restTimer.secondsLeft -= 1;

    if (restTimer.secondsLeft <= 0) {
      stopRestTimer('可以开始下一组');
      notifyRestFinished();
      return;
    }

    restTimer.status = `休息中：${restTimer.secondsLeft} 秒`;
    updateRestTimerView();
  }, 1000);
}

function renderRestTimer() {
  const card = document.createElement('section');
  card.className = 'meta-card';

  const title = document.createElement('h2');
  title.textContent = '组间休息';
  card.appendChild(title);

  const status = document.createElement('p');
  status.dataset.restTimer = 'true';
  status.textContent = restTimer.status || '完成一组后自动开始休息倒计时。';
  card.appendChild(status);

  const vibrationLabel = document.createElement('label');
  vibrationLabel.className = 'set-completed';
  const vibrationSwitch = document.createElement('input');
  vibrationSwitch.type = 'checkbox';
  vibrationSwitch.checked = appState.restVibrationEnabled;
  const vibrationText = document.createElement('span');
  vibrationText.textContent = `休息结束震动提醒：${appState.restVibrationEnabled ? '开启' : '关闭'}`;
  vibrationSwitch.addEventListener('change', () => {
    setRestVibrationEnabled(vibrationSwitch.checked);
    vibrationText.textContent = `休息结束震动提醒：${appState.restVibrationEnabled ? '开启' : '关闭'}`;
  });
  vibrationLabel.appendChild(vibrationSwitch);
  vibrationLabel.appendChild(vibrationText);
  card.appendChild(vibrationLabel);

  const skip = document.createElement('button');
  skip.className = 'secondary-button';
  skip.textContent = '跳过倒计时';
  skip.addEventListener('click', () => stopRestTimer('可以开始下一组'));
  card.appendChild(skip);

  return card;
}

function formatLastSet(set) {
  if (set.durationSeconds !== null && set.durationSeconds !== undefined && set.durationSeconds !== '') {
    return `第 ${set.setIndex} 组：${set.durationSeconds} 秒${set.rir !== null && set.rir !== undefined ? `，RIR ${set.rir}` : ''}`;
  }

  if (set.weight !== null && set.weight !== undefined && set.reps !== null && set.reps !== undefined) {
    return `第 ${set.setIndex} 组：${set.weight}${set.weightUnit || 'kg'} × ${set.reps}${set.rir !== null && set.rir !== undefined ? `，RIR ${set.rir}` : ''}`;
  }

  if (set.reps !== null && set.reps !== undefined) {
    return `第 ${set.setIndex} 组：${set.reps} 次${set.rir !== null && set.rir !== undefined ? `，RIR ${set.rir}` : ''}`;
  }

  return `第 ${set.setIndex} 组：已完成`;
}

function renderLastPerformance(exerciseId) {
  const performance = getLastExercisePerformance(exerciseId, {
    excludeSessionId: appState.activeSession && appState.activeSession.id
  });
  const card = document.createElement('div');
  card.className = 'last-record';

  const title = document.createElement('strong');
  title.textContent = '上次记录';
  card.appendChild(title);

  if (!performance || !Array.isArray(performance.sets) || performance.sets.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = '暂无上次记录';
    card.appendChild(empty);
    return card;
  }

  const list = document.createElement('ul');
  performance.sets.forEach((set) => {
    const item = document.createElement('li');
    item.textContent = formatLastSet(set);
    list.appendChild(item);
  });
  card.appendChild(list);
  return card;
}

function renderWeightRecommendation(exercise, planExercise, history, userProfile) {
  const lastExerciseLog = getLastCompletedExerciseLog(planExercise.exerciseId, history);
  const recommendation = recommendWeightForTarget({
    exercise,
    planExercise,
    lastExerciseLog,
    userProfile
  });
  const card = document.createElement('div');
  card.className = 'recommendation-card';

  const title = document.createElement('strong');
  title.textContent = '本次建议';
  card.appendChild(title);

  const disclaimer = document.createElement('p');
  disclaimer.textContent = '建议重量仅供参考，请以动作稳定和 RIR 为准。';
  card.appendChild(disclaimer);

  const value = document.createElement('p');
  if (recommendation.type === 'time') {
    value.textContent = `建议时长：${recommendation.suggestedDurationText || '暂无建议'}`;
  } else {
    value.textContent = `建议使用：${recommendation.suggestedWeightText || '暂无建议'}`;
  }
  card.appendChild(value);

  if (recommendation.rawEstimatedWeightText) {
    const raw = document.createElement('p');
    raw.textContent = `原始估算：${recommendation.rawEstimatedWeightText}`;
    card.appendChild(raw);
  }

  if (recommendation.roundingNote) {
    const rounding = document.createElement('p');
    rounding.textContent = `取整说明：${recommendation.roundingNote}`;
    card.appendChild(rounding);
  }

  const strategy = document.createElement('p');
  strategy.textContent = `策略：${recommendation.strategy}`;
  card.appendChild(strategy);

  const reason = document.createElement('p');
  reason.textContent = `原因：${recommendation.reason}`;
  card.appendChild(reason);

  if (recommendation.suggestedRepsText) {
    const reps = document.createElement('p');
    reps.textContent = `建议次数：${recommendation.suggestedRepsText}`;
    card.appendChild(reps);
  }

  return card;
}

function renderSetInput(log, set, exercise, onChange, error = null) {
  const row = document.createElement('div');
  row.className = 'set-row';

  if (error) {
    row.classList.add('set-row-error');
  }

  const label = document.createElement('span');
  label.className = 'set-title';
  label.textContent = `第 ${set.setIndex} 组`;
  row.appendChild(label);

  getSetFields(exercise).forEach(({ field, label: fieldLabel }) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'field-label';
    wrapper.append(fieldLabel);

    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = field === 'weight' || field === 'distance' ? 'decimal' : 'numeric';
    input.min = '0';
    input.step = field === 'weight' || field === 'distance' ? '0.5' : '1';
    input.placeholder = fieldLabel;
    input.value = set[field] ?? '';
    input.dataset.field = field;
    input.addEventListener('input', () => onChange(log.exerciseId, set.setIndex, setPatchFromInput(input)));
    wrapper.appendChild(input);
    row.appendChild(wrapper);
  });

  const completedLabel = document.createElement('label');
  completedLabel.className = 'set-completed';
  const completed = document.createElement('input');
  completed.type = 'checkbox';
  completed.checked = set.completed;
  completed.dataset.field = 'completed';
  completed.addEventListener('change', () => onChange(log.exerciseId, set.setIndex, setPatchFromInput(completed), set.completed, exercise));
  completedLabel.appendChild(completed);
  completedLabel.append('已完成');
  row.appendChild(completedLabel);

  if (error) {
    const errorText = document.createElement('p');
    errorText.className = 'set-error-text';
    errorText.textContent = error.message;
    row.appendChild(errorText);
  }

  return row;
}

function renderWorkoutSummary(root, summary, detail, savedSession) {
  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  const hero = document.createElement('section');
  hero.className = 'hero-card';
  hero.innerHTML = `<p class="eyebrow">训练已保存</p><h1>${detail.nameZh}</h1><p>${summary.date}</p>`;
  page.appendChild(hero);

  const stats = document.createElement('section');
  stats.className = 'exercise';
  const title = document.createElement('h2');
  title.textContent = '训练总结';
  stats.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'target-grid';
  [
    ['训练时长', `${summary.durationMinutes} 分钟`],
    ['完成动作', `${summary.completedExerciseCount} 个`],
    ['完成组数', `${summary.completedSetCount} / ${summary.totalSetCount} 组`],
    ['总训练容量', `${summary.totalVolume} kg·次`],
    ['计时完成', `${summary.completedTimeSeconds} 秒`]
  ].forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'target-pill';
    item.innerHTML = `<span class="stat-label">${label}</span><span class="stat-value">${value}</span>`;
    grid.appendChild(item);
  });
  stats.appendChild(grid);
  page.appendChild(stats);

  const progressSummary = buildWorkoutProgressSummary(savedSession, readWorkoutHistory());
  const progressCard = document.createElement('section');
  progressCard.className = 'exercise';
  const progressTitle = document.createElement('h2');
  progressTitle.textContent = '本次进步提示';
  progressCard.appendChild(progressTitle);
  progressCard.appendChild(renderStatGrid([
    ['本次总容量', `${progressSummary.totalVolume} kg·次`],
    ['同训练日对比', progressSummary.status],
    ['容量变化', `${progressSummary.diff > 0 ? '+' : ''}${progressSummary.diff} kg·次`],
    ['对比基准', progressSummary.previousSameDayVolume ? `${progressSummary.previousSameDayVolume} kg·次` : '-']
  ]));
  progressSummary.exerciseSummaries.forEach((item) => {
    const line = document.createElement('p');
    line.textContent = `${item.nameZh}：${item.message}${item.status === '下降' ? ' 建议下次注意恢复。' : item.status === '进步' ? ' 建议下次维持或小幅加重。' : ''}`;
    progressCard.appendChild(line);
  });
  page.appendChild(progressCard);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const historyButton = document.createElement('button');
  historyButton.textContent = '查看训练记录';
  historyButton.addEventListener('click', () => navigateTo('history'));
  actions.appendChild(historyButton);

  const todayButton = document.createElement('button');
  todayButton.className = 'secondary-button';
  todayButton.textContent = '返回今日训练';
  todayButton.addEventListener('click', () => navigateTo('today'));
  actions.appendChild(todayButton);

  page.appendChild(actions);
  root.appendChild(page);
}

function renderSession(root, session, detail, messages = []) {
  const exerciseDetailMap = getExerciseDetailMap(detail);
  const history = readWorkoutHistory();
  const userProfile = readUserTrainingProfile();

  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  const title = document.createElement('h1');
  title.textContent = '训练记录';
  page.appendChild(title);

  if (messages.length > 0) {
    const notice = document.createElement('div');
    notice.className = 'notice';
    const strong = document.createElement('strong');
    strong.textContent = '保存失败';
    notice.appendChild(strong);
    const list = document.createElement('ul');
    messages.forEach((message) => {
      const item = document.createElement('li');
      item.textContent = message;
      list.appendChild(item);
    });
    notice.appendChild(list);
    page.appendChild(notice);
  }

  const meta = document.createElement('p');
  meta.textContent = `${session.date} / ${detail.nameZh}`;
  page.appendChild(meta);
  page.appendChild(renderProgress(session));
  page.appendChild(renderRestTimer());

  const onSetChange = (exerciseId, setIndex, patch, wasCompleted = false, exercise = null) => {
    const errorKey = getSetErrorKey(exerciseId, setIndex);
    const exerciseName = exercise && exercise.detail ? exercise.detail.nameZh : exerciseId;
    const currentSet = getSetByIndex(appState.activeSession, exerciseId, setIndex) || {};

    if (patch.completed === true && wasCompleted !== true) {
      const nextSet = { ...currentSet, ...patch };
      const validation = validateSetBeforeComplete({
        exercise,
        set: nextSet,
        exerciseName,
        setIndex
      });

      if (!validation.isValid) {
        setCompletionErrors[errorKey] = validation;
        appState.activeSession = updateWorkoutSet(appState.activeSession, exerciseId, setIndex, { completed: false });
        renderSession(root, appState.activeSession, detail);
        return;
      }

      delete setCompletionErrors[errorKey];
    }

    appState.activeSession = updateWorkoutSet(appState.activeSession, exerciseId, setIndex, patch);
    const becameCompleted = patch.completed === true && wasCompleted !== true;

    if (patch.completed !== true && setCompletionErrors[errorKey]) {
      const updatedSet = getSetByIndex(appState.activeSession, exerciseId, setIndex) || {};
      const validation = validateSetBeforeComplete({
        exercise,
        set: updatedSet,
        exerciseName,
        setIndex
      });

      if (validation.isValid || patch.completed === false) {
        delete setCompletionErrors[errorKey];
      } else {
        setCompletionErrors[errorKey] = validation;
      }
    }

    renderSession(root, appState.activeSession, detail);

    if (becameCompleted) {
      startRestTimer(exercise && exercise.target ? exercise.target.restSeconds : 0);
    }
  };

  session.exerciseLogs.forEach((log) => {
    const exercise = exerciseDetailMap.get(log.exerciseId);
    const fullExercise = getFullExercise(log.exerciseId);
    const card = document.createElement('article');
    card.className = 'exercise';

    const name = document.createElement('h3');
    name.textContent = exercise && exercise.detail ? exercise.detail.nameZh : log.exerciseId;
    card.appendChild(name);
    card.appendChild(renderLastPerformance(log.exerciseId));
    card.appendChild(renderWeightRecommendation(fullExercise, exercise, history, userProfile));

    log.sets.forEach((set) => {
      const error = setCompletionErrors[getSetErrorKey(log.exerciseId, set.setIndex)] || null;
      card.appendChild(renderSetInput(log, set, exercise, onSetChange, error));
    });
    page.appendChild(card);
  });

  const noteLabel = document.createElement('label');
  noteLabel.textContent = '训练备注';
  const notes = document.createElement('textarea');
  notes.placeholder = '记录今天的状态、动作感受或需要下次注意的地方。';
  notes.value = session.notes || '';
  notes.addEventListener('input', () => {
    appState.activeSession = {
      ...appState.activeSession,
      notes: notes.value
    };
  });
  noteLabel.appendChild(notes);
  page.appendChild(noteLabel);

  const secondaryActions = document.createElement('div');
  secondaryActions.className = 'actions';

  const backButton = document.createElement('button');
  backButton.className = 'secondary-button';
  backButton.textContent = '返回详情';
  backButton.addEventListener('click', () => navigateTo('detail'));
  secondaryActions.appendChild(backButton);
  page.appendChild(secondaryActions);

  const actions = document.createElement('div');
  actions.className = 'sticky-actions';

  const saveButton = document.createElement('button');
  saveButton.textContent = '完成训练';
  saveButton.addEventListener('click', () => {
    const analysisWarning = getAnalysisCompletenessWarning(appState.activeSession, detail);

    if (analysisWarning && !window.confirm(analysisWarning)) {
      return;
    }

    const result = saveWorkoutSession(appState.activeSession, {
      notes: notes.value,
      allowIncompleteAnalysisData: Boolean(analysisWarning)
    });
    appState.lastSaveResult = result;

    if (!result.ok) {
      console.error('训练保存校验失败：', result.errors);
      renderSession(root, result.session, detail, formatSaveErrors(result.errors, detail));
      return;
    }

    appState.activeSession = null;
    appState.lastWorkoutSummary = buildWorkoutSummary(result.session);
    renderWorkoutSummary(root, appState.lastWorkoutSummary, detail, result.session);
  });
  actions.appendChild(saveButton);

  page.appendChild(actions);

  root.appendChild(page);
}

export function renderWorkoutRecordPage(root) {
  const detail = getDetailForCurrentSelection();

  if (detail.isRestDay) {
    root.innerHTML = [
      '<section class="page">',
      '<div class="hero-card">',
      '<h1>今日休息 / 低强度有氧</h1>',
      '<p>休息日不需要创建训练记录。可以返回首页手动选择训练日，或查看训练记录。</p>',
      '<div class="actions">',
      '<button id="goToday" class="secondary-button">手动选择训练日</button>',
      '<button id="goHistory">查看训练记录</button>',
      '</div>',
      '</div>',
      '</section>'
    ].join('');
    document.querySelector('#goToday').addEventListener('click', () => navigateTo('today'));
    document.querySelector('#goHistory').addEventListener('click', () => navigateTo('history'));
    return;
  }

  if (!appState.activeSession || appState.activeSession.planDayId !== detail.planDayId) {
    appState.activeSession = createWorkoutSession({
      planDayId: appState.selectedPlanDayId || undefined
    });
  }

  renderSession(root, appState.activeSession, detail);
}
