import { WORKOUT_HISTORY_STORAGE_KEY } from './workoutSession.js';
import {
  EQUIPMENT_WEIGHT_RULES_STORAGE_KEY,
  USER_TRAINING_PROFILE_STORAGE_KEY
} from './weightRecommendation.js';
import {
  DAILY_NUTRITION_LOG_STORAGE_KEY,
  DAILY_SUPPLEMENT_LOG_STORAGE_KEY
} from './dailyNutrition.js';

export const APP_VERSION = 'v0.5';
export const SELECTED_PLAN_DAY_STORAGE_KEY = 'selectedPlanDay.v1';
export const REST_VIBRATION_STORAGE_KEY = 'restVibrationEnabled.v1';
export const BACKUP_BEFORE_IMPORT_STORAGE_KEY = 'backupBeforeImport.v1';

export const BACKUP_STORAGE_KEYS = [
  USER_TRAINING_PROFILE_STORAGE_KEY,
  WORKOUT_HISTORY_STORAGE_KEY,
  SELECTED_PLAN_DAY_STORAGE_KEY,
  REST_VIBRATION_STORAGE_KEY,
  EQUIPMENT_WEIGHT_RULES_STORAGE_KEY,
  DAILY_NUTRITION_LOG_STORAGE_KEY,
  DAILY_SUPPLEMENT_LOG_STORAGE_KEY
];

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

  return null;
}

function parseStorageValue(raw) {
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function stringifyStorageValue(value) {
  return JSON.stringify(value);
}

export function buildBackupPayload({ storage = getRuntimeStorage(), exportedAt = new Date() } = {}) {
  if (!storage) {
    throw new Error('当前环境不支持本地缓存。');
  }

  const storageData = {};
  BACKUP_STORAGE_KEYS.forEach((key) => {
    storageData[key] = parseStorageValue(storage.getItem(key));
  });

  return {
    appVersion: APP_VERSION,
    exportedAt: new Date(exportedAt).toISOString(),
    storageData
  };
}

export function validateBackupPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: '备份文件格式错误。' };
  }

  if (!payload.storageData || typeof payload.storageData !== 'object' || Array.isArray(payload.storageData)) {
    return { ok: false, error: '备份文件缺少 storageData。' };
  }

  return { ok: true, error: '' };
}

export function restoreBackupPayload(payload, { storage = getRuntimeStorage() } = {}) {
  const validation = validateBackupPayload(payload);

  if (!validation.ok) {
    return validation;
  }

  if (!storage) {
    return { ok: false, error: '当前环境不支持本地缓存。' };
  }

  BACKUP_STORAGE_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload.storageData, key)) {
      storage.setItem(key, stringifyStorageValue(payload.storageData[key]));
    }
  });

  return { ok: true, error: '' };
}

export function getBackupFileName(date = new Date()) {
  const stamp = new Date(date).toISOString().slice(0, 10);
  return `workout-backup-${stamp}.json`;
}

export function getBeforeImportBackupFileName(date = new Date()) {
  const stamp = new Date(date).toISOString().replace(/[:.]/g, '-');
  return `fitness-backup-before-import-${stamp}.json`;
}

export function saveBackupBeforeImport({ storage = getRuntimeStorage(), exportedAt = new Date() } = {}) {
  if (!storage) {
    throw new Error('当前环境不支持本地缓存。');
  }

  const payload = buildBackupPayload({ storage, exportedAt });
  storage.setItem(BACKUP_BEFORE_IMPORT_STORAGE_KEY, JSON.stringify(payload));

  return payload;
}
