import assert from 'node:assert/strict';
import {
  createWorkoutSession,
  getLastExercisePerformance,
  readWorkoutHistory,
  saveWorkoutSession,
  updateWorkoutSet
} from './src/data/workouts/workoutSession.js';
import { bodyRecomposition4DayPlan } from './src/data/trainingPlans/bodyRecomposition4DayPlan.js';
import {
  alignWorkoutDraft,
  clearWorkoutDraft,
  getOtherUnfinishedWorkout,
  getRecordEntry,
  getUnfinishedWorkout,
  readCompletedWorkoutHistory,
  readWorkoutDraft,
  saveWorkoutDraft
} from './src/pages/workouts/workoutDraft.js';

const values = new Map();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  }
});

const [day, otherDay] = bodyRecomposition4DayPlan.planDays.filter((day) => day.exercises.length);
const ids = day.exercises.map((exercise) => exercise.exerciseId);
const [logged, retained, ...rest] = ids;
const startedAt = new Date('2026-11-12T10:00:00Z');
let session = createWorkoutSession({ planDayId: day.planDayId, date: startedAt, startedAt });
saveWorkoutDraft(session);
assert.deepEqual(readWorkoutHistory(), []);
assert.equal(getOtherUnfinishedWorkout(otherDay.planDayId), null);
assert.equal(getUnfinishedWorkout(otherDay.planDayId), null);

session = updateWorkoutSet(session, logged, 1, { weight: 50, reps: 10, rir: 2, completed: true });
session = updateWorkoutSet(session, retained, 1, { weight: 25, reps: 10, rir: 0 });
saveWorkoutDraft(session);
saveWorkoutDraft(session);
assert.equal(readWorkoutHistory().length, 1);
assert.equal(readWorkoutHistory()[0].completed, false);
assert.equal(getOtherUnfinishedWorkout(day.planDayId), null);
assert.equal(getOtherUnfinishedWorkout(otherDay.planDayId).id, session.id);
assert.equal(getUnfinishedWorkout(otherDay.planDayId), null);
assert.equal(getOtherUnfinishedWorkout(otherDay.planDayId, null).id, session.id);
assert.deepEqual(readCompletedWorkoutHistory(), []);
assert.equal(getLastExercisePerformance(logged, { completedOnly: true }), null);

const order = [retained, ...rest.slice(0, 4), logged];
session = alignWorkoutDraft(session, order);
assert.equal(session.startedAt, startedAt.toISOString());
assert.equal(session.id, readWorkoutHistory()[0].id);
assert.deepEqual(session.exerciseLogs.map((log) => log.exerciseId), order);
assert.equal(session.exerciseLogs[0].sets[0].rir, 0);
assert.equal(session.exerciseLogs.at(-1).sets[0].weight, 50);
assert.equal(session.exerciseLogs[4].sets[0].weight, null);

session = alignWorkoutDraft(session, order.filter((id) => id !== logged));
assert.deepEqual(readWorkoutHistory()[0].exerciseLogs, session.exerciseLogs);
session = alignWorkoutDraft(session, order);
assert.equal(session.exerciseLogs.at(-1).sets[0].weight, null);
assert.deepEqual(readWorkoutDraft(), session);

const route = '#record:' + encodeURIComponent(session.id);
assert.deepEqual(getRecordEntry(route, null, readWorkoutHistory()), { session, fromHistory: true });
assert.deepEqual(getRecordEntry('#record:missing', session, readWorkoutHistory()), { redirect: 'history' });

session = updateWorkoutSet(session, retained, 1, { completed: true });
const result = saveWorkoutSession(session);
assert.equal(result.ok, true);
clearWorkoutDraft();
assert.equal(readWorkoutDraft(), null);
assert.equal(readWorkoutHistory().length, 1);
assert.equal(readWorkoutHistory()[0].completed, true);
assert.equal(readWorkoutHistory()[0].id, session.id);
assert.deepEqual(getRecordEntry(route, null, readWorkoutHistory()), {
  redirect: 'history:' + encodeURIComponent(session.id)
});
assert.equal(readCompletedWorkoutHistory().length, 1);
assert.equal(getLastExercisePerformance(retained, { completedOnly: true }).sets[0].weight, 25);

const oldDraft = createWorkoutSession({ planDayId: day.planDayId });
const loggedDraft = updateWorkoutSet(oldDraft, logged, 1, { rir: 0 });
saveWorkoutDraft(loggedDraft);
alignWorkoutDraft(loggedDraft, order.filter((id) => id !== logged));
assert.equal(readWorkoutHistory().length, 1);
assert.equal(readWorkoutDraft().id, oldDraft.id);
console.log('H5 workout draft regressions passed');
