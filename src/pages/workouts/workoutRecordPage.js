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
let selectedRecordExerciseId = '';
const ACTIVE_WORKOUT_DRAFT_STORAGE_KEY = 'activeWorkoutDraft.v1';

const memoryStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

function getRuntimeStorage() {
  if (typeof wx !== 'undefined' && wx && wx.getStorageSync && wx.setStorageSync && wx.removeStorageSync) {
    return {
      getItem(key) {
        const value = wx.getStorageSync(key);
        return value === undefined || value === null || value === '' ? null : JSON.stringify(value);
      },
      setItem(key, value) {
        wx.setStorageSync(key, JSON.parse(value));
      },
      removeItem(key) {
        wx.removeStorageSync(key);
      }
    };
  }

  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }

  return memoryStorage;
}

function getExerciseDetailMap(detail) {
  return new Map(detail.exercises.map((item) => [item.exerciseId, item]));
}

function getFullExercise(exerciseId) {
  return exercises.find((exercise) => exercise.id === exerciseId) || null;
}

function setPatchFromInput(input) {
  const field = input.dataset.field;

  return { [field]: toNumberOrNull(input.value) };
}

function readWorkoutDraft() {
  const storage = getRuntimeStorage();

  try {
    const raw = storage.getItem(ACTIVE_WORKOUT_DRAFT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.session ? parsed : null;
  } catch {
    return null;
  }
}

function saveWorkoutDraft(session, detail) {
  const storage = getRuntimeStorage();

  if (!session || !detail || detail.isRestDay) {
    return;
  }

  storage.setItem(ACTIVE_WORKOUT_DRAFT_STORAGE_KEY, JSON.stringify({
    planDayId: detail.planDayId,
    exerciseIds: getDetailExerciseIds(detail),
    session,
    updatedAt: new Date().toISOString()
  }));
}

function clearWorkoutDraft() {
  const storage = getRuntimeStorage();

  if (storage && storage.removeItem) {
    storage.removeItem(ACTIVE_WORKOUT_DRAFT_STORAGE_KEY);
  }
}

function getSetFields(exercise) {
  const trackingType = exercise && exercise.detail ? exercise.detail.trackingType : 'weight_reps';

  if (trackingType === 'time_based') {
    return [{ field: 'durationSeconds', label: '时长（秒）' }];
  }

  if (trackingType === 'reps_only') {
    return [{ field: 'reps', label: '次数' }];
  }

  if (trackingType === 'distance_time') {
    return [
      { field: 'durationSeconds', label: '时长（秒）' },
      { field: 'distance', label: '距离（公里）' }
    ];
  }

  return [
    { field: 'weight', label: '重量（kg）' },
    { field: 'reps', label: '次数' }
  ];
}

function shouldTrackRir(exercise) {
  const trackingType = exercise && exercise.detail ? exercise.detail.trackingType : 'weight_reps';
  return trackingType === 'weight_reps' || trackingType === 'reps_only';
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
    rir: 'RIR',
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

  if (shouldTrackRir(exercise) && !hasFilledNumber(set && set.rir)) {
    missingFields.push('rir');
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

function renderTrainingStatus(session) {
  const progress = getWorkoutProgress(session);
  const card = document.createElement('section');
  card.className = 'training-status-card';

  const header = document.createElement('div');
  header.className = 'training-status-header';

  const title = document.createElement('strong');
  title.textContent = `${progress.completedSets}/${progress.totalSets} 组`;
  header.appendChild(title);

  const meta = document.createElement('span');
  meta.textContent = `${progress.completedExercises}/${progress.totalExercises} 个动作 · ${progress.percent}%`;
  header.appendChild(meta);
  card.appendChild(header);

  const bar = document.createElement('div');
  bar.className = 'feedback-progress training-status-progress';
  bar.innerHTML = `<span style="width: ${progress.percent}%"></span>`;
  card.appendChild(bar);

  const restLine = document.createElement('div');
  restLine.className = 'training-status-rest';

  const status = document.createElement('span');
  status.dataset.restTimer = 'true';
  status.textContent = restTimer.status || '完成一组后自动休息';
  restLine.appendChild(status);

  const skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'secondary-button compact-button';
  skip.textContent = '跳过';
  skip.addEventListener('click', () => stopRestTimer('可以开始下一组'));
  restLine.appendChild(skip);
  card.appendChild(restLine);

  const options = document.createElement('details');
  options.className = 'compact-details';
  const summary = document.createElement('summary');
  summary.textContent = '休息提醒设置';
  options.appendChild(summary);

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
  options.appendChild(vibrationLabel);
  card.appendChild(options);

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

function summarizeLastPerformance(exerciseId) {
  const performance = getLastExercisePerformance(exerciseId, {
    excludeSessionId: appState.activeSession && appState.activeSession.id
  });

  if (!performance || !Array.isArray(performance.sets) || performance.sets.length === 0) {
    return null;
  }

  const weights = performance.sets.map((set) => toNumberOrNull(set.weight)).filter((value) => value !== null);
  const reps = performance.sets.map((set) => toNumberOrNull(set.reps)).filter((value) => value !== null);
  const rirs = performance.sets.map((set) => toNumberOrNull(set.rir)).filter((value) => value !== null);
  const durations = performance.sets.map((set) => toNumberOrNull(set.durationSeconds)).filter((value) => value !== null);
  const uniqueWeights = [...new Set(weights)];

  return {
    date: performance.date || '',
    weightText: uniqueWeights.length === 1
      ? `${uniqueWeights[0]}kg`
      : uniqueWeights.length > 1
        ? `${Math.min(...uniqueWeights)}-${Math.max(...uniqueWeights)}kg`
        : '',
    repsText: reps.length > 0 ? reps.join(' / ') : '',
    durationText: durations.length > 0 ? durations.map((value) => `${value}秒`).join(' / ') : '',
    averageRir: rirs.length > 0
      ? Number((rirs.reduce((sum, value) => sum + value, 0) / rirs.length).toFixed(1))
      : null
  };
}

function renderExerciseGuidance(exerciseId, exercise, planExercise, history, userProfile) {
  const performance = summarizeLastPerformance(exerciseId);
  const lastExerciseLog = getLastCompletedExerciseLog(planExercise.exerciseId, history);
  const recommendation = recommendWeightForTarget({
    exercise,
    planExercise,
    lastExerciseLog,
    userProfile
  });
  const wrapper = document.createElement('section');
  wrapper.className = 'exercise-guidance';

  const last = document.createElement('div');
  last.className = 'guidance-block';
  last.innerHTML = performance
    ? `<span class="guidance-label">上次训练${performance.date ? ` · ${performance.date}` : ''}</span>
       <strong>${performance.weightText || performance.durationText || '已完成'}</strong>
       <span>${performance.repsText ? `${performance.repsText} 次` : performance.durationText}${performance.averageRir !== null ? ` · 平均 RIR ${performance.averageRir}` : ''}</span>`
    : '<span class="guidance-label">上次训练</span><strong>暂无记录</strong><span>本次先建立可靠基准</span>';
  wrapper.appendChild(last);

  const today = document.createElement('div');
  today.className = 'guidance-block guidance-today';
  const suggestedValue = recommendation.type === 'time'
    ? recommendation.suggestedDurationText
    : recommendation.suggestedWeightText;
  today.innerHTML = `<span class="guidance-label">今天建议</span>
    <strong>${suggestedValue || '自主选择'}</strong>
    <span>${recommendation.suggestedRepsText ? `目标 ${recommendation.suggestedRepsText}` : recommendation.strategy}</span>
    <span class="guidance-strategy">${recommendation.strategy}</span>`;
  wrapper.appendChild(today);

  const reason = document.createElement('details');
  reason.className = 'guidance-reason';
  const summary = document.createElement('summary');
  summary.textContent = '为什么这样建议';
  reason.appendChild(summary);
  const explanation = document.createElement('p');
  explanation.textContent = recommendation.reason;
  reason.appendChild(explanation);
  wrapper.appendChild(reason);

  return wrapper;
}

const RIR_OPTIONS = [
  { value: 0, label: '0', hint: '力竭' },
  { value: 1, label: '1', hint: '约1次' },
  { value: 2, label: '2', hint: '约2次' },
  { value: 3, label: '3', hint: '约3次' },
  { value: 4, label: '4+', hint: '余力足' }
];

function renderRirPicker(log, set, onChange) {
  const wrapper = document.createElement('div');
  wrapper.className = 'rir-picker';
  const currentRir = toNumberOrNull(set.rir);

  const heading = document.createElement('div');
  heading.className = 'rir-picker-heading';
  heading.innerHTML = '<strong>RIR</strong><span>这组结束时，还能再做几次？</span>';
  wrapper.appendChild(heading);

  const choices = document.createElement('div');
  choices.className = 'rir-options';
  const buttons = [];

  RIR_OPTIONS.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rir-option';
    button.innerHTML = `<strong>${option.label}</strong><span>${option.hint}</span>`;
    button.setAttribute('aria-label', `RIR ${option.label}，${option.hint}`);
    button.setAttribute('aria-pressed', String(currentRir === option.value));

    if (currentRir === option.value) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      onChange(log.exerciseId, set.setIndex, { rir: option.value });
      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
    });
    buttons.push(button);
    choices.appendChild(button);
  });

  wrapper.appendChild(choices);
  return wrapper;
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

  if (shouldTrackRir(exercise)) {
    row.appendChild(renderRirPicker(log, set, onChange));
  }

  const completed = document.createElement('button');
  completed.type = 'button';
  completed.className = set.completed ? 'set-complete-button set-complete-button-done' : 'set-complete-button secondary-button';
  completed.textContent = set.completed ? '已完成本组' : '完成本组';
  completed.dataset.field = 'completed';
  completed.addEventListener('click', () => onChange(
    log.exerciseId,
    set.setIndex,
    { completed: !set.completed },
    set.completed,
    exercise
  ));
  row.appendChild(completed);

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

function getSessionExerciseIds(session) {
  return (Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [])
    .map((log) => log.exerciseId);
}

function getDetailExerciseIds(detail) {
  return (Array.isArray(detail && detail.exercises) ? detail.exercises : [])
    .map((exercise) => exercise.exerciseId);
}

function hasSameExerciseOrder(session, detail) {
  const sessionIds = getSessionExerciseIds(session);
  const detailIds = getDetailExerciseIds(detail);

  return sessionIds.length === detailIds.length && sessionIds.every((exerciseId, index) => exerciseId === detailIds[index]);
}

function getRestorableDraftSession(detail) {
  const draft = readWorkoutDraft();

  if (!draft || !draft.session || draft.planDayId !== detail.planDayId) {
    return null;
  }

  return hasSameExerciseOrder(draft.session, detail) ? draft.session : null;
}

function isExerciseLogComplete(log) {
  return Array.isArray(log && log.sets) && log.sets.length > 0 && log.sets.every((set) => set.completed === true);
}

function getFirstIncompleteExerciseId(session) {
  const log = (Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [])
    .find((item) => !isExerciseLogComplete(item));

  return log ? log.exerciseId : '';
}

function getNextIncompleteExerciseId(session, currentExerciseId) {
  const logs = Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [];
  const currentIndex = logs.findIndex((log) => log.exerciseId === currentExerciseId);
  const ordered = currentIndex >= 0
    ? [...logs.slice(currentIndex + 1), ...logs.slice(0, currentIndex + 1)]
    : logs;
  const next = ordered.find((log) => !isExerciseLogComplete(log));

  return next ? next.exerciseId : currentExerciseId;
}

function getExerciseName(log, exerciseDetailMap) {
  const exercise = exerciseDetailMap.get(log.exerciseId);
  return exercise && exercise.detail ? exercise.detail.nameZh : log.exerciseId;
}

function getCurrentExerciseLog(session) {
  const logs = Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [];

  if (logs.length === 0) {
    return null;
  }

  if (!selectedRecordExerciseId || !logs.some((log) => log.exerciseId === selectedRecordExerciseId)) {
    selectedRecordExerciseId = getFirstIncompleteExerciseId(session) || logs[0].exerciseId;
  }

  return logs.find((log) => log.exerciseId === selectedRecordExerciseId) || logs[0];
}

function renderExerciseSwitcher(session, exerciseDetailMap, onSelect) {
  const logs = Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [];
  const activeIndex = logs.findIndex((log) => log.exerciseId === selectedRecordExerciseId);
  const card = document.createElement('section');
  card.className = 'exercise-switcher';

  const status = document.createElement('div');
  status.className = 'exercise-switcher-status';
  const activeText = activeIndex >= 0 ? `${activeIndex + 1}/${logs.length}` : `1/${logs.length}`;
  status.innerHTML = `<strong>当前动作 ${activeText}</strong><span>只显示一个动作，减少上下滑动</span>`;
  card.appendChild(status);

  const select = document.createElement('select');
  logs.forEach((log, index) => {
    const option = document.createElement('option');
    option.value = log.exerciseId;
    option.textContent = `${index + 1}. ${getExerciseName(log, exerciseDetailMap)}${isExerciseLogComplete(log) ? ' · 已完成' : ''}`;
    select.appendChild(option);
  });
  select.value = selectedRecordExerciseId;
  select.addEventListener('change', () => onSelect(select.value));
  card.appendChild(select);

  const controls = document.createElement('div');
  controls.className = 'exercise-switcher-controls';

  const previous = document.createElement('button');
  previous.type = 'button';
  previous.className = 'secondary-button';
  previous.textContent = '上一个动作';
  previous.disabled = activeIndex <= 0;
  previous.addEventListener('click', () => {
    if (activeIndex > 0) {
      onSelect(logs[activeIndex - 1].exerciseId);
    }
  });
  controls.appendChild(previous);

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'secondary-button';
  next.textContent = '下一个动作';
  next.disabled = activeIndex < 0 || activeIndex >= logs.length - 1;
  next.addEventListener('click', () => {
    if (activeIndex >= 0 && activeIndex < logs.length - 1) {
      onSelect(logs[activeIndex + 1].exerciseId);
    }
  });
  controls.appendChild(next);

  card.appendChild(controls);
  return card;
}

function renderSession(root, session, detail, messages = []) {
  const exerciseDetailMap = getExerciseDetailMap(detail);
  const history = readWorkoutHistory();
  const userProfile = readUserTrainingProfile();

  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  const header = document.createElement('section');
  header.className = 'record-header';
  header.innerHTML = `<p class="eyebrow">训练中</p><h1>${detail.nameZh}</h1><p>${session.date}</p>`;
  page.appendChild(header);

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

  page.appendChild(renderTrainingStatus(session));
  getCurrentExerciseLog(session);
  page.appendChild(renderExerciseSwitcher(session, exerciseDetailMap, (exerciseId) => {
    selectedRecordExerciseId = exerciseId;
    renderSession(root, appState.activeSession, detail);
  }));

  const onSetChange = (exerciseId, setIndex, patch, wasCompleted = false, exercise = null) => {
    const errorKey = getSetErrorKey(exerciseId, setIndex);
    const exerciseName = exercise && exercise.detail ? exercise.detail.nameZh : exerciseId;
    const currentSet = getSetByIndex(appState.activeSession, exerciseId, setIndex) || {};
    const isCompletionChange = Object.prototype.hasOwnProperty.call(patch, 'completed');

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
    saveWorkoutDraft(appState.activeSession, detail);
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

    if (!isCompletionChange) {
      return;
    }

    if (becameCompleted) {
      const updatedLog = (Array.isArray(appState.activeSession.exerciseLogs) ? appState.activeSession.exerciseLogs : [])
        .find((log) => log.exerciseId === exerciseId);

      if (isExerciseLogComplete(updatedLog)) {
        selectedRecordExerciseId = getNextIncompleteExerciseId(appState.activeSession, exerciseId);
      }
    }

    renderSession(root, appState.activeSession, detail);

    if (becameCompleted) {
      startRestTimer(exercise && exercise.target ? exercise.target.restSeconds : 0);
    }
  };

  const activeLog = getCurrentExerciseLog(session);

  if (activeLog) {
    const log = activeLog;
    const exercise = exerciseDetailMap.get(log.exerciseId);
    const fullExercise = getFullExercise(log.exerciseId);
    const card = document.createElement('article');
    card.className = 'exercise';

    const name = document.createElement('h3');
    name.textContent = exercise && exercise.detail ? exercise.detail.nameZh : log.exerciseId;
    card.appendChild(name);

    card.appendChild(renderExerciseGuidance(log.exerciseId, fullExercise, exercise, history, userProfile));

    log.sets.forEach((set) => {
      const error = setCompletionErrors[getSetErrorKey(log.exerciseId, set.setIndex)] || null;
      card.appendChild(renderSetInput(log, set, exercise, onSetChange, error));
    });
    page.appendChild(card);
  }

  const notePanel = document.createElement('details');
  notePanel.className = 'exercise compact-details';
  const noteSummary = document.createElement('summary');
  noteSummary.textContent = '训练备注';
  notePanel.appendChild(noteSummary);
  const noteLabel = document.createElement('label');
  noteLabel.textContent = '备注内容';
  const notes = document.createElement('textarea');
  notes.placeholder = '记录今天的状态、动作感受或需要下次注意的地方。';
  notes.value = session.notes || '';
  notes.addEventListener('input', () => {
    appState.activeSession = {
      ...appState.activeSession,
      notes: notes.value
    };
    saveWorkoutDraft(appState.activeSession, detail);
  });
  noteLabel.appendChild(notes);
  notePanel.appendChild(noteLabel);
  page.appendChild(notePanel);

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
    clearWorkoutDraft();
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

  if (!appState.activeSession) {
    appState.activeSession = getRestorableDraftSession(detail) || createWorkoutSession({
      planDayId: appState.selectedPlanDayId || undefined
    });
    saveWorkoutDraft(appState.activeSession, detail);
  }

  if (
    appState.activeSession.planDayId !== detail.planDayId ||
    !hasSameExerciseOrder(appState.activeSession, detail)
  ) {
    appState.activeSession = createWorkoutSession({
      planDayId: appState.selectedPlanDayId || undefined
    });
    saveWorkoutDraft(appState.activeSession, detail);
  }

  renderSession(root, appState.activeSession, detail);
}
