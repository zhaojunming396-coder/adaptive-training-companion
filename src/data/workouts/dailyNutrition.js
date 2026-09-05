export const DAILY_NUTRITION_LOG_STORAGE_KEY = 'dailyNutritionLog.v1';
export const DAILY_SUPPLEMENT_LOG_STORAGE_KEY = 'dailySupplementLog.v1';
export const DEFAULT_PROTEIN_TARGET_GRAM = 120;
export const DEFAULT_CREATINE_DOSE_GRAM = 5;
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
        return value === undefined || value === null || value === '' ? null : JSON.stringify(value);
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

export function getTodayDateText(date = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(toDate(date));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function parseLogMap(storage, key) {
  try {
    const raw = storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function toNumberOrDefault(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function buildDefaultNutritionLog(date) {
  return {
    date,
    proteinTargetGram: DEFAULT_PROTEIN_TARGET_GRAM,
    proteinIntakeGram: 0,
    notes: ''
  };
}

function buildDefaultSupplementLog(date) {
  return {
    date,
    proteinPowder: {
      taken: false,
      proteinGram: 0,
      note: ''
    },
    creatine: {
      taken: false,
      doseGram: DEFAULT_CREATINE_DOSE_GRAM,
      note: ''
    },
    fishOil: {
      taken: false,
      note: ''
    },
    curcumin: {
      taken: false,
      note: ''
    }
  };
}

function normalizeNutritionLog(log, date) {
  const fallback = buildDefaultNutritionLog(date || (log && log.date) || getTodayDateText());

  return {
    ...fallback,
    ...(log || {}),
    date: (log && log.date) || fallback.date,
    proteinTargetGram: toNumberOrDefault(log && log.proteinTargetGram, fallback.proteinTargetGram),
    proteinIntakeGram: toNumberOrDefault(log && log.proteinIntakeGram, fallback.proteinIntakeGram),
    notes: (log && log.notes) || ''
  };
}

function normalizeSupplementLog(log, date) {
  const fallback = buildDefaultSupplementLog(date || (log && log.date) || getTodayDateText());
  const value = log || {};

  return {
    ...fallback,
    ...value,
    date: value.date || fallback.date,
    proteinPowder: {
      ...fallback.proteinPowder,
      ...(value.proteinPowder || {}),
      taken: Boolean(value.proteinPowder && value.proteinPowder.taken),
      proteinGram: toNumberOrDefault(value.proteinPowder && value.proteinPowder.proteinGram, 0),
      note: (value.proteinPowder && value.proteinPowder.note) || ''
    },
    creatine: {
      ...fallback.creatine,
      ...(value.creatine || {}),
      taken: Boolean(value.creatine && value.creatine.taken),
      doseGram: toNumberOrDefault(value.creatine && value.creatine.doseGram, DEFAULT_CREATINE_DOSE_GRAM),
      note: (value.creatine && value.creatine.note) || ''
    },
    fishOil: {
      ...fallback.fishOil,
      ...(value.fishOil || {}),
      taken: Boolean(value.fishOil && value.fishOil.taken),
      note: (value.fishOil && value.fishOil.note) || ''
    },
    curcumin: {
      ...fallback.curcumin,
      ...(value.curcumin || {}),
      taken: Boolean(value.curcumin && value.curcumin.taken),
      note: (value.curcumin && value.curcumin.note) || ''
    }
  };
}

export function readDailyNutritionLog(date = getTodayDateText(), { storage = getRuntimeStorage() } = {}) {
  const logs = parseLogMap(storage, DAILY_NUTRITION_LOG_STORAGE_KEY);
  return normalizeNutritionLog(logs[date], date);
}

export function saveDailyNutritionLog(log, { storage = getRuntimeStorage() } = {}) {
  const normalized = normalizeNutritionLog(log, log && log.date);
  const logs = parseLogMap(storage, DAILY_NUTRITION_LOG_STORAGE_KEY);
  logs[normalized.date] = normalized;
  storage.setItem(DAILY_NUTRITION_LOG_STORAGE_KEY, JSON.stringify(logs));
  return normalized;
}

export function readDailySupplementLog(date = getTodayDateText(), { storage = getRuntimeStorage() } = {}) {
  const logs = parseLogMap(storage, DAILY_SUPPLEMENT_LOG_STORAGE_KEY);
  return normalizeSupplementLog(logs[date], date);
}

export function saveDailySupplementLog(log, { storage = getRuntimeStorage() } = {}) {
  const normalized = normalizeSupplementLog(log, log && log.date);
  const logs = parseLogMap(storage, DAILY_SUPPLEMENT_LOG_STORAGE_KEY);
  logs[normalized.date] = normalized;
  storage.setItem(DAILY_SUPPLEMENT_LOG_STORAGE_KEY, JSON.stringify(logs));
  return normalized;
}

export function getTodayProteinProgress({ date = getTodayDateText(), storage = getRuntimeStorage() } = {}) {
  const nutrition = readDailyNutritionLog(date, { storage });
  const remainingGram = Math.max(0, nutrition.proteinTargetGram - nutrition.proteinIntakeGram);

  return {
    date,
    proteinTargetGram: nutrition.proteinTargetGram,
    proteinIntakeGram: nutrition.proteinIntakeGram,
    remainingGram,
    percent: nutrition.proteinTargetGram > 0
      ? Math.min(100, Math.round((nutrition.proteinIntakeGram / nutrition.proteinTargetGram) * 100))
      : 0
  };
}

export function getTodaySupplementStatus({ date = getTodayDateText(), storage = getRuntimeStorage() } = {}) {
  const supplement = readDailySupplementLog(date, { storage });

  return {
    date,
    proteinPowderTaken: supplement.proteinPowder.taken,
    creatineTaken: supplement.creatine.taken,
    fishOilTaken: supplement.fishOil.taken,
    curcuminTaken: supplement.curcumin.taken
  };
}
