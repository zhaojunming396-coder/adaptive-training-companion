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
  return Array.isArray(log && log.sets) ? log.sets.filter((set) => set.completed === true) : [];
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

function getEquipmentRule(exercise) {
  const customRules = readEquipmentWeightRules();
  const trackingType = exercise && exercise.trackingType ? exercise.trackingType : '';
  const equipment = Array.isArray(exercise && exercise.equipment) ? exercise.equipment : [];
  const id = exercise && exercise.id ? exercise.id : '';

  if (trackingType === 'time_based' || equipment.includes('bodyweight')) {
    return customRules.bodyweight;
  }

  if (equipment.includes('dumbbell') || id.startsWith('db_') || id.includes('_db_')) {
    return customRules.dumbbell;
  }

  if (equipment.includes('barbell')) {
    return customRules.barbell;
  }

  if (equipment.includes('cable_machine') || equipment.includes('lat_pulldown_machine')) {
    return customRules.cable_machine;
  }

  if (equipment.includes('machine')) {
    return customRules.machine;
  }

  return {
    incrementKg: 2.5,
    note: '未匹配到明确器械，默认按 2.5kg 档位取整。'
  };
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

function getAverageCompletedWeight(log) {
  const weights = getCompletedSets(log)
    .map((set) => toNumberOrNull(set.weight))
    .filter((weight) => weight !== null);

  if (weights.length === 0) {
    return null;
  }

  return weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
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

function getIncreaseAmount(exercise) {
  const category = exercise && exercise.category ? exercise.category : '';
  const equipment = Array.isArray(exercise && exercise.equipment) ? exercise.equipment : [];
  const id = exercise && exercise.id ? exercise.id : '';

  if (category === 'isolation') {
    return 1;
  }

  if (equipment.includes('dumbbell') || id.startsWith('db_') || id.includes('_db_')) {
    return 2.5;
  }

  if (equipment.includes('barbell') || equipment.includes('machine')) {
    return 5;
  }

  return 2.5;
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

export function getLastCompletedExerciseLog(exerciseId, history) {
  const sortedHistory = (Array.isArray(history) ? history : [])
    .slice()
    .sort((a, b) => getSessionEndTime(b) - getSessionEndTime(a));

  for (const session of sortedHistory) {
    const log = (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : [])
      .find((item) => item.exerciseId === exerciseId && getCompletedSets(item).length > 0);

    if (log) {
      return {
        ...log,
        sessionId: session.id,
        sessionDate: session.date,
        planDayId: session.planDayId
      };
    }
  }

  return null;
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
    return `上次已完成 ${repsText} 次，达到 ${targetText} 的上限且余力达标，本次可以小幅加重量。`;
  }

  if (strategy === '建议降低重量') {
    return `上次多数完成组低于 ${targetText} 或余力不足，本次建议降低重量，先把动作质量和目标次数做稳。`;
  }

  if (strategy === '参考基准力量') {
    return '暂无该动作历史训练记录，先使用你填写的基准力量作为保守参考。';
  }

  return `上次完成 ${repsText || '部分'} 次，尚未稳定达到目标上限，本次建议维持重量，争取多做 1-2 次。`;
}

export function recommendWeightForTarget({
  exercise,
  planExercise,
  lastExerciseLog,
  userProfile,
  exerciseList = defaultExercises
} = {}) {
  const exerciseMap = getExerciseMap(exerciseList);
  const fullExercise = exercise || exerciseMap.get(planExercise && planExercise.exerciseId) || null;
  const exerciseId = fullExercise ? fullExercise.id : planExercise && planExercise.exerciseId;
  const trackingType = fullExercise && fullExercise.trackingType ? fullExercise.trackingType : 'weight_reps';

  if (trackingType === 'time_based') {
    return buildTimeRecommendation({ exercise: fullExercise, planExercise, lastExerciseLog });
  }

  const targetReps = parseTargetReps(planExercise && planExercise.target);
  const targetRir = parseTargetRir(planExercise && planExercise.target);
  const completedSets = getCompletedSets(lastExerciseLog);
  const weightSet = getLatestCompletedWeightSet(lastExerciseLog);

  if (weightSet) {
    const completedReps = completedSets
      .map((set) => toNumberOrNull(set.reps))
      .filter((reps) => reps !== null);
    const completedRirs = completedSets
      .map((set) => toNumberOrNull(set.rir))
      .filter((rir) => rir !== null);
    const upper = targetReps.max;
    const lower = targetReps.min;
    const allAtUpper = upper !== null && completedReps.length > 0 && completedReps.every((reps) => reps >= upper);
    const rirReady = targetRir === null || completedRirs.length === 0 || completedRirs.every((rir) => rir >= targetRir);
    const belowLowerCount = lower === null ? 0 : completedReps.filter((reps) => reps < lower).length;
    const lowRirCount = targetRir === null ? 0 : completedRirs.filter((rir) => rir < targetRir).length;
    const majorityCount = Math.floor(Math.max(completedReps.length, completedRirs.length) / 2) + 1;
    const averageWeight = getAverageCompletedWeight(lastExerciseLog) || toNumberOrNull(weightSet.weight);
    let strategy = '建议维持重量';
    let suggestedWeight = averageWeight;

    if (allAtUpper && rirReady) {
      strategy = '建议加重量';
      suggestedWeight = averageWeight + getIncreaseAmount(fullExercise);
    } else if (belowLowerCount >= majorityCount || lowRirCount >= majorityCount) {
      strategy = '建议降低重量';
      suggestedWeight = averageWeight * 0.975;
    }

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
      suggestedRepsText: planExercise && planExercise.target && planExercise.target.reps ? `${planExercise.target.reps} 次` : '',
      suggestedDurationSeconds: null,
      suggestedDurationText: '',
      estimatedOneRepMax: calculateEstimatedOneRepMax(weightSet),
      strategy,
      reason: getWeightRecommendationReason({
        strategy,
        completedReps,
        targetReps,
        hasHistory: true,
        hasBaseline: false
      })
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
      suggestedRepsText: baseline.reps ? `${baseline.reps} 次` : '',
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
