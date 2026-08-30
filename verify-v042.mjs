import { validateSetBeforeComplete } from './src/pages/workouts/workoutRecordPage.js';

const dbBenchExercise = {
  detail: {
    nameZh: '哑铃卧推',
    trackingType: 'weight_reps'
  }
};

const plankExercise = {
  detail: {
    nameZh: '平板支撑',
    trackingType: 'time_based'
  }
};

const cases = [
  {
    name: 'weight_reps 缺重量',
    result: validateSetBeforeComplete({
      exercise: dbBenchExercise,
      set: { setIndex: 1, weight: null, reps: 10 },
      exerciseName: '哑铃卧推',
      setIndex: 1
    })
  },
  {
    name: 'weight_reps 缺次数',
    result: validateSetBeforeComplete({
      exercise: dbBenchExercise,
      set: { setIndex: 2, weight: 22.5, reps: '' },
      exerciseName: '哑铃卧推',
      setIndex: 2
    })
  },
  {
    name: 'weight_reps 完整',
    result: validateSetBeforeComplete({
      exercise: dbBenchExercise,
      set: { setIndex: 3, weight: 22.5, reps: 8 },
      exerciseName: '哑铃卧推',
      setIndex: 3
    })
  },
  {
    name: 'time_based 缺时长',
    result: validateSetBeforeComplete({
      exercise: plankExercise,
      set: { setIndex: 1, durationSeconds: '' },
      exerciseName: '平板支撑',
      setIndex: 1
    })
  },
  {
    name: 'time_based 完整',
    result: validateSetBeforeComplete({
      exercise: plankExercise,
      set: { setIndex: 2, durationSeconds: 45 },
      exerciseName: '平板支撑',
      setIndex: 2
    })
  }
];

const checks = {
  missingWeightBlocked: cases[0].result.isValid === false && cases[0].result.missingFields.includes('weight'),
  missingRepsBlocked: cases[1].result.isValid === false && cases[1].result.missingFields.includes('reps'),
  completeWeightRepsAllowed: cases[2].result.isValid === true,
  missingDurationBlocked: cases[3].result.isValid === false && cases[3].result.missingFields.includes('durationSeconds'),
  completeTimeBasedAllowed: cases[4].result.isValid === true
};

console.log(JSON.stringify({ checks, cases }, null, 2));

if (Object.values(checks).some((value) => value !== true)) {
  process.exit(1);
}
