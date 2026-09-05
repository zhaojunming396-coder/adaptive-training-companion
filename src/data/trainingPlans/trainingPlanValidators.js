const PLAN_DAY_FOCUS = {
  upper_body_chest_back: true,
  lower_body_quad: true,
  upper_body_shoulder_back_arms: true,
  lower_body_posterior_chain: true,
  cardio_core: true,
  rest: true
};

const TRAINING_BLOCK_TYPES = {
  volume_accumulation: true,
  deload: true,
  intensity_progression: true
};

const REQUIRED_PLAN_FIELDS = [
  'planId',
  'nameZh',
  'nameEn',
  'goal',
  'level',
  'durationWeeks',
  'weeklyFrequency',
  'cardioFrequency',
  'suitableFor',
  'notSuitableFor',
  'weeklySchedule',
  'trainingBlocks',
  'planDays',
  'progressionStrategy',
  'deloadStrategy',
  'notes'
];

const REQUIRED_PLAN_DAY_FIELDS = [
  'planDayId',
  'nameZh',
  'focus',
  'estimatedDurationMinutes',
  'warmup',
  'exercises',
  'cardioAfterWorkout',
  'notes'
];

const REQUIRED_TARGET_FIELDS = [
  'sets',
  'reps',
  'durationSeconds',
  'durationMinutes',
  'restSeconds',
  'rir',
  'tempo',
  'note'
];

const REQUIRED_PLAN_DAY_IDS = [
  'day_1_upper_a',
  'day_2_lower_a',
  'day_4_upper_b',
  'day_5_lower_b',
  'day_6_cardio_core'
];

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function hasDuration(target) {
  return hasValue(target.durationSeconds) || hasValue(target.durationMinutes);
}

function getSafePlan(plan) {
  return plan && typeof plan === 'object' && !Array.isArray(plan) ? plan : {};
}

function collectPlanExerciseIds(plan) {
  const safePlan = getSafePlan(plan);
  const planDays = Array.isArray(safePlan.planDays) ? safePlan.planDays : [];
  const ids = planDays.flatMap((day) =>
    Array.isArray(day.exercises) ? day.exercises.map((item) => item.exerciseId) : []
  );

  return Array.from(new Set(ids.filter(Boolean)));
}

export function getMissingExerciseIds(plan, exercises) {
  const exerciseList = Array.isArray(exercises) ? exercises : [];
  const exerciseIds = new Set(exerciseList.map((exercise) => exercise.id));

  return collectPlanExerciseIds(plan).filter((exerciseId) => !exerciseIds.has(exerciseId));
}

export function validateTrainingPlan(plan, exercises) {
  const safePlan = getSafePlan(plan);
  const exerciseList = Array.isArray(exercises) ? exercises : [];
  const exerciseMap = new Map(exerciseList.map((exercise) => [exercise.id, exercise]));
  const planDays = Array.isArray(safePlan.planDays) ? safePlan.planDays : [];
  const weeklySchedule = Array.isArray(safePlan.weeklySchedule) ? safePlan.weeklySchedule : [];
  const trainingBlocks = Array.isArray(safePlan.trainingBlocks) ? safePlan.trainingBlocks : [];
  const planDayIds = planDays.map((day) => day.planDayId);
  const scheduledPlanDayIds = weeklySchedule.map((day) => day.planDayId).filter(Boolean);
  const planExercises = planDays.flatMap((day) =>
    Array.isArray(day.exercises)
      ? day.exercises.map((item) => ({ planDayId: day.planDayId, ...item }))
      : []
  );

  const invalidPlanObject = !plan || typeof plan !== 'object' || Array.isArray(plan) ? [{ field: 'plan' }] : [];
  const missingPlanFields = invalidPlanObject.length
    ? REQUIRED_PLAN_FIELDS.map((field) => ({ field }))
    : REQUIRED_PLAN_FIELDS.filter((field) => !(field in safePlan)).map((field) => ({ field }));
  const emptyTopLevelArrays = ['weeklySchedule', 'trainingBlocks', 'planDays']
    .filter((field) => !Array.isArray(safePlan[field]) || safePlan[field].length === 0)
    .map((field) => ({ field }));
  const duplicatePlanDayIds = planDayIds
    .filter((id, index) => planDayIds.indexOf(id) !== index)
    .map((planDayId) => ({ planDayId }));
  const missingRequiredPlanDays = REQUIRED_PLAN_DAY_IDS
    .filter((planDayId) => !planDayIds.includes(planDayId))
    .map((planDayId) => ({ planDayId }));
  const emptyPlanDays = planDays
    .filter((day) => !Array.isArray(day.exercises) || day.exercises.length === 0)
    .map((day) => ({ planDayId: day.planDayId }));
  const missingScheduledPlanDays = scheduledPlanDayIds
    .filter((planDayId) => !planDayIds.includes(planDayId))
    .map((planDayId) => ({ planDayId }));
  const invalidTrainingBlocks = trainingBlocks
    .filter((block) => !TRAINING_BLOCK_TYPES[block.type])
    .map((block) => ({ blockId: block.blockId, type: block.type }));
  const missingPlanDayFields = planDays.flatMap((day) =>
    REQUIRED_PLAN_DAY_FIELDS
      .filter((field) => !(field in day))
      .map((field) => ({ planDayId: day.planDayId, field }))
  );
  const invalidFocus = planDays
    .filter((day) => !PLAN_DAY_FOCUS[day.focus])
    .map((day) => ({ planDayId: day.planDayId, focus: day.focus }));
  const invalidExerciseTargetShape = planExercises
    .filter((item) => !item.target || typeof item.target !== 'object' || Array.isArray(item.target))
    .map((item) => ({ planDayId: item.planDayId, exerciseId: item.exerciseId }));
  const missingExerciseTargetFields = planExercises.flatMap((item) =>
    REQUIRED_TARGET_FIELDS
      .filter((field) => !item.target || !(field in item.target))
      .map((field) => ({ planDayId: item.planDayId, exerciseId: item.exerciseId, field: `target.${field}` }))
  );
  const missingMinimumTargetFields = planExercises.flatMap((item) =>
    ['sets', 'restSeconds', 'note']
      .filter((field) => !item.target || !hasValue(item.target[field]))
      .map((field) => ({ planDayId: item.planDayId, exerciseId: item.exerciseId, field: `target.${field}` }))
  );
  const strengthTargetsMissingReps = planExercises
    .filter((item) => {
      const exercise = exerciseMap.get(item.exerciseId);
      return exercise && exercise.category === 'strength' && !hasValue(item.target && item.target.reps);
    })
    .map((item) => ({ planDayId: item.planDayId, exerciseId: item.exerciseId, field: 'target.reps' }));
  const timeTargetsMissingDuration = planExercises
    .filter((item) => {
      const exercise = exerciseMap.get(item.exerciseId);
      const isKnownTimeBased =
        exercise &&
        (exercise.trackingType === 'time_based' ||
          exercise.trackingType === 'distance_time' ||
          exercise.category === 'cardio' ||
          exercise.category === 'mobility');
      const inferredTimeBased = !exercise && !hasValue(item.target && item.target.reps);

      return (isKnownTimeBased || inferredTimeBased) && !hasDuration(item.target || {});
    })
    .map((item) => ({
      planDayId: item.planDayId,
      exerciseId: item.exerciseId,
      field: 'target.durationSeconds|target.durationMinutes'
    }));
  const progressionRuleShapeErrors = (safePlan.progressionStrategy && safePlan.progressionStrategy.rules || [])
    .filter((rule) => !rule.ruleId || !Array.isArray(rule.appliesTo) || !rule.description || !rule.action)
    .map((rule) => ({ ruleId: rule.ruleId || null }));
  const deloadRuleShapeErrors = (safePlan.deloadStrategy && safePlan.deloadStrategy.rules || [])
    .filter((rule) => !rule.ruleId || !rule.description || !rule.action)
    .map((rule) => ({ ruleId: rule.ruleId || null }));

  const errors = {
    invalidPlanObject,
    missingPlanFields,
    emptyTopLevelArrays,
    duplicatePlanDayIds,
    missingRequiredPlanDays,
    emptyPlanDays,
    missingScheduledPlanDays,
    invalidTrainingBlocks,
    missingPlanDayFields,
    invalidFocus,
    invalidExerciseTargetShape,
    missingExerciseTargetFields,
    missingMinimumTargetFields,
    strengthTargetsMissingReps,
    timeTargetsMissingDuration,
    progressionRuleShapeErrors,
    deloadRuleShapeErrors
  };
  const warnings = {
    missingExerciseIds: getMissingExerciseIds(safePlan, exerciseList).map((exerciseId) => ({ exerciseId }))
  };
  const errorCount = Object.keys(errors).reduce((count, key) => count + errors[key].length, 0);

  return {
    isValid: errorCount === 0,
    errors,
    warnings
  };
}
