import { exercises as defaultExercises } from '../exercises/exercises.js';

export const USER_TRAINING_PROFILE_STORAGE_KEY = 'userTrainingProfile.v1';
export const EQUIPMENT_WEIGHT_RULES_STORAGE_KEY = 'equipmentWeightRules.v1';

export const equipmentWeightRules = {
  dumbbell: {
    incrementKg: 2.5,
    note: '哑铃按 2.5kg 档位取整。'
  },
  barbell: {
    incrementKg: 2.5,
    note: '杠铃按 2.5kg 档位取整。'
  },
  cable_machine: {
    incrementKg: 5,
    note: '绳索器械按 5kg 档位取整。'
  },
  machine: {
    incrementKg: 5,
    note: '固定器械按 5kg 档位取整。'
  },
  bodyweight: {
    incrementKg: null,
    note: '自重动作不推荐训练重量。'
  }
};

const defaultProfile = {
  bodyWeightKg: 65,
  heightCm: 175,
  trainingExperienceYears: 2.5,
  goal: 'body_recomposition',
  strengthLevel: 'intermediate',
  note: '目标：增肌，同时体脂略微下降。杠铃卧推 60kg × 5 只作为背景参考，不能直接等同于哑铃卧推。',
  baselineLifts: [
    {
      exerciseId: 'barbell_bench_press',
      weight: 60,
      weightUnit: 'kg',
      reps: 5,
      rir: 0,
      sourceType: 'user_reported_max',
      confidence: 'high',
      note: '用户反馈杠铃卧推 60kg × 5。仅作为原始力量背景，不直接等同于哑铃卧推。'
    },
    {
      exerciseId: 'db_bench_press',
      weight: 20,
      weightUnit: 'kg',
      reps: 10,
      rir: 2,
      sourceType: 'estimated_from_related_lift',
      confidence: 'medium',
      relatedLift: {
        exerciseId: 'barbell_bench_press',
        nameZh: '杠铃卧推',
        weight: 60,
        weightUnit: 'kg',
        reps: 5,
        sourceType: 'user_reported_max',
        confidence: 'high'
      },
      note: '单只哑铃重量。杠铃卧推 60kg × 5 不直接换算为哑铃卧推，先从单只 20kg 起步，状态好再到 22.5kg。'
    },
    {
      exerciseId: 'lat_pulldown',
      weight: 50,
      weightUnit: 'kg',
      reps: 6,
      rir: 2,
      sourceType: 'user_reported_working_set',
      confidence: 'high',
      recommendedStartWeight: 45,
      note: '高位下拉用户反馈 50kg × 6；训练建议从 42.5-45kg 保守起步。'
    },
    {
      exerciseId: 'seated_db_shoulder_press',
      weight: 20,
      weightUnit: 'kg',
      reps: 10,
      rir: 2,
      sourceType: 'user_reported_working_set',
      confidence: 'high',
      recommendedStartWeight: 17.5,
      note: '单只哑铃重量。用户反馈单只 20kg × 10；建议从 17.5kg 起步，状态好再用 20kg。'
    },
    {
      exerciseId: 'seated_cable_row',
      weight: 42.5,
      weightUnit: 'kg',
      reps: 10,
      rir: 2,
      sourceType: 'estimated_from_related_lift',
      confidence: 'low',
      weightRangeKg: {
        min: 40,
        max: 45
      },
      note: '用户忘记坐姿划船重量，先按 40-45kg 保守估算。'
    },
    {
      exerciseId: 'chest_supported_row',
      weight: 42.5,
      weightUnit: 'kg',
      reps: 10,
      rir: 2,
      sourceType: 'estimated_from_related_lift',
      confidence: 'low',
      weightRangeKg: {
        min: 40,
        max: 45
      },
      note: '作为划船类动作保守参考，实际以器械手感和动作稳定为准。'
    },
    {
      exerciseId: 'back_squat',
      weight: 40,
      weightUnit: 'kg',
      reps: 6,
      rir: 3,
      sourceType: 'technique_start_weight',
      confidence: 'medium',
      note: '深蹲很少练，不按体重强行估极限，先使用技术重量。'
    },
    {
      exerciseId: 'romanian_deadlift',
      weight: 45,
      weightUnit: 'kg',
      reps: 8,
      rir: 3,
      sourceType: 'technique_start_weight',
      confidence: 'medium',
      weightRangeKg: {
        min: 40,
        max: 50
      },
      note: '硬拉/RDL 很少练，不按体重强行估极限，先按 40-50kg 技术重量。'
    }
  ]
};

const memoryStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  }
};

function getRuntimeStorage() {
  if (typeof wx !== 'undefined' && wx && wx.getStorageSync && wx.setStorageSync) {
    return {
      getItem(key) {
        const value = wx.getStorageSync(key);
        return value ? JSON.stringify(value) : null;
      },
      setItem(key, value) {
        wx.setStorageSync(key, JSON.parse(value));
      }
    };
  }

  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }

  return memoryStorage;
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getExerciseMap(exerciseList = defaultExercises) {
  return new Map((Array.isArray(exerciseList) ? exerciseList : []).map((exercise) => [exercise.id, exercise]));
}

function getSessionEndTime(session) {
  return new Date(session.endedAt || session.startedAt || session.date || 0).getTime();
}

function getCompletedSets(log) {
  return Array.isArray(log && log.sets) ? log.sets.filter((set) => {
    if (set && set.completed === true) {
      return true;
    }

    return set && set.completed === undefined && (
      toNumberOrNull(set.weight) !== null ||
      toNumberOrNull(set.reps) !== null ||
      toNumberOrNull(set.durationSeconds) !== null
    );
  }) : [];
}

function parseRange(value, multiplier = 1) {
  if (value === null || value === undefined || value === '') {
    return { min: null, max: null };
  }

  if (typeof value === 'number') {
    return { min: value * multiplier, max: value * multiplier };
  }

  const matches = String(value).match(/\d+(\.\d+)?/g);
  const numbers = matches ? matches.map((item) => Number(item) * multiplier).filter(Number.isFinite) : [];

  if (numbers.length === 0) {
    return { min: null, max: null };
  }

  if (numbers.length === 1) {
    return { min: numbers[0], max: numbers[0] };
  }

  return { min: Math.min(numbers[0], numbers[1]), max: Math.max(numbers[0], numbers[1]) };
}

function parseTargetReps(target) {
  return parseRange(target && target.reps);
}

function parseTargetRir(target) {
  const range = parseRange(target && target.rir);
  return range.min;
}

function parseTargetDurationSeconds(target) {
  const seconds = parseRange(target && target.durationSeconds);

  if (seconds.min !== null || seconds.max !== null) {
    return seconds;
  }

  return parseRange(target && target.durationMinutes, 60);
}

function roundToIncrement(value, increment = 0.5) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(increment, Math.round(value / increment) * increment);
}

function getEquipmentRule(exercise, customRules = readEquipmentWeightRules()) {
  const trackingType = exercise && exercise.trackingType ? exercise.trackingType : '';
  const equipment = Array.isArray(exercise && exercise.equipment) ? exercise.equipment : [];
  const id = exercise && exercise.id ? exercise.id : '';
  const exerciseIncrement = toNumberOrNull(
    exercise && (
      exercise.weightIncrementKg ??
      (exercise.loadProgression && exercise.loadProgression.incrementKg)
    )
  );

  if (exerciseIncrement !== null && exerciseIncrement > 0) {
    return {
      incrementKg: exerciseIncrement,
      note: `${exercise.nameZh || '该动作'}按动作配置的 ${exerciseIncrement}kg 档位调整。`,
      source: 'exercise'
    };
  }

  if (trackingType === 'time_based' || equipment.includes('bodyweight')) {
    return { ...customRules.bodyweight, source: 'equipment' };
  }

  if (equipment.includes('dumbbell') || id.startsWith('db_') || id.includes('_db_')) {
    return { ...customRules.dumbbell, source: 'equipment' };
  }

  if (equipment.includes('barbell')) {
    return { ...customRules.barbell, source: 'equipment' };
  }

  if (equipment.includes('cable_machine') || equipment.includes('lat_pulldown_machine')) {
    return { ...customRules.cable_machine, source: 'equipment' };
  }

  if (equipment.includes('machine')) {
    return { ...customRules.machine, source: 'equipment' };
  }

  return {
    incrementKg: 2.5,
    note: '未匹配到明确器械，默认按 2.5kg 档位取整。',
    source: 'fallback'
  };
}

export function getWeightIncrementKg(exercise, customRules = equipmentWeightRules) {
  const rule = getEquipmentRule(exercise, customRules);
  return rule && rule.incrementKg ? rule.incrementKg : null;
}

export function readEquipmentWeightRules({ storage = getRuntimeStorage() } = {}) {
  try {
    const raw = storage.getItem(EQUIPMENT_WEIGHT_RULES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return Object.fromEntries(
      Object.entries(equipmentWeightRules).map(([key, rule]) => {
        const custom = parsed && parsed[key] ? parsed[key] : {};
        const incrementKg = toNumberOrNull(custom.incrementKg);

        return [
          key,
          {
            ...rule,
            ...custom,
            incrementKg: incrementKg === null ? rule.incrementKg : incrementKg,
            note: custom.note || rule.note
          }
        ];
      })
    );
  } catch {
    return equipmentWeightRules;
  }
}

export function saveEquipmentWeightRules(rules, { storage = getRuntimeStorage() } = {}) {
  const nextRules = Object.fromEntries(
    Object.entries(equipmentWeightRules).map(([key, rule]) => {
      const custom = rules && rules[key] ? rules[key] : {};
      const incrementKg = toNumberOrNull(custom.incrementKg);

      return [
        key,
        {
          incrementKg: incrementKg === null ? rule.incrementKg : incrementKg,
          note: custom.note || rule.note
        }
      ];
    })
  );

  storage.setItem(EQUIPMENT_WEIGHT_RULES_STORAGE_KEY, JSON.stringify(nextRules));
  return nextRules;
}

function applyEquipmentWeightRule(rawWeight, exercise) {
  const rule = getEquipmentRule(exercise);

  if (!rule || !rule.incrementKg || toNumberOrNull(rawWeight) === null) {
    return {
      rawEstimatedWeight: toNumberOrNull(rawWeight),
      suggestedWeight: null,
      roundingIncrementKg: null,
      roundingNote: rule ? rule.note : '该动作不推荐训练重量。'
    };
  }

  return {
    rawEstimatedWeight: Number(toNumberOrNull(rawWeight).toFixed(1)),
    suggestedWeight: roundToIncrement(rawWeight, rule.incrementKg),
    roundingIncrementKg: rule.incrementKg,
    roundingNote: rule.note
  };
}

function getLatestCompletedWeightSet(log) {
  return getCompletedSets(log)
    .filter((set) => toNumberOrNull(set.weight) !== null && toNumberOrNull(set.reps) !== null)
    .slice()
    .sort((a, b) => a.setIndex - b.setIndex)[0] || null;
}

function getBaselineLift(exerciseId, userProfile) {
  const baselineLifts = normalizeBaselineLifts(userProfile && userProfile.baselineLifts);

  if (Array.isArray(baselineLifts)) {
    return baselineLifts.find((item) => item.exerciseId === exerciseId) || null;
  }

  return null;
}

function normalizeBaselineLifts(baselineLifts) {
  if (Array.isArray(baselineLifts)) {
    return baselineLifts;
  }

  if (!baselineLifts || typeof baselineLifts !== 'object') {
    return [];
  }

  if (baselineLifts.exerciseId) {
    return [baselineLifts];
  }

  return Object.entries(baselineLifts).map(([exerciseId, value]) => ({
    exerciseId,
    ...(value && typeof value === 'object' ? value : {})
  }));
}

function formatSeconds(seconds) {
  const value = Math.round(seconds);

  if (value >= 60) {
    const minutes = Math.floor(value / 60);
    const restSeconds = value % 60;
    return restSeconds > 0 ? `${minutes} 分 ${restSeconds} 秒` : `${minutes} 分钟`;
  }

  return `${value} 秒`;
}

function formatWeightText(weight, unit = 'kg') {
  return toNumberOrNull(weight) === null ? '' : `${weight}${unit}`;
}

function getTargetSetCount(target) {
  const value = Number(target && target.sets);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function getAverage(values) {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function formatAverage(value) {
  return value === null ? null : Number(value.toFixed(1));
}

function buildEmptyRecommendation(reason = '暂无历史记录，请保守选择能完成目标次数且保留 1-2 次余力的重量。') {
  return {
    type: 'none',
    source: 'none',
    suggestedWeight: null,
    weightUnit: 'kg',
    suggestedWeightText: '暂无建议',
    rawEstimatedWeight: null,
    rawEstimatedWeightText: '',
    roundingIncrementKg: null,
    roundingNote: '',
    suggestedRepsText: '',
    suggestedDurationSeconds: null,
    suggestedDurationText: '',
    strategy: '暂无建议',
    reason
  };
}

function buildTimeRecommendation({ exercise, planExercise, lastExerciseLog }) {
  const targetDuration = parseTargetDurationSeconds(planExercise && planExercise.target);
  const completedSets = getCompletedSets(lastExerciseLog);
  const durations = completedSets
    .map((set) => toNumberOrNull(set.durationSeconds))
    .filter((duration) => duration !== null);

  if (durations.length === 0) {
    return buildEmptyRecommendation('暂无历史时长记录，请从计划目标下限开始，保持动作质量和呼吸可控。');
  }

  const lastDuration = Math.max(...durations);
  const step = lastDuration >= 600 ? 300 : 5;
  const targetMax = targetDuration.max;
  const suggestedEnd = targetMax ? Math.min(lastDuration + step, Math.max(targetMax, lastDuration)) : lastDuration + step;
  const improved = suggestedEnd > lastDuration;

  return {
    type: 'time',
    source: 'history',
    suggestedWeight: null,
    weightUnit: 'kg',
    suggestedWeightText: '不推荐重量',
    rawEstimatedWeight: null,
    rawEstimatedWeightText: '',
    roundingIncrementKg: null,
    roundingNote: '计时动作不推荐重量，只推荐时长。',
    suggestedRepsText: '',
    suggestedDurationSeconds: suggestedEnd,
    suggestedDurationText: improved
      ? `${formatSeconds(lastDuration)}-${formatSeconds(suggestedEnd)}`
      : formatSeconds(lastDuration),
    strategy: improved ? '建议增加时长' : '建议维持时长',
    reason: `${exercise && exercise.nameZh ? exercise.nameZh : '该动作'} 是计时动作。本次先参考上次完成时长，状态稳定时小幅增加时长。`
  };
}

export function readUserTrainingProfile({ storage = getRuntimeStorage() } = {}) {
  try {
    const raw = storage.getItem(USER_TRAINING_PROFILE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      ...defaultProfile,
      ...parsed,
      goal: 'body_recomposition',
      baselineLifts: Object.prototype.hasOwnProperty.call(parsed, 'baselineLifts')
        ? normalizeBaselineLifts(parsed.baselineLifts)
        : defaultProfile.baselineLifts
    };
  } catch {
    return { ...defaultProfile };
  }
}

export function saveUserTrainingProfile(profile, { storage = getRuntimeStorage() } = {}) {
  const nextProfile = {
    ...defaultProfile,
    ...profile,
    goal: 'body_recomposition',
    bodyWeightKg: toNumberOrNull(profile && profile.bodyWeightKg),
    heightCm: toNumberOrNull(profile && profile.heightCm),
    trainingExperienceYears: toNumberOrNull(profile && profile.trainingExperienceYears),
    baselineLifts: normalizeBaselineLifts(profile && profile.baselineLifts),
    updatedAt: new Date().toISOString()
  };

  storage.setItem(USER_TRAINING_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));

  return nextProfile;
}

export function upsertBaselineLift(baselineLift, { storage = getRuntimeStorage() } = {}) {
  const profile = readUserTrainingProfile({ storage });
  const nextLift = {
    exerciseId: baselineLift.exerciseId,
    weight: toNumberOrNull(baselineLift.weight),
    weightUnit: baselineLift.weightUnit || 'kg',
    reps: toNumberOrNull(baselineLift.reps),
    rir: toNumberOrNull(baselineLift.rir),
    sourceType: baselineLift.sourceType || 'user_reported_working_set',
    confidence: baselineLift.confidence || 'medium',
    recommendedStartWeight: toNumberOrNull(baselineLift.recommendedStartWeight),
    note: baselineLift.note || ''
  };
  const baselineLifts = [
    nextLift,
    ...profile.baselineLifts.filter((item) => item.exerciseId !== nextLift.exerciseId)
  ];

  return saveUserTrainingProfile({ ...profile, baselineLifts }, { storage });
}

export function getRecentCompletedExerciseLogs(exerciseId, history, limit = 3) {
  const sortedHistory = (Array.isArray(history) ? history : [])
    .slice()
    .sort((a, b) => getSessionEndTime(b) - getSessionEndTime(a));
  const logs = [];

  for (const session of sortedHistory) {
    const log = (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : [])
      .find((item) => item.exerciseId === exerciseId && getCompletedSets(item).length > 0);

    if (log) {
      logs.push({
        ...log,
        sessionId: session.id,
        sessionDate: session.date,
        planDayId: session.planDayId
      });

      if (logs.length >= limit) {
        break;
      }
    }
  }

  return logs.reverse();
}

export function getLastCompletedExerciseLog(exerciseId, history) {
  const recent = getRecentCompletedExerciseLogs(exerciseId, history, 1);
  return recent[0] || null;
}

function getDominantWeight(weights) {
  const counts = new Map();

  weights.forEach((weight) => {
    counts.set(weight, (counts.get(weight) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? null;
}

function getRirTargetValue(target) {
  const parsed = parseTargetRir(target);
  return parsed === null ? 2 : parsed;
}

export function summarizeExercisePerformance(log, target = {}) {
  const completedSets = getCompletedSets(log).slice().sort((a, b) => a.setIndex - b.setIndex);
  const targetSetCount = getTargetSetCount(target) || completedSets.length;
  const targetReps = parseTargetReps(target);
  const plannedSets = completedSets.slice(0, targetSetCount || completedSets.length);
  const reps = plannedSets.map((set) => toNumberOrNull(set.reps)).filter((value) => value !== null);
  const weights = plannedSets.map((set) => toNumberOrNull(set.weight)).filter((value) => value !== null);
  const rirValues = plannedSets.map((set) => toNumberOrNull(set.rir)).filter((value) => value !== null);
  const lastPlannedSet = plannedSets[plannedSets.length - 1] || null;
  const missingSetCount = Math.max(0, targetSetCount - completedSets.length);
  const belowLowerCount = (targetReps.min === null
    ? 0
    : reps.filter((value) => value < targetReps.min).length) + missingSetCount;
  const atUpperCount = targetReps.max === null
    ? 0
    : reps.filter((value) => value >= targetReps.max).length;
  const nearFailureCount = rirValues.filter((value) => value <= 1).length;
  const averageRir = formatAverage(getAverage(rirValues));
  const minimumRir = rirValues.length > 0 ? Math.min(...rirValues) : null;
  const lastRir = lastPlannedSet ? toNumberOrNull(lastPlannedSet.rir) : null;
  const completedAllWorkSets = targetSetCount > 0 &&
    completedSets.length >= targetSetCount &&
    reps.length >= targetSetCount;
  const majorityCount = Math.floor(Math.max(targetSetCount, 1) / 2) + 1;
  const allWithinTargetRange = completedAllWorkSets &&
    targetReps.min !== null &&
    reps.every((value) => value >= targetReps.min);
  const allAtUpper = completedAllWorkSets &&
    targetReps.max !== null &&
    atUpperCount >= targetSetCount;
  const rirCoverage = targetSetCount > 0
    ? Math.min(1, rirValues.length / targetSetCount)
    : 0;
  const highStrain = rirValues.length > 0 && (
    minimumRir === 0 ||
    lastRir !== null && lastRir <= 1 ||
    nearFailureCount >= majorityCount
  );
  const severeFailure = (
    belowLowerCount >= majorityCount ||
    completedSets.length < targetSetCount
  ) && highStrain;

  return {
    sessionId: log && log.sessionId ? log.sessionId : '',
    date: log && (log.sessionDate || log.date) ? (log.sessionDate || log.date) : '',
    workingWeight: getDominantWeight(weights),
    weightUnit: plannedSets[0] && plannedSets[0].weightUnit ? plannedSets[0].weightUnit : 'kg',
    reps,
    totalReps: reps.reduce((sum, value) => sum + value, 0),
    targetSetCount,
    completedSetCount: completedSets.length,
    completedAllWorkSets,
    allWithinTargetRange,
    allAtUpper,
    belowLowerCount,
    atUpperCount,
    averageRir,
    minimumRir,
    lastRir,
    nearFailureCount,
    rirCoverage,
    highStrain,
    severeFailure,
    volume: plannedSets.reduce((sum, set) => {
      const weight = toNumberOrNull(set.weight);
      const repsValue = toNumberOrNull(set.reps);
      return weight === null || repsValue === null ? sum : sum + weight * repsValue;
    }, 0)
  };
}

function hasSameWeight(left, right) {
  return left && right &&
    left.workingWeight !== null &&
    right.workingWeight !== null &&
    Math.abs(left.workingWeight - right.workingWeight) < 0.001;
}

function hasRobustRirForIncrease(summary, target) {
  const requiredRir = Math.max(2, getRirTargetValue(target));
  return summary.rirCoverage >= 2 / 3 &&
    summary.averageRir !== null && summary.averageRir >= requiredRir &&
    summary.minimumRir !== null && summary.minimumRir >= 2 &&
    summary.lastRir !== null && summary.lastRir >= 2 &&
    summary.nearFailureCount === 0;
}

function isMeaningfulDecline(previous, current) {
  if (!hasSameWeight(previous, current)) {
    return false;
  }

  const repsDeclined = current.totalReps <= previous.totalReps - 2;
  const completionDeclined = current.completedSetCount < previous.completedSetCount ||
    current.belowLowerCount > previous.belowLowerCount;
  const rirDeclined = current.averageRir !== null && previous.averageRir !== null
    ? current.averageRir < previous.averageRir
    : current.highStrain;

  return (repsDeclined || completionDeclined) && (rirDeclined || current.highStrain);
}

export function analyzeExerciseTrend(summaries, target = {}) {
  const recent = (Array.isArray(summaries) ? summaries : []).filter(Boolean).slice(-3);
  const latest = recent[recent.length - 1] || null;
  const previous = recent[recent.length - 2] || null;

  if (!latest) {
    return {
      sessionsUsed: 0,
      latest: null,
      previous: null,
      failureStreak: 0,
      declineTransitions: 0,
      loadIncreased: false,
      weightProgress: false,
      repsProgress: false,
      readyToIncrease: false,
      recoveryWarning: false
    };
  }

  const sameWeightTail = [];
  for (let index = recent.length - 1; index >= 0; index -= 1) {
    if (hasSameWeight(latest, recent[index])) {
      sameWeightTail.unshift(recent[index]);
    } else {
      break;
    }
  }

  let failureStreak = 0;
  for (let index = sameWeightTail.length - 1; index >= 0; index -= 1) {
    if (!sameWeightTail[index].severeFailure) {
      break;
    }
    failureStreak += 1;
  }

  let declineTransitions = 0;
  for (let index = recent.length - 1; index > 0; index -= 1) {
    if (!isMeaningfulDecline(recent[index - 1], recent[index])) {
      break;
    }
    declineTransitions += 1;
  }

  const loadIncreased = Boolean(previous &&
    latest.workingWeight !== null &&
    previous.workingWeight !== null &&
    latest.workingWeight > previous.workingWeight);
  const weightProgress = recent.some((summary, index) => index > 0 &&
    summary.workingWeight !== null &&
    recent[index - 1].workingWeight !== null &&
    summary.workingWeight > recent[index - 1].workingWeight &&
    summary.allWithinTargetRange
  );
  const repsProgress = Boolean(previous && hasSameWeight(previous, latest) &&
    latest.totalReps > previous.totalReps);
  const latestRirReady = hasRobustRirForIncrease(latest, target);
  const previousConfirmsProgress = Boolean(previous && hasSameWeight(previous, latest) && (
    previous.allAtUpper && hasRobustRirForIncrease(previous, target) ||
    previous.allWithinTargetRange && latest.totalReps > previous.totalReps && !previous.highStrain
  ));
  const readyToIncrease = !loadIncreased &&
    latest.allAtUpper &&
    latestRirReady &&
    previousConfirmsProgress;

  return {
    sessionsUsed: recent.length,
    latest,
    previous,
    sameWeightSessionCount: sameWeightTail.length,
    failureStreak,
    declineTransitions,
    loadIncreased,
    weightProgress,
    repsProgress,
    latestRirReady,
    readyToIncrease,
    recoveryWarning: failureStreak >= 2 || declineTransitions >= 2
  };
}

export function decideProgression(trend) {
  const latest = trend && trend.latest;

  if (!latest) {
    return { strategy: '暂无建议', phase: 'baseline', direction: 'none' };
  }

  if (
    trend.failureStreak >= 3 &&
    latest.severeFailure &&
    latest.highStrain &&
    latest.belowLowerCount >= Math.floor(Math.max(latest.targetSetCount, 1) / 2) + 1
  ) {
    return { strategy: '建议降低重量', phase: 'confirmed_regression', direction: 'decrease' };
  }

  if (trend.readyToIncrease) {
    return { strategy: '建议加重量', phase: 'ready_to_increase', direction: 'increase' };
  }

  if (trend.loadIncreased) {
    return { strategy: '建议维持重量', phase: 'load_adaptation', direction: 'hold' };
  }

  if (latest.rirCoverage < 1) {
    return { strategy: '建议维持重量', phase: 'rir_incomplete', direction: 'hold' };
  }

  if (trend.recoveryWarning) {
    return { strategy: '建议维持重量', phase: 'recovery_watch', direction: 'hold' };
  }

  if (latest.allAtUpper && latest.highStrain) {
    return { strategy: '建议维持重量', phase: 'top_range_high_strain', direction: 'hold' };
  }

  if (trend.repsProgress) {
    return { strategy: '建议维持重量', phase: 'reps_progress', direction: 'hold' };
  }

  if (latest.severeFailure) {
    return { strategy: '建议维持重量', phase: 'single_bad_session', direction: 'hold' };
  }

  return { strategy: '建议维持重量', phase: 'stable', direction: 'hold' };
}

export function buildNextRepTarget(summary, target = {}, decision = {}) {
  const targetReps = parseTargetReps(target);

  if (targetReps.min === null || targetReps.max === null) {
    return '';
  }

  if (decision.direction === 'increase' || decision.direction === 'decrease') {
    return `${targetReps.min}-${targetReps.max} 次`;
  }

  const setCount = getTargetSetCount(target) || summary.reps.length || 1;
  const current = Array.from({ length: setCount }, (_, index) =>
    Math.min(targetReps.max, Math.max(targetReps.min, summary.reps[index] ?? targetReps.min))
  );
  const canAddReps = [
    'load_adaptation',
    'reps_progress',
    'stable'
  ].includes(decision.phase) && !summary.highStrain;
  const targets = canAddReps
    ? current.map((value) => Math.min(targetReps.max, value + 1))
    : current;

  return targets.join(' / ');
}

export function buildTrendRecommendationReason({ decision, trend }) {
  const evidenceText = `参考最近 ${trend.sessionsUsed} 次同动作记录`;

  if (decision.phase === 'ready_to_increase') {
    return `${evidenceText}：重量未变时次数稳定提升，最新全部工作组达到上限；平均、最低和最后一组 RIR 均达到加重条件。`;
  }

  if (decision.phase === 'confirmed_regression') {
    return `${evidenceText}：已连续 3 次出现多组低于次数下限，并伴随 RIR 0-1 或工作组完成度下降，因此建议降低一个配重档位。`;
  }

  if (decision.phase === 'load_adaptation') {
    return `${evidenceText}：最近一次重量已经提高，次数仍处于目标范围内，属于加重后的正常适应阶段。`;
  }

  if (decision.phase === 'rir_incomplete') {
    return `${evidenceText}：重量和次数仍可用于判断，但最新 RIR 数据不完整，因此保守维持当前重量。`;
  }

  if (decision.phase === 'recovery_watch') {
    return `${evidenceText}：近期表现连续下降，但尚未满足连续 3 次明显失败的降重门槛；先保持重量并注意恢复。`;
  }

  if (decision.phase === 'top_range_high_strain') {
    return `${evidenceText}：次数已经达到上限，但最低或最后一组 RIR 显示接近力竭，暂不加重。`;
  }

  if (decision.phase === 'reps_progress') {
    return `${evidenceText}：当前重量不变，总完成次数正在提高，属于次数进步；继续把各组推进到目标上限。`;
  }

  if (decision.phase === 'single_bad_session') {
    return `${evidenceText}：最新一次表现明显下降，但单次状态不足以触发降重，先保持并观察下一次。`;
  }

  return `${evidenceText}：当前表现没有形成明确的连续加重或降重信号，优先维持并稳定完成目标。`;
}

export function calculateEstimatedOneRepMax({ weight, reps, rir }) {
  const weightValue = toNumberOrNull(weight);
  const repsValue = toNumberOrNull(reps);
  const rirValue = toNumberOrNull(rir) || 0;

  if (weightValue === null || repsValue === null) {
    return null;
  }

  const estimatedReps = repsValue + rirValue;
  return Number((weightValue * (1 + estimatedReps / 30)).toFixed(1));
}

export function getWeightRecommendationReason({
  strategy,
  completedReps = [],
  targetReps,
  completedAllWorkSets = false,
  allRirRecorded = false,
  hasHistory,
  hasBaseline
} = {}) {
  if (!hasHistory && !hasBaseline) {
    return '暂无历史记录，请选择能完成目标次数且保留 1-2 次余力的重量。';
  }

  const repsText = completedReps.length > 0 ? completedReps.join('、') : '';
  const targetText = targetReps && targetReps.min !== null && targetReps.max !== null
    ? `${targetReps.min}-${targetReps.max} 次`
    : '目标次数';

  if (strategy === '建议加重量') {
    return `上次完成了全部工作组，${repsText} 次均达到 ${targetText} 上限，RIR 也达标，本次可以增加一个最小配重档位。`;
  }

  if (strategy === '建议降低重量') {
    return `上次多数工作组低于 ${targetText}，且多组已接近力竭。本次降低一个最小配重档位，先把动作质量和目标次数做稳。`;
  }

  if (strategy === '参考基准力量') {
    return '暂无该动作历史训练记录，先使用你填写的基准力量作为保守参考。';
  }

  if (!completedAllWorkSets) {
    return `上次没有完成全部工作组，本次先维持重量，把计划组数完整做完后再判断是否加重。`;
  }

  if (!allRirRecorded) {
    return `上次完成 ${repsText || '部分'} 次，但 RIR 记录不完整。本次先维持重量并补齐 RIR，再判断是否加重。`;
  }

  return `上次完成 ${repsText || '部分'} 次，尚未稳定达到 ${targetText} 上限。本次维持重量，优先增加完成次数。`;
}

export function recommendWeightForTarget({
  exercise,
  planExercise,
  lastExerciseLog,
  recentExerciseLogs,
  userProfile,
  exerciseList = defaultExercises
} = {}) {
  const exerciseMap = getExerciseMap(exerciseList);
  const fullExercise = exercise || exerciseMap.get(planExercise && planExercise.exerciseId) || null;
  const exerciseId = fullExercise ? fullExercise.id : planExercise && planExercise.exerciseId;
  const trackingType = fullExercise && fullExercise.trackingType ? fullExercise.trackingType : 'weight_reps';
  const historyLogs = Array.isArray(recentExerciseLogs) && recentExerciseLogs.length > 0
    ? recentExerciseLogs.slice(-3)
    : lastExerciseLog
      ? [lastExerciseLog]
      : [];
  const latestExerciseLog = historyLogs[historyLogs.length - 1] || null;

  if (trackingType === 'time_based') {
    return buildTimeRecommendation({ exercise: fullExercise, planExercise, lastExerciseLog: latestExerciseLog });
  }

  const targetReps = parseTargetReps(planExercise && planExercise.target);
  const target = planExercise && planExercise.target ? planExercise.target : {};
  const weightSet = getLatestCompletedWeightSet(latestExerciseLog);

  if (weightSet) {
    const summaries = historyLogs.map((log) => summarizeExercisePerformance(log, target));
    const trend = analyzeExerciseTrend(summaries, target);
    const latest = trend.latest;
    const decision = decideProgression(trend);
    const equipmentRule = getEquipmentRule(fullExercise);
    const weightStep = equipmentRule && equipmentRule.incrementKg ? equipmentRule.incrementKg : 2.5;
    const baseWeight = latest.workingWeight ?? toNumberOrNull(weightSet.weight);
    const suggestedWeight = decision.direction === 'increase'
      ? baseWeight + weightStep
      : decision.direction === 'decrease'
        ? Math.max(weightStep, baseWeight - weightStep)
        : baseWeight;

    const rounded = applyEquipmentWeightRule(suggestedWeight, fullExercise);
    const roundedWeight = rounded.suggestedWeight;

    return {
      type: 'weight',
      source: 'history',
      suggestedWeight: roundedWeight,
      weightUnit: weightSet.weightUnit || 'kg',
      suggestedWeightText: formatWeightText(roundedWeight, weightSet.weightUnit || 'kg'),
      rawEstimatedWeight: rounded.rawEstimatedWeight,
      rawEstimatedWeightText: formatWeightText(rounded.rawEstimatedWeight, weightSet.weightUnit || 'kg'),
      roundingIncrementKg: rounded.roundingIncrementKg,
      roundingNote: rounded.roundingNote,
      suggestedRepsText: buildNextRepTarget(latest, target, decision),
      suggestedDurationSeconds: null,
      suggestedDurationText: '',
      estimatedOneRepMax: calculateEstimatedOneRepMax(weightSet),
      averageRir: latest.averageRir,
      minimumRir: latest.minimumRir,
      lastRir: latest.lastRir,
      rirCoverage: latest.rirCoverage,
      completedAllWorkSets: latest.completedAllWorkSets,
      completedSetCount: latest.completedSetCount,
      targetSetCount: latest.targetSetCount,
      strategy: decision.strategy,
      phase: decision.phase,
      sessionsUsed: trend.sessionsUsed,
      trend: {
        failureStreak: trend.failureStreak,
        declineTransitions: trend.declineTransitions,
        loadIncreased: trend.loadIncreased,
        weightProgress: trend.weightProgress,
        repsProgress: trend.repsProgress
      },
      reason: buildTrendRecommendationReason({ decision, trend })
    };
  }

  const baseline = getBaselineLift(exerciseId, userProfile);

  if (baseline && (toNumberOrNull(baseline.recommendedStartWeight) !== null || toNumberOrNull(baseline.weight) !== null)) {
    const rawBaselineWeight = toNumberOrNull(baseline.recommendedStartWeight) ?? toNumberOrNull(baseline.weight);
    const rounded = applyEquipmentWeightRule(rawBaselineWeight, fullExercise);
    const roundedWeight = rounded.suggestedWeight;

    return {
      type: 'weight',
      source: 'baseline',
      suggestedWeight: roundedWeight,
      weightUnit: baseline.weightUnit || 'kg',
      suggestedWeightText: formatWeightText(roundedWeight, baseline.weightUnit || 'kg'),
      rawEstimatedWeight: rounded.rawEstimatedWeight,
      rawEstimatedWeightText: formatWeightText(rounded.rawEstimatedWeight, baseline.weightUnit || 'kg'),
      roundingIncrementKg: rounded.roundingIncrementKg,
      roundingNote: rounded.roundingNote,
      suggestedRepsText: targetReps.min !== null && targetReps.max !== null
        ? `${targetReps.min}-${targetReps.max} 次`
        : '',
      suggestedDurationSeconds: null,
      suggestedDurationText: '',
      estimatedOneRepMax: calculateEstimatedOneRepMax(baseline),
      strategy: '参考基准力量',
      reason: getWeightRecommendationReason({
        strategy: '参考基准力量',
        targetReps,
        hasHistory: false,
        hasBaseline: true
      })
    };
  }

  return buildEmptyRecommendation();
}
