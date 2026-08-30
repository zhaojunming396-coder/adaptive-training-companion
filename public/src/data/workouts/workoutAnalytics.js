import { exercises as defaultExercises } from '../exercises/exercises.js';

function toDate(value) {
  return value instanceof Date ? value : new Date(value || 0);
}

function getSessionTime(session) {
  return new Date(session.endedAt || session.startedAt || session.date || 0).getTime();
}

function getCompletedSets(log) {
  return Array.isArray(log && log.sets) ? log.sets.filter((set) => set.completed === true) : [];
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getExerciseMap(exerciseList = defaultExercises) {
  return new Map((Array.isArray(exerciseList) ? exerciseList : []).map((exercise) => [exercise.id, exercise]));
}

function getExerciseName(exerciseId, exerciseList = defaultExercises) {
  const exercise = getExerciseMap(exerciseList).get(exerciseId);
  return exercise ? exercise.nameZh : exerciseId;
}

function getStartOfWeek(date) {
  const value = toDate(date);
  const day = value.getDay() || 7;
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day + 1);
  return start;
}

function getStartOfMonth(date) {
  const value = toDate(date);
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function getSetVolume(set) {
  const weight = toNumber(set && set.weight);
  const reps = toNumber(set && set.reps);
  return weight === null || reps === null ? 0 : weight * reps;
}

function isStatisticallyUsableSet(set, trackingType) {
  if (!set || set.completed !== true) {
    return false;
  }

  if (trackingType === 'time_based') {
    return toNumber(set.durationSeconds) !== null;
  }

  if (trackingType === 'distance_time') {
    return toNumber(set.durationSeconds) !== null || toNumber(set.distance) !== null;
  }

  if (trackingType === 'reps_only') {
    return toNumber(set.reps) !== null;
  }

  return toNumber(set.weight) !== null && toNumber(set.reps) !== null;
}

function getLogVolume(log) {
  return getCompletedSets(log).reduce((sum, set) => sum + getSetVolume(set), 0);
}

function getSessionVolume(session) {
  return (Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [])
    .reduce((sum, log) => sum + getLogVolume(log), 0);
}

function getSessionCompletedSetCount(session) {
  return (Array.isArray(session && session.exerciseLogs) ? session.exerciseLogs : [])
    .reduce((sum, log) => sum + getCompletedSets(log).length, 0);
}

function sortSessions(history) {
  return (Array.isArray(history) ? history : [])
    .slice()
    .sort((a, b) => getSessionTime(a) - getSessionTime(b));
}

function sortSessionsDesc(history) {
  return sortSessions(history).reverse();
}

function getExerciseRecords(history, exerciseId) {
  return sortSessions(history).flatMap((session) =>
    (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : [])
      .filter((log) => log.exerciseId === exerciseId)
      .map((log) => {
        const completedSets = getCompletedSets(log);
        const weights = completedSets.map((set) => toNumber(set.weight)).filter((weight) => weight !== null);
        const reps = completedSets.map((set) => toNumber(set.reps)).filter((rep) => rep !== null);
        const volume = getLogVolume(log);

        return {
          sessionId: session.id,
          date: session.date,
          endedAt: session.endedAt,
          planDayId: session.planDayId,
          exerciseId,
          maxWeight: weights.length > 0 ? Math.max(...weights) : null,
          maxReps: reps.length > 0 ? Math.max(...reps) : null,
          totalReps: reps.reduce((sum, rep) => sum + rep, 0),
          totalVolume: volume,
          bestSetVolume: completedSets.reduce((max, set) => Math.max(max, getSetVolume(set)), 0),
          sets: completedSets
        };
      })
      .filter((record) => record.sets.length > 0)
  );
}

function compareExerciseRecords(current, previous) {
  if (!previous) {
    return {
      status: '暂无上次记录',
      improved: false,
      message: '暂无上次记录，先建立稳定基准。'
    };
  }

  if (current.maxWeight === previous.maxWeight && current.totalReps > previous.totalReps) {
    return {
      status: '进步',
      improved: true,
      message: `同重量下比上次多完成 ${current.totalReps - previous.totalReps} 次。`
    };
  }

  if (current.totalReps === previous.totalReps && current.maxWeight !== null && previous.maxWeight !== null && current.maxWeight > previous.maxWeight) {
    return {
      status: '进步',
      improved: true,
      message: `同次数下重量提高 ${current.maxWeight - previous.maxWeight}kg。`
    };
  }

  if (current.totalVolume > previous.totalVolume) {
    return {
      status: '进步',
      improved: true,
      message: `总容量增加 ${Math.round(current.totalVolume - previous.totalVolume)} kg·次。`
    };
  }

  if (current.totalVolume === previous.totalVolume) {
    return {
      status: '持平',
      improved: false,
      message: '总容量与上次持平。'
    };
  }

  return {
    status: '下降',
    improved: false,
    message: `总容量下降 ${Math.round(previous.totalVolume - current.totalVolume)} kg·次。`
  };
}

function getUniqueExerciseIds(history) {
  return [...new Set((Array.isArray(history) ? history : []).flatMap((session) =>
    (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : []).map((log) => log.exerciseId)
  ))].sort();
}

export function buildTrainingOverview(history, { now = new Date() } = {}) {
  const sessions = Array.isArray(history) ? history : [];
  const weekStart = getStartOfWeek(now).getTime();
  const monthStart = getStartOfMonth(now).getTime();
  const completedSessions = sessions.filter((session) => session.completed !== false);
  const latest = sortSessionsDesc(completedSessions)[0] || null;

  return {
    weeklyTrainingCount: completedSessions.filter((session) => getSessionTime(session) >= weekStart).length,
    monthlyTrainingCount: completedSessions.filter((session) => getSessionTime(session) >= monthStart).length,
    totalTrainingCount: completedSessions.length,
    totalCompletedSets: completedSessions.reduce((sum, session) => sum + getSessionCompletedSetCount(session), 0),
    totalVolume: completedSessions.reduce((sum, session) => sum + getSessionVolume(session), 0),
    lastTrainingDate: latest ? latest.date : ''
  };
}

export function buildDataCompletenessSummary(history, exerciseList = defaultExercises) {
  const exerciseMap = getExerciseMap(exerciseList);
  const summary = {
    completedSetCount: 0,
    validStatSetCount: 0,
    missingDataSetCount: 0
  };

  (Array.isArray(history) ? history : []).forEach((session) => {
    (Array.isArray(session.exerciseLogs) ? session.exerciseLogs : []).forEach((log) => {
      const exercise = exerciseMap.get(log.exerciseId);
      const trackingType = exercise ? exercise.trackingType : 'weight_reps';

      getCompletedSets(log).forEach((set) => {
        summary.completedSetCount += 1;

        if (isStatisticallyUsableSet(set, trackingType)) {
          summary.validStatSetCount += 1;
        } else {
          summary.missingDataSetCount += 1;
        }
      });
    });
  });

  return summary;
}

export function getRecentSessionVolumeTrend(history, limit = 7) {
  return sortSessionsDesc(history)
    .slice(0, limit)
    .reverse()
    .map((session) => ({
      sessionId: session.id,
      date: session.date,
      planDayId: session.planDayId,
      volume: getSessionVolume(session)
    }));
}

export function getRecentTrainingFrequency(history, days = 28) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  const buckets = [];

  for (let index = 0; index < days; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const dateText = day.toISOString().slice(0, 10);
    buckets.push({ date: dateText, count: 0 });
  }

  const byDate = new Map(buckets.map((item) => [item.date, item]));
  (Array.isArray(history) ? history : []).forEach((session) => {
    if (byDate.has(session.date)) {
      byDate.get(session.date).count += 1;
    }
  });

  return buckets;
}

export function buildExerciseAnalysis(history, exerciseId, exerciseList = defaultExercises) {
  const records = getExerciseRecords(history, exerciseId);
  const recentRecords = records.slice().reverse().slice(0, 5);
  const latest = recentRecords[0] || null;
  const previous = recentRecords[1] || null;
  const progress = latest ? compareExerciseRecords(latest, previous) : null;
  const highestWeight = records.reduce((max, record) => Math.max(max, record.maxWeight || 0), 0);
  const highestVolume = records.reduce((max, record) => Math.max(max, record.totalVolume || 0), 0);

  return {
    exerciseId,
    nameZh: getExerciseName(exerciseId, exerciseList),
    latestWeight: latest ? latest.maxWeight : null,
    latestReps: latest ? latest.totalReps : null,
    highestWeight,
    highestVolume,
    recentRecords,
    progress
  };
}

export function buildPrRecords(history, exerciseList = defaultExercises) {
  return getUniqueExerciseIds(history).map((exerciseId) => {
    const records = getExerciseRecords(history, exerciseId);
    const sets = records.flatMap((record) => record.sets.map((set) => ({ ...set, date: record.date })));
    const highestWeightSet = sets.reduce((best, set) => (toNumber(set.weight) || 0) > (toNumber(best && best.weight) || 0) ? set : best, null);
    const highestRepsSet = sets.reduce((best, set) => (toNumber(set.reps) || 0) > (toNumber(best && best.reps) || 0) ? set : best, null);
    const bestSetVolume = sets.reduce((best, set) => getSetVolume(set) > getSetVolume(best) ? set : best, null);
    const bestTotalVolume = records.reduce((best, record) => record.totalVolume > (best ? best.totalVolume : 0) ? record : best, null);

    return {
      exerciseId,
      nameZh: getExerciseName(exerciseId, exerciseList),
      highestWeight: highestWeightSet ? toNumber(highestWeightSet.weight) : null,
      highestWeightDate: highestWeightSet ? highestWeightSet.date : '',
      highestReps: highestRepsSet ? toNumber(highestRepsSet.reps) : null,
      highestRepsDate: highestRepsSet ? highestRepsSet.date : '',
      bestSetVolume: bestSetVolume ? getSetVolume(bestSetVolume) : 0,
      bestSetVolumeDate: bestSetVolume ? bestSetVolume.date : '',
      bestTotalVolume: bestTotalVolume ? bestTotalVolume.totalVolume : 0,
      bestTotalVolumeDate: bestTotalVolume ? bestTotalVolume.date : ''
    };
  });
}

export function getAnalyzableExercises(history, exerciseList = defaultExercises) {
  return getUniqueExerciseIds(history).map((exerciseId) => ({
    exerciseId,
    nameZh: getExerciseName(exerciseId, exerciseList)
  }));
}

export function buildWorkoutProgressSummary(currentSession, history, exerciseList = defaultExercises) {
  const previousSameDay = sortSessionsDesc(history)
    .filter((session) => session.id !== currentSession.id && session.planDayId === currentSession.planDayId)[0] || null;
  const currentVolume = getSessionVolume(currentSession);
  const previousVolume = previousSameDay ? getSessionVolume(previousSameDay) : 0;
  const diff = currentVolume - previousVolume;
  const exerciseSummaries = (Array.isArray(currentSession.exerciseLogs) ? currentSession.exerciseLogs : []).map((log) => {
    const records = getExerciseRecords([...(Array.isArray(history) ? history : []), currentSession], log.exerciseId);
    const currentRecord = records.find((record) => record.sessionId === currentSession.id);
    const previousRecord = records.slice().reverse().find((record) =>
      record.sessionId !== currentSession.id && new Date(record.endedAt || record.date || 0).getTime() <= getSessionTime(currentSession)
    );
    const progress = currentRecord ? compareExerciseRecords(currentRecord, previousRecord) : null;

    return {
      exerciseId: log.exerciseId,
      nameZh: getExerciseName(log.exerciseId, exerciseList),
      status: progress ? progress.status : '暂无数据',
      message: progress ? progress.message : '暂无可分析数据。'
    };
  });

  return {
    totalVolume: currentVolume,
    previousSameDayVolume: previousVolume,
    diff,
    status: previousSameDay ? (diff > 0 ? '增加' : diff === 0 ? '持平' : '下降') : '暂无上次同训练日',
    exerciseSummaries
  };
}
