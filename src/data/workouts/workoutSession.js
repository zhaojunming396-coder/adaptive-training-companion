import { exercises as defaultExercises } from '../exercises/exercises.js';
import { bodyRecomposition4DayPlan } from '../trainingPlans/bodyRecomposition4DayPlan.js';

export const WORKOUT_HISTORY_STORAGE_KEY = 'workoutHistory.v1';
export const DEFAULT_TIME_ZONE = 'Asia/Shanghai';

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

function toDate(value) {
  return value instanceof Date ? value : new Date(value || Date.now());
}

function formatDate(date, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(toDate(date));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function getPlanDayIndex(date, timeZone = DEFAULT_TIME_ZONE) {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(toDate(date));
  const weekdayIndex = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7
  };

  return weekdayIndex[weekday];
}

function getPlanDayById(plan, planDayId) {
  return (plan.planDays || []).find((day) => day.planDayId === planDayId) || null;
}

function getExerciseMap(exerciseList) {
  return new Map((Array.isArray(exerciseList) ? exerciseList : []).map((exercise) => [exercise.id, exercise]));
}

function getTargetSetCount(target) {
  const sets = Number(target && target.sets);
  return Number.isFinite(sets) && sets > 0 ? Math.floor(sets) : 0;
}

function createEmptySet(setIndex, exercise) {
  return {
    setIndex,
    weight: null,
    weightUnit: 'kg',
    reps: null,
    rir: null,
    completed: false,
    side: exercise && exercise.isUnilateral ? 'both' : 'both',
    durationSeconds: null,
    distance: null,
    distanceUnit: 'km'
  };
}

function createExerciseLog(planExercise, exercise) {
  const sets = Array.from(
    { length: getTargetSetCount(planExercise.target) },
    (_, index) => createEmptySet(index + 1, exercise)
  );

  return {
    id: `elog_${planExercise.exerciseId}_${Date.now()}`,
    date: '',
    exerciseId: planExercise.exerciseId,
    sets,
    notes: ''
  };
}

function getDurationMinutes(startedAt, endedAt) {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return 0;
  }

  return Math.round((end - start) / 60000);
}

function readRawHistory(storage) {
  const raw = storage.getItem(WORKOUT_HISTORY_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getCompletedSets(log) {
  return Array.isArray(log && log.sets) ? log.sets.filter((set) => set.completed === true) : [];
}

function getSessionEndTime(session) {
  return new Date(session.endedAt || session.startedAt || session.date || 0).getTime();
}

function getExerciseTrackingType(exerciseId, exerciseList = defaultExercises) {
  const exercise = getExerciseMap(exerciseList).get(exerciseId);
  return exercise ? exercise.trackingType : '';
}

function validateWorkoutSession(session, exerciseList = defaultExercises, {
  allowIncompleteAnalysisData = false
} = {}) {
  const exerciseMap = getExerciseMap(exerciseList);
  const missingSessionFields = ['id', 'date', 'planId', 'planDayId', 'startedAt'].filter(
    (field) => !session || session[field] === undefined || session[field] === null || session[field] === ''
  );
  const exerciseLogs = Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [];
  const missingExerciseIds = exerciseLogs
    .filter((log) => !log.exerciseId)
    .map((log) => ({ logId: log.id || null }));
  const setErrors = exerciseLogs.flatMap((log) => {
    const exercise = exerciseMap.get(log.exerciseId);
    const sets = Array.isArray(log.sets) ? log.sets : [];

    return sets.flatMap((set) => {
      const errors = [];

      if (!set || set.setIndex === undefined || set.setIndex === null) {
        errors.push({ exerciseId: log.exerciseId, field: 'setIndex' });
      }

      if (!set || typeof set.completed !== 'boolean') {
        errors.push({ exerciseId: log.exerciseId, setIndex: set && set.setIndex, field: 'completed' });
      }

      if (
        !allowIncompleteAnalysisData &&
        exercise &&
        exercise.trackingType === 'weight_reps' &&
        set.completed === true
      ) {
        ['weight', 'reps'].forEach((field) => {
          if (!(field in set) || set[field] === undefined || set[field] === null || set[field] === '') {
            errors.push({ exerciseId: log.exerciseId, setIndex: set.setIndex, field });
          }
        });
      }

      if (
        exercise &&
        exercise.trackingType === 'time_based' &&
        set.completed === true &&
        !allowIncompleteAnalysisData &&
        (!('durationSeconds' in set) || set.durationSeconds === undefined || set.durationSeconds === null || set.durationSeconds === '')
      ) {
        errors.push({ exerciseId: log.exerciseId, setIndex: set.setIndex, field: 'durationSeconds' });
      }

      return errors;
    });
  });
  const errors = {
    missingSessionFields,
    missingExerciseIds,
    setErrors
  };
  const errorCount = Object.values(errors).reduce((count, items) => count + items.length, 0);

  return {
    isValid: errorCount === 0,
    errors
  };
}

export function getTodayTrainingSelection({
  plan = bodyRecomposition4DayPlan,
  date = new Date(),
  timeZone = DEFAULT_TIME_ZONE
} = {}) {
  const dayIndex = getPlanDayIndex(date, timeZone);
  const scheduleItem = (plan.weeklySchedule || []).find((item) => item.dayIndex === dayIndex) || null;
  const planDay = scheduleItem && scheduleItem.planDayId ? getPlanDayById(plan, scheduleItem.planDayId) : null;

  return {
    date: formatDate(date, timeZone),
    dayIndex,
    scheduleItem,
    isRestDay: !planDay,
    restMessage: planDay ? '' : (scheduleItem && scheduleItem.nameZh) || '休息 / 低强度有氧',
    planDay
  };
}

export function buildTrainingDayDetail({
  plan = bodyRecomposition4DayPlan,
  exerciseList = defaultExercises,
  planDayId,
  date = new Date(),
  timeZone = DEFAULT_TIME_ZONE
} = {}) {
  const selection = planDayId
    ? {
        date: formatDate(date, timeZone),
        planDay: getPlanDayById(plan, planDayId),
        isRestDay: false,
        restMessage: ''
      }
    : getTodayTrainingSelection({ plan, date, timeZone });

  if (!selection.planDay) {
    return {
      date: selection.date,
      isRestDay: true,
      restMessage: selection.restMessage || '休息 / 低强度有氧',
      planDay: null
    };
  }

  const exerciseMap = getExerciseMap(exerciseList);
  const enrichedExercises = selection.planDay.exercises.map((planExercise) => {
    const detail = exerciseMap.get(planExercise.exerciseId) || null;

    return {
      exerciseId: planExercise.exerciseId,
      target: planExercise.target,
      detail: detail
        ? {
            nameZh: detail.nameZh,
            nameEn: detail.nameEn,
            primaryMuscles: detail.primaryMuscles,
            steps: detail.steps,
            safetyTips: detail.safetyTips,
            trackingType: detail.trackingType,
            isUnilateral: detail.isUnilateral
          }
        : null
    };
  });

  return {
    date: selection.date,
    isRestDay: false,
    planId: plan.planId,
    planDayId: selection.planDay.planDayId,
    nameZh: selection.planDay.nameZh,
    estimatedDurationMinutes: selection.planDay.estimatedDurationMinutes,
    warmup: selection.planDay.warmup,
    exercises: enrichedExercises,
    notes: selection.planDay.notes
  };
}

export function createWorkoutSession({
  plan = bodyRecomposition4DayPlan,
  exerciseList = defaultExercises,
  planDayId,
  date = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
  startedAt = new Date()
} = {}) {
  const planDay = planDayId ? getPlanDayById(plan, planDayId) : getTodayTrainingSelection({ plan, date, timeZone }).planDay;

  if (!planDay) {
    throw new Error('Cannot create workout session for a rest day.');
  }

  const sessionDate = formatDate(date, timeZone);
  const exerciseMap = getExerciseMap(exerciseList);
  const exerciseLogs = planDay.exercises.map((planExercise) => {
    const log = createExerciseLog(planExercise, exerciseMap.get(planExercise.exerciseId));
    return {
      ...log,
      id: `elog_${sessionDate}_${planExercise.exerciseId}`,
      date: sessionDate
    };
  });

  return {
    id: `session_${sessionDate}_${planDay.planDayId}_${new Date(startedAt).getTime()}`,
    date: sessionDate,
    planId: plan.planId,
    planDayId: planDay.planDayId,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: '',
    durationMinutes: 0,
    exerciseLogs,
    notes: '',
    completed: false
  };
}

export function updateWorkoutSet(session, exerciseId, setIndex, patch) {
  return {
    ...session,
    exerciseLogs: session.exerciseLogs.map((log) => {
      if (log.exerciseId !== exerciseId) {
        return log;
      }

      return {
        ...log,
        sets: log.sets.map((set) => (set.setIndex === setIndex ? { ...set, ...patch, setIndex } : set))
      };
    })
  };
}

export function saveWorkoutSession(session, {
  exerciseList = defaultExercises,
  storage = getRuntimeStorage(),
  endedAt = new Date(),
  notes = session.notes || '',
  completed = true,
  allowIncompleteAnalysisData = false
} = {}) {
  const finalSession = {
    ...session,
    endedAt: completed ? new Date(endedAt).toISOString() : session.endedAt,
    durationMinutes: completed ? getDurationMinutes(session.startedAt, endedAt) : session.durationMinutes,
    notes,
    completed
  };
  const validation = validateWorkoutSession(finalSession, exerciseList, { allowIncompleteAnalysisData });

  if (!validation.isValid) {
    return {
      ok: false,
      errors: validation.errors,
      session: finalSession
    };
  }

  const history = readRawHistory(storage);
  const nextHistory = [
    finalSession,
    ...history.filter((item) => item.id !== finalSession.id)
  ];

  storage.setItem(WORKOUT_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));

  return {
    ok: true,
    errors: null,
    session: finalSession
  };
}

export function readWorkoutHistory({ storage = getRuntimeStorage() } = {}) {
  return readRawHistory(storage);
}

export function getLastExerciseLog(exerciseId, {
  storage = getRuntimeStorage(),
  excludeSessionId = ''
} = {}) {
  const history = readRawHistory(storage)
    .filter((session) => session.id !== excludeSessionId)
    .slice()
    .sort((a, b) => getSessionEndTime(b) - getSessionEndTime(a));

  for (const session of history) {
    const log = (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : [])
      .find((item) => item.exerciseId === exerciseId);

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

export function getLastExercisePerformance(exerciseId, options = {}) {
  const log = getLastExerciseLog(exerciseId, options);

  if (!log) {
    return null;
  }

  return {
    exerciseId,
    date: log.sessionDate || log.date,
    sets: getCompletedSets(log).map((set) => ({
      setIndex: set.setIndex,
      weight: set.weight,
      weightUnit: set.weightUnit || 'kg',
      reps: set.reps,
      rir: set.rir,
      durationSeconds: set.durationSeconds,
      distance: set.distance,
      distanceUnit: set.distanceUnit || 'km',
      completed: set.completed
    }))
  };
}

export function buildWorkoutSummary(session, exerciseList = defaultExercises) {
  const exerciseLogs = Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [];
  const completedSets = exerciseLogs.flatMap((log) => getCompletedSets(log));
  const completedExerciseCount = exerciseLogs.filter((log) => getCompletedSets(log).length > 0).length;
  const totalSetCount = exerciseLogs.reduce((count, log) => count + (Array.isArray(log.sets) ? log.sets.length : 0), 0);
  const totalVolume = exerciseLogs.reduce((sum, log) => {
    const trackingType = getExerciseTrackingType(log.exerciseId, exerciseList);

    if (trackingType !== 'weight_reps') {
      return sum;
    }

    return sum + getCompletedSets(log).reduce((setSum, set) => {
      const weight = Number(set.weight);
      const reps = Number(set.reps);

      if (!Number.isFinite(weight) || !Number.isFinite(reps)) {
        return setSum;
      }

      return setSum + weight * reps;
    }, 0);
  }, 0);
  const completedTimeSeconds = exerciseLogs.reduce((sum, log) =>
    sum + getCompletedSets(log).reduce((setSum, set) => {
      const duration = Number(set.durationSeconds);
      return Number.isFinite(duration) ? setSum + duration : setSum;
    }, 0), 0);

  return {
    planDayId: session.planDayId,
    date: session.date,
    durationMinutes: session.durationMinutes || 0,
    completedExerciseCount,
    completedSetCount: completedSets.length,
    totalSetCount,
    totalVolume,
    completedTimeSeconds
  };
}

export function validateWorkoutSessionBeforeSave(session, exerciseList = defaultExercises) {
  return validateWorkoutSession(session, exerciseList);
}
