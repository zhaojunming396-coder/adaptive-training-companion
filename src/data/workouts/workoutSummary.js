import { exercises as defaultExercises } from '../exercises/exercises.js';
import { buildWorkoutProgressSummary } from './workoutAnalytics.js';
import {
  getRecentCompletedExerciseLogs,
  recommendWeightForTarget
} from './weightRecommendation.js';

function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getCompletedSets(log) {
  return Array.isArray(log && log.sets)
    ? log.sets.filter((set) => set && set.completed === true)
    : [];
}

function getExerciseMap(exerciseList) {
  return new Map((Array.isArray(exerciseList) ? exerciseList : []).map((exercise) => [exercise.id, exercise]));
}

function formatCurrentPerformance(log) {
  const sets = getCompletedSets(log);
  const weightedSets = sets.filter((set) => toNumber(set.weight) !== null && toNumber(set.reps) !== null);

  if (weightedSets.length > 0) {
    const weights = [...new Set(weightedSets.map((set) => toNumber(set.weight)))];
    const reps = weightedSets.map((set) => toNumber(set.reps)).join(' / ');
    const weightText = weights.length === 1
      ? `${weights[0]}kg`
      : weightedSets.map((set) => `${toNumber(set.weight)}kg × ${toNumber(set.reps)}`).join(' · ');

    return weights.length === 1 ? `${weightText} × ${reps}` : weightText;
  }

  const repSets = sets.map((set) => toNumber(set.reps)).filter((value) => value !== null);
  if (repSets.length > 0) {
    return `${repSets.join(' / ')} 次`;
  }

  const durations = sets.map((set) => toNumber(set.durationSeconds)).filter((value) => value !== null);
  return durations.length > 0 ? `${durations.join(' / ')} 秒` : '已完成';
}

function formatRecommendation(recommendation) {
  if (recommendation.type === 'time') {
    return recommendation.suggestedDurationText || '按计划目标继续';
  }

  const parts = [recommendation.suggestedWeightText, recommendation.suggestedRepsText].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : '按计划目标继续';
}

export function buildAdaptiveWorkoutSummary({
  currentSession,
  history,
  planExercises,
  exerciseList = defaultExercises,
  userProfile = { baselineLifts: [] },
  recommendationLimit = 3
} = {}) {
  const safeHistory = Array.isArray(history) ? history : [];
  const planMap = new Map((Array.isArray(planExercises) ? planExercises : [])
    .map((item) => [item.exerciseId, item]));
  const exerciseMap = getExerciseMap(exerciseList);
  const progress = buildWorkoutProgressSummary(currentSession, safeHistory, exerciseList);
  const comparisonMap = new Map(progress.exerciseSummaries.map((item) => [item.exerciseId, item]));
  const completedLogs = (Array.isArray(currentSession && currentSession.exerciseLogs)
    ? currentSession.exerciseLogs
    : []).filter((log) => getCompletedSets(log).length > 0);

  const recommendations = completedLogs.slice(0, recommendationLimit).map((log) => {
    const planExercise = planMap.get(log.exerciseId) || {
      exerciseId: log.exerciseId,
      target: {}
    };
    const recentExerciseLogs = getRecentCompletedExerciseLogs(log.exerciseId, safeHistory, 3);
    const recommendation = recommendWeightForTarget({
      exercise: exerciseMap.get(log.exerciseId),
      planExercise,
      lastExerciseLog: recentExerciseLogs[recentExerciseLogs.length - 1] || log,
      recentExerciseLogs: recentExerciseLogs.length > 0 ? recentExerciseLogs : [log],
      userProfile,
      exerciseList
    });
    const comparison = comparisonMap.get(log.exerciseId) || null;

    return {
      exerciseId: log.exerciseId,
      nameZh: exerciseMap.get(log.exerciseId)?.nameZh || log.exerciseId,
      currentPerformanceText: formatCurrentPerformance(log),
      performanceStatus: comparison ? comparison.status : '暂无对比',
      performanceMessage: comparison ? comparison.message : '暂无可比较记录。',
      strategy: recommendation.strategy,
      recommendationText: formatRecommendation(recommendation),
      reason: recommendation.reason,
      recommendation
    };
  });

  return {
    ...progress,
    recommendations
  };
}
