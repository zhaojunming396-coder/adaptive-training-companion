import {
  createWorkoutSession,
  readWorkoutHistory,
  WORKOUT_HISTORY_STORAGE_KEY
} from '../../data/workouts/workoutSession.js';

const DRAFT_KEY = 'activeWorkoutDraft.v1';

export function readWorkoutDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY))?.session || null;
  } catch {
    return null;
  }
}

export function hasRecordedSets(log) {
  return log.sets?.some((set) => set.completed === true ||
    [set.weight, set.reps, set.rir, set.durationSeconds, set.distance]
      .some((value) => value != null && value !== ''));
}

function syncUnfinishedHistory(session) {
  const history = readWorkoutHistory();
  const existing = history.find((item) => item.id === session.id);
  if (existing?.completed === true) return;

  const rest = history.filter((item) => item.id !== session.id);
  if (session.exerciseLogs.some(hasRecordedSets)) {
    localStorage.setItem(WORKOUT_HISTORY_STORAGE_KEY, JSON.stringify([
      { ...session, completed: false },
      ...rest
    ]));
  } else if (existing) {
    localStorage.setItem(WORKOUT_HISTORY_STORAGE_KEY, JSON.stringify(rest));
  }
}

export function saveWorkoutDraft(session) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({
    planDayId: session.planDayId,
    exerciseIds: session.exerciseLogs.map((log) => log.exerciseId),
    session,
    updatedAt: new Date().toISOString()
  }));
  syncUnfinishedHistory(session);
}

export function clearWorkoutDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function getUnfinishedWorkout(planDayId, draft = readWorkoutDraft(), history = readWorkoutHistory()) {
  if (draft?.planDayId === planDayId &&
      !history.some((item) => item.id === draft.id && item.completed === true)) return draft;

  return history.filter((item) => item.planDayId === planDayId && item.completed === false)
    .sort((a, b) => Date.parse(b.startedAt || b.date) - Date.parse(a.startedAt || a.date))[0] || null;
}

export function alignWorkoutDraft(session, exerciseIds) {
  const existingLogs = new Map(session.exerciseLogs.map((log) => [log.exerciseId, log]));
  const fresh = createWorkoutSession({
    planDayId: session.planDayId,
    exerciseIds,
    date: new Date(session.startedAt || session.date)
  });
  const freshLogs = new Map(fresh.exerciseLogs.map((log) => [log.exerciseId, { ...log, date: session.date }]));
  const next = {
    ...session,
    exerciseLogs: exerciseIds.map((id) => existingLogs.get(id) || freshLogs.get(id)).filter(Boolean)
  };
  const draft = readWorkoutDraft();
  if (!draft || draft.id === session.id) saveWorkoutDraft(next);
  else syncUnfinishedHistory(next);
  return next;
}

export function migrateStoredDraftToHistory() {
  const draft = readWorkoutDraft();
  if (draft && !readWorkoutHistory().some((item) => item.id === draft.id)) syncUnfinishedHistory(draft);
}

export function readCompletedWorkoutHistory() {
  return readWorkoutHistory().filter((item) => item.completed !== false);
}

export function getRecordEntry(hash, draft, history, planDayId) {
  const fromHistory = hash.startsWith('#record:');
  let id = '';
  if (fromHistory) {
    try {
      id = decodeURIComponent(hash.slice('#record:'.length));
    } catch {
      return { redirect: 'history' };
    }
    const saved = history.find((item) => String(item.id) === id);
    if (!saved) return { redirect: 'history' };
    if (saved.completed !== false) return { redirect: `history:${encodeURIComponent(id)}` };
    return { session: String(draft?.id) === id ? draft : saved, fromHistory };
  }

  return { session: getUnfinishedWorkout(planDayId, draft, history), fromHistory };
}
