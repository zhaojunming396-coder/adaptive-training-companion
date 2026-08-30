export const SELECTED_PLAN_DAY_STORAGE_KEY = 'selectedPlanDay.v1';
export const REST_VIBRATION_STORAGE_KEY = 'restVibrationEnabled.v1';

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

  return null;
}

function readStoredSelection() {
  const storage = getRuntimeStorage();

  if (!storage) {
    return { selectedPlanDayId: '', selectedRestDay: false, selectionSource: 'auto' };
  }

  try {
    const raw = storage.getItem(SELECTED_PLAN_DAY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const isManual = parsed && parsed.source === 'manual';

    return {
      selectedPlanDayId: isManual && parsed.planDayId ? parsed.planDayId : '',
      selectedRestDay: Boolean(isManual && parsed.selectedRestDay),
      selectionSource: isManual ? 'manual' : 'auto'
    };
  } catch {
    return { selectedPlanDayId: '', selectedRestDay: false, selectionSource: 'auto' };
  }
}

function saveStoredSelection(planDayId, selectedRestDay) {
  const storage = getRuntimeStorage();

  if (!storage) {
    return;
  }

  storage.setItem(SELECTED_PLAN_DAY_STORAGE_KEY, JSON.stringify({
    planDayId: planDayId || '',
    source: 'manual',
    selectedRestDay: Boolean(selectedRestDay),
    updatedAt: new Date().toISOString()
  }));
}

function clearStoredSelection() {
  const storage = getRuntimeStorage();

  if (storage && storage.removeItem) {
    storage.removeItem(SELECTED_PLAN_DAY_STORAGE_KEY);
  }
}

function readRestVibrationEnabled() {
  const storage = getRuntimeStorage();

  if (!storage) {
    return true;
  }

  try {
    const raw = storage.getItem(REST_VIBRATION_STORAGE_KEY);
    return raw === null ? true : JSON.parse(raw) === true;
  } catch {
    return true;
  }
}

function saveRestVibrationEnabled(enabled) {
  const storage = getRuntimeStorage();

  if (storage) {
    storage.setItem(REST_VIBRATION_STORAGE_KEY, JSON.stringify(Boolean(enabled)));
  }
}

const storedSelection = readStoredSelection();

export const appState = {
  activeSession: null,
  lastSaveResult: null,
  lastWorkoutSummary: null,
  selectedHistorySessionId: '',
  selectedPlanDayId: storedSelection.selectedPlanDayId,
  selectedRestDay: storedSelection.selectedRestDay,
  selectionSource: storedSelection.selectionSource,
  restVibrationEnabled: readRestVibrationEnabled()
};

export const trainingDayOptions = [
  { label: '上肢 A：胸背主导', planDayId: 'day_1_upper_a' },
  { label: '下肢 A：股四头主导', planDayId: 'day_2_lower_a' },
  { label: '上肢 B：肩背手臂主导', planDayId: 'day_4_upper_b' },
  { label: '下肢 B：臀腿后侧主导', planDayId: 'day_5_lower_b' },
  { label: '有氧 + 核心', planDayId: 'day_6_cardio_core' },
  { label: '今日休息', planDayId: '' }
];

export function navigateTo(page) {
  window.location.hash = page;
}

export function selectTrainingDay(planDayId) {
  appState.selectedPlanDayId = planDayId || '';
  appState.selectedRestDay = !planDayId;
  appState.selectionSource = 'manual';
  appState.activeSession = null;
  saveStoredSelection(appState.selectedPlanDayId, appState.selectedRestDay);
}

export function restoreAutoRecommendation() {
  appState.selectedPlanDayId = '';
  appState.selectedRestDay = false;
  appState.selectionSource = 'auto';
  appState.activeSession = null;
  clearStoredSelection();
}

export function getSelectedPlanDayId() {
  return appState.selectedRestDay ? '' : appState.selectedPlanDayId;
}

export function hasManualSelection() {
  return appState.selectionSource === 'manual';
}

export function getSelectionSourceText() {
  return hasManualSelection() ? '手动选择' : '自动推荐';
}

export function setRestVibrationEnabled(enabled) {
  appState.restVibrationEnabled = Boolean(enabled);
  saveRestVibrationEnabled(appState.restVibrationEnabled);
}

export function notifyRestFinished() {
  if (!appState.restVibrationEnabled) {
    return false;
  }

  try {
    if (typeof wx !== 'undefined' && wx && typeof wx.vibrateShort === 'function') {
      wx.vibrateShort({ type: 'medium' });
      return true;
    }

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      return navigator.vibrate(300);
    }
  } catch {
    return false;
  }

  return false;
}

export function formatTarget(target) {
  if (!target) {
    return '';
  }

  return [
    `组数: ${target.sets ?? '-'}`,
    `次数: ${target.reps ?? '-'}`,
    `休息: ${target.restSeconds ?? '-'} 秒`,
    `RIR: ${target.rir ?? '-'}`,
    `节奏: ${target.tempo || '-'}`
  ].join(' / ');
}

export function getPlanDayName(plan, planDayId) {
  const planDay = (plan.planDays || []).find((day) => day.planDayId === planDayId);
  return planDay ? planDay.nameZh : planDayId;
}

export function toNumberOrNull(value) {
  return value === '' || value === null || value === undefined ? null : Number(value);
}
