export const TRAINING_DAY_EXERCISES_STORAGE_KEY = 'trainingDayExercises.v1';
export const DEFAULT_SESSION_EXERCISE_LIMIT = 5;
export const MIN_SESSION_EXERCISE_COUNT = 4;
export const MAX_SESSION_EXERCISE_COUNT = 6;

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

function readStoredPreferences() {
  const storage = getRuntimeStorage();

  try {
    const raw = storage.getItem(TRAINING_DAY_EXERCISES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredPreferences(preferences) {
  const storage = getRuntimeStorage();
  storage.setItem(TRAINING_DAY_EXERCISES_STORAGE_KEY, JSON.stringify(preferences));
}

function getPlanExerciseIds(planDay) {
  return (planDay && Array.isArray(planDay.exercises) ? planDay.exercises : [])
    .map((exercise) => exercise.exerciseId)
    .filter(Boolean);
}

function uniqueKnownExerciseIds(exerciseIds, availableIds) {
  const available = new Set(availableIds);
  const seen = new Set();

  return (Array.isArray(exerciseIds) ? exerciseIds : [])
    .filter((exerciseId) => {
      if (!available.has(exerciseId) || seen.has(exerciseId)) {
        return false;
      }

      seen.add(exerciseId);
      return true;
    });
}

export function getDefaultTrainingDayExerciseIds(planDay) {
  return getPlanExerciseIds(planDay).slice(0, DEFAULT_SESSION_EXERCISE_LIMIT);
}

export function getTrainingDayExerciseIds(planDay) {
  const availableIds = getPlanExerciseIds(planDay);
  const preferences = readStoredPreferences();
  const stored = preferences[planDay && planDay.planDayId];
  const cleanedStored = uniqueKnownExerciseIds(stored && stored.exerciseIds, availableIds);

  return cleanedStored.length > 0 ? cleanedStored : getDefaultTrainingDayExerciseIds(planDay);
}

export function getAvailableTrainingDayExerciseIds(planDay) {
  const selected = new Set(getTrainingDayExerciseIds(planDay));
  return getPlanExerciseIds(planDay).filter((exerciseId) => !selected.has(exerciseId));
}

export function saveTrainingDayExerciseIds(planDay, exerciseIds) {
  if (!planDay || !planDay.planDayId) {
    return [];
  }

  const availableIds = getPlanExerciseIds(planDay);
  const cleaned = uniqueKnownExerciseIds(exerciseIds, availableIds).slice(0, MAX_SESSION_EXERCISE_COUNT);
  const preferences = readStoredPreferences();

  preferences[planDay.planDayId] = {
    exerciseIds: cleaned,
    updatedAt: new Date().toISOString()
  };
  writeStoredPreferences(preferences);

  return cleaned;
}

export function resetTrainingDayExerciseIds(planDay) {
  if (!planDay || !planDay.planDayId) {
    return [];
  }

  const preferences = readStoredPreferences();
  delete preferences[planDay.planDayId];
  writeStoredPreferences(preferences);

  return getDefaultTrainingDayExerciseIds(planDay);
}

export function moveTrainingDayExercise(planDay, exerciseId, direction) {
  const exerciseIds = getTrainingDayExerciseIds(planDay);
  const index = exerciseIds.indexOf(exerciseId);
  const nextIndex = direction === 'up' ? index - 1 : index + 1;

  if (index < 0 || nextIndex < 0 || nextIndex >= exerciseIds.length) {
    return exerciseIds;
  }

  const nextExerciseIds = exerciseIds.slice();
  [nextExerciseIds[index], nextExerciseIds[nextIndex]] = [nextExerciseIds[nextIndex], nextExerciseIds[index]];
  return saveTrainingDayExerciseIds(planDay, nextExerciseIds);
}

export function removeTrainingDayExercise(planDay, exerciseId) {
  const exerciseIds = getTrainingDayExerciseIds(planDay);

  if (exerciseIds.length <= MIN_SESSION_EXERCISE_COUNT) {
    return exerciseIds;
  }

  return saveTrainingDayExerciseIds(planDay, exerciseIds.filter((id) => id !== exerciseId));
}

export function addTrainingDayExercise(planDay, exerciseId) {
  const exerciseIds = getTrainingDayExerciseIds(planDay);

  if (exerciseIds.length >= MAX_SESSION_EXERCISE_COUNT || exerciseIds.includes(exerciseId)) {
    return exerciseIds;
  }

  return saveTrainingDayExerciseIds(planDay, [...exerciseIds, exerciseId]);
}

export function getEffectiveTrainingDayExercises(planDay) {
  const exerciseIds = getTrainingDayExerciseIds(planDay);
  const exerciseById = new Map((planDay && Array.isArray(planDay.exercises) ? planDay.exercises : [])
    .map((exercise) => [exercise.exerciseId, exercise]));

  return exerciseIds
    .map((exerciseId) => exerciseById.get(exerciseId))
    .filter(Boolean);
}
