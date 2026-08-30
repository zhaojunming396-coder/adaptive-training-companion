import {
  buildExerciseAnalysis,
  buildPrRecords,
  buildTrainingOverview,
  buildWorkoutProgressSummary,
  getRecentSessionVolumeTrend
} from './src/data/workouts/workoutAnalytics.js';

function set(setIndex, weight, reps, completed = true) {
  return {
    setIndex,
    weight,
    weightUnit: 'kg',
    reps,
    rir: 2,
    completed
  };
}

function session(id, date, planDayId, exerciseLogs) {
  return {
    id,
    date,
    planDayId,
    startedAt: `${date}T10:00:00.000Z`,
    endedAt: `${date}T11:00:00.000Z`,
    completed: true,
    exerciseLogs
  };
}

const history = [
  session('s1', '2026-07-01', 'day_1_upper_a', [
    { exerciseId: 'db_bench_press', sets: [set(1, 20, 8), set(2, 20, 8)] },
    { exerciseId: 'lat_pulldown', sets: [set(1, 45, 8)] }
  ]),
  session('s2', '2026-07-04', 'day_1_upper_a', [
    { exerciseId: 'db_bench_press', sets: [set(1, 20, 10), set(2, 20, 9)] },
    { exerciseId: 'lat_pulldown', sets: [set(1, 45, 9)] }
  ]),
  session('s3', '2026-07-08', 'day_2_lower_a', [
    { exerciseId: 'back_squat', sets: [set(1, 40, 6), set(2, 40, 6)] }
  ]),
  session('s4', '2026-07-11', 'day_1_upper_a', [
    { exerciseId: 'db_bench_press', sets: [set(1, 22.5, 8), set(2, 22.5, 8)] },
    { exerciseId: 'lat_pulldown', sets: [set(1, 50, 8)] }
  ])
];

const overview = buildTrainingOverview(history, { now: new Date('2026-07-12T12:00:00.000Z') });
const dbAnalysis = buildExerciseAnalysis(history, 'db_bench_press');
const prs = buildPrRecords(history);
const trend = getRecentSessionVolumeTrend(history, 7);
const summary = buildWorkoutProgressSummary(history[3], history);

console.log(JSON.stringify({
  overview,
  dbAnalysis: {
    latestWeight: dbAnalysis.latestWeight,
    latestReps: dbAnalysis.latestReps,
    highestWeight: dbAnalysis.highestWeight,
    highestVolume: dbAnalysis.highestVolume,
    recentCount: dbAnalysis.recentRecords.length,
    progress: dbAnalysis.progress
  },
  prCount: prs.length,
  dbPr: prs.find((item) => item.exerciseId === 'db_bench_press'),
  trendCount: trend.length,
  summary: {
    totalVolume: summary.totalVolume,
    previousSameDayVolume: summary.previousSameDayVolume,
    status: summary.status,
    exerciseCount: summary.exerciseSummaries.length
  }
}, null, 2));
