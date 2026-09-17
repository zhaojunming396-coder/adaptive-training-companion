import assert from 'node:assert/strict';
import { recommendWeightForTarget } from './src/data/workouts/weightRecommendation.js';

const exercise = {
  id: 'barbell_bench_press',
  nameZh: '杠铃卧推',
  trackingType: 'weight_reps',
  equipment: ['barbell'],
  category: 'compound'
};

const planExercise = {
  exerciseId: exercise.id,
  target: {
    sets: 3,
    reps: '6-8',
    rir: 2
  }
};

function buildLog(reps, rirs, { weight = 50, completed = reps.length } = {}) {
  return {
    exerciseId: exercise.id,
    sets: reps.map((value, index) => ({
      setIndex: index + 1,
      weight,
      weightUnit: 'kg',
      reps: value,
      rir: rirs[index] ?? null,
      completed: index < completed
    }))
  };
}

function recommend(log) {
  return recommendWeightForTarget({
    exercise,
    planExercise,
    lastExerciseLog: log,
    userProfile: { baselineLifts: [] }
  });
}

const increase = recommend(buildLog([8, 8, 8], [2, 2, 2]));
assert.equal(increase.strategy, '建议加重量');
assert.equal(increase.suggestedWeight, 52.5);
assert.equal(increase.suggestedRepsText, '6-8 次');

const maintain = recommend(buildLog([6, 6, 5], [1, 1, 0]));
assert.equal(maintain.strategy, '建议维持重量');
assert.equal(maintain.suggestedWeight, 50);
assert.equal(maintain.suggestedRepsText, '6 / 6 / 6');

const reduce = recommend(buildLog([5, 4, 4], [0, 0, 0]));
assert.equal(reduce.strategy, '建议降低重量');
assert.equal(reduce.suggestedWeight, 47.5);

const incomplete = recommend(buildLog([8, 8, 8], [2, 2, 2], { completed: 2 }));
assert.equal(incomplete.strategy, '建议维持重量');

const missingRir = recommend(buildLog([8, 8, 8], [null, null, null]));
assert.equal(missingRir.strategy, '建议维持重量');

const repsProgression = recommend(buildLog([8, 7, 7], [2, 2, 1]));
assert.equal(repsProgression.strategy, '建议维持重量');
assert.equal(repsProgression.suggestedRepsText, '8 / 8 / 8');

console.log('第一阶段推荐规则测试通过：加重、维持、降重、未完成组、缺少 RIR、次数推进。');
