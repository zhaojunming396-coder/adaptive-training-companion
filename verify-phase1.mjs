import assert from 'node:assert/strict';
import {
  analyzeExerciseTrend,
  getRecentCompletedExerciseLogs,
  getWeightIncrementKg,
  recommendWeightForTarget,
  summarizeExercisePerformance
} from './src/data/workouts/weightRecommendation.js';

const target = { sets: 3, reps: '6-8', rir: 2 };
const barbellExercise = {
  id: 'barbell_bench_press',
  nameZh: '杠铃卧推',
  trackingType: 'weight_reps',
  equipment: ['barbell'],
  progressionRule: 'double_progression'
};

function log(weight, reps, rirs, { legacy = false, completedCount = reps.length, date = '' } = {}) {
  return {
    exerciseId: barbellExercise.id,
    date,
    sets: reps.map((value, index) => {
      const set = { setIndex: index + 1, weight, weightUnit: 'kg', reps: value };

      if (!legacy) {
        set.completed = index < completedCount;
        set.rir = rirs ? rirs[index] ?? null : null;
      }

      return set;
    })
  };
}

function recommend(logs, { exercise = barbellExercise, planTarget = target } = {}) {
  return recommendWeightForTarget({
    exercise,
    planExercise: { exerciseId: exercise.id, target: planTarget },
    recentExerciseLogs: logs,
    lastExerciseLog: logs[logs.length - 1],
    userProfile: { baselineLifts: [] }
  });
}

const tests = [];
function test(name, run) {
  run();
  tests.push(name);
}

test('01 稳定进步后加重', () => {
  const result = recommend([
    log(50, [6, 6, 6], [1, 1, 1]),
    log(50, [7, 7, 7], [2, 2, 2]),
    log(50, [8, 8, 8], [2, 2, 2])
  ]);
  assert.equal(result.strategy, '建议加重量');
  assert.equal(result.suggestedWeight, 52.5);
});

test('02 达到次数上限且趋势确认后加重', () => {
  const result = recommend([
    log(50, [8, 8, 7], [2, 2, 2]),
    log(50, [8, 8, 8], [2, 2, 2])
  ]);
  assert.equal(result.strategy, '建议加重量');
});

test('03 达到上限但 RIR 0 时保持', () => {
  const result = recommend([
    log(50, [8, 8, 8], [1, 1, 1]),
    log(50, [8, 8, 8], [0, 0, 0])
  ]);
  assert.equal(result.strategy, '建议维持重量');
  assert.equal(result.phase, 'top_range_high_strain');
});

test('04 加重后次数下降属于适应阶段', () => {
  const result = recommend([
    log(50, [8, 8, 8], [2, 2, 2]),
    log(52.5, [6, 6, 6], [2, 2, 2])
  ]);
  assert.equal(result.strategy, '建议维持重量');
  assert.equal(result.phase, 'load_adaptation');
  assert.equal(result.suggestedWeight, 52.5);
});

test('05 单次状态差不降重', () => {
  const result = recommend([
    log(55, [8, 8, 8], [2, 2, 2]),
    log(55, [5, 5, 4], [1, 0, 0])
  ]);
  assert.equal(result.strategy, '建议维持重量');
  assert.equal(result.phase, 'single_bad_session');
});

test('06 连续两次状态差只提示恢复', () => {
  const result = recommend([
    log(55, [8, 8, 8], [2, 2, 2]),
    log(55, [5, 5, 4], [1, 0, 0]),
    log(55, [5, 4, 4], [0, 0, 0])
  ]);
  assert.equal(result.strategy, '建议维持重量');
  assert.equal(result.phase, 'recovery_watch');
});

test('07 连续三次明显失败才降重', () => {
  const result = recommend([
    log(55, [6, 5, 5], [1, 1, 0]),
    log(55, [5, 5, 4], [1, 0, 0]),
    log(55, [5, 4, 4], [0, 0, 0])
  ]);
  assert.equal(result.strategy, '建议降低重量');
  assert.equal(result.suggestedWeight, 52.5);
});

test('08 RIR 全部缺失时保守保持', () => {
  const result = recommend([
    log(50, [6, 6, 6], null),
    log(50, [7, 7, 7], null),
    log(50, [8, 8, 8], null)
  ]);
  assert.equal(result.strategy, '建议维持重量');
  assert.equal(result.phase, 'rir_incomplete');
});

test('09 部分工作组未达标不立即降重', () => {
  const result = recommend([
    log(50, [8, 8, 8], [2, 2, 2]),
    log(50, [8, 7, 5], [2, 0, 0])
  ], { planTarget: { sets: 3, reps: 8, rir: 2 } });
  assert.equal(result.strategy, '建议维持重量');
});

test('10 连续多次达到上限提高加重优先级', () => {
  const result = recommend([
    log(50, [8, 8, 8], [2, 2, 2]),
    log(50, [8, 8, 8], [2, 2, 2]),
    log(50, [8, 8, 8], [3, 3, 3])
  ]);
  assert.equal(result.strategy, '建议加重量');
});

test('11 重量进步与次数下降被正确识别', () => {
  const logs = [
    log(50, [8, 8, 8], [2, 2, 2]),
    log(52.5, [6, 6, 6], [2, 2, 2]),
    log(52.5, [7, 6, 6], [2, 2, 2])
  ];
  const trend = analyzeExerciseTrend(
    logs.map((item) => summarizeExercisePerformance(item, target)),
    target
  );
  assert.equal(trend.weightProgress, true);
  assert.equal(recommend(logs).strategy, '建议维持重量');
});

test('12 同重量次数进步被正确识别', () => {
  const result = recommend([
    log(50, [6, 6, 6], [1, 1, 1]),
    log(50, [7, 7, 6], [2, 2, 2]),
    log(50, [8, 7, 7], [2, 2, 2])
  ]);
  assert.equal(result.phase, 'reps_progress');
  assert.equal(result.suggestedRepsText, '8 / 8 / 8');
});

test('13 RIR 3/3/0 不被平均值掩盖', () => {
  const result = recommend([
    log(50, [8, 8, 7], [2, 2, 2]),
    log(50, [8, 8, 8], [3, 3, 0])
  ]);
  assert.equal(result.averageRir, 2);
  assert.equal(result.minimumRir, 0);
  assert.equal(result.strategy, '建议维持重量');
});

test('14 加重后仍在目标范围时保持新重量', () => {
  const result = recommend([
    log(50, [8, 8, 8], [2, 2, 2]),
    log(52.5, [7, 6, 6], [2, 2, 2])
  ]);
  assert.equal(result.phase, 'load_adaptation');
  assert.equal(result.suggestedWeight, 52.5);
});

test('15 连续两次明显下降仍不降重', () => {
  const result = recommend([
    log(60, [5, 5, 4], [1, 0, 0]),
    log(60, [5, 4, 4], [0, 0, 0])
  ]);
  assert.equal(result.strategy, '建议维持重量');
  assert.equal(result.phase, 'recovery_watch');
});

test('16 连续三次明显失败进入降重候选', () => {
  const result = recommend([
    log(60, [5, 5, 4], [1, 0, 0]),
    log(60, [5, 4, 4], [0, 0, 0]),
    log(60, [4, 4, 3], [0, 0, 0])
  ]);
  assert.equal(result.strategy, '建议降低重量');
  assert.equal(result.phase, 'confirmed_regression');
});

test('17 小肌群动作使用动作级小步进', () => {
  const smallExercise = {
    ...barbellExercise,
    id: 'db_lateral_raise',
    nameZh: '哑铃侧平举',
    equipment: ['dumbbell'],
    progressionRule: 'reps_first',
    weightIncrementKg: 1
  };
  const result = recommend([
    log(10, [8, 8, 8], [2, 2, 2]),
    log(10, [8, 8, 8], [2, 2, 2])
  ], { exercise: smallExercise });
  assert.equal(getWeightIncrementKg(smallExercise), 1);
  assert.equal(result.suggestedWeight, 11);
});

test('18 杠铃动作使用正常步进', () => {
  assert.equal(getWeightIncrementKg(barbellExercise), 2.5);
  const result = recommend([
    log(50, [8, 8, 8], [2, 2, 2]),
    log(50, [8, 8, 8], [2, 2, 2])
  ]);
  assert.equal(result.suggestedWeight, 52.5);
});

test('19 缺失一次 RIR 仍能生成建议', () => {
  const result = recommend([
    log(50, [6, 6, 6], [2, 2, 2]),
    log(50, [7, 7, 7], [2, null, 2])
  ]);
  assert.equal(result.strategy, '建议维持重量');
  assert.equal(result.phase, 'rir_incomplete');
  assert.equal(result.suggestedWeight, 50);
});

test('20 新旧训练记录混合时保持兼容', () => {
  const oldLog = log(47.5, [6, 6, 6], null, { legacy: true, date: '2026-01-01' });
  const newLog = log(50, [6, 6, 6], [2, 2, 2], { date: '2026-02-01' });
  const history = [
    { id: 'old', date: '2026-01-01', exerciseLogs: [oldLog] },
    { id: 'new', date: '2026-02-01', exerciseLogs: [newLog] }
  ];
  const recent = getRecentCompletedExerciseLogs(barbellExercise.id, history, 3);
  assert.equal(recent.length, 2);
  assert.doesNotThrow(() => recommend(recent));
});

console.log(`趋势推荐算法测试通过：${tests.length}/20`);
tests.forEach((name) => console.log(`- ${name}`));
