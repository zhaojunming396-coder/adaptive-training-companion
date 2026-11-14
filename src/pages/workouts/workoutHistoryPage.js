import { exercises } from '../../data/exercises/exercises.js';
import { bodyRecomposition4DayPlan } from '../../data/trainingPlans/bodyRecomposition4DayPlan.js';
import { buildWorkoutSummary, readWorkoutHistory } from '../../data/workouts/workoutSession.js';
import {
  getRecentCompletedExerciseLogs,
  readUserTrainingProfile,
  recommendWeightForTarget
} from '../../data/workouts/weightRecommendation.js';
import { navigateTo } from './appState.js';
import { migrateStoredDraftToHistory } from './workoutDraft.js';
import { recommendationLabel, recommendationReason } from './recommendationCopy.js';

const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
const planDayById = new Map(bodyRecomposition4DayPlan.planDays.map((day) => [day.planDayId, day]));

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sessionName(session) {
  return planDayById.get(session.planDayId)?.nameZh || '训练记录';
}

function sessionMeta(session) {
  return [
    session.date || '日期未记录',
    session.completed ? '已完成' : '未完成',
    `${session.durationMinutes || 0} 分钟`
  ].join(' · ');
}

function timestamp(value) {
  return typeof value === 'string' && value ? Date.parse(value) : NaN;
}

function sessionTime(session) {
  return [session.endedAt, session.startedAt, session.date].map(timestamp).find(Number.isFinite) ?? 0;
}

function earlierHistory(history, session) {
  const start = timestamp(session.startedAt);
  return history.filter((candidate) => {
    if (candidate.completed === false || candidate.id === session.id) return false;
    const end = timestamp(candidate.endedAt || candidate.startedAt);
    if (Number.isFinite(start) && Number.isFinite(end)) return end < start;
    // Date-only legacy records cannot establish an order within the same day.
    return Boolean(candidate.date && session.date && candidate.date < session.date);
  });
}

function present(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function recordedValues(set) {
  if (set.completed !== true) return [];
  const values = [];
  if (present(set.weight)) values.push(`${set.weight} ${set.weightUnit || 'kg'}`);
  if (present(set.reps)) values.push(`${set.reps} 次`);
  if (present(set.durationSeconds)) values.push(`${set.durationSeconds} 秒`);
  if (present(set.rir)) values.push(`RIR ${set.rir}`);
  return values;
}

function recommendationTone(strategy) {
  if (strategy === '建议加重量' || strategy === '建议增加时长') return 'progress';
  if (strategy === '建议降低重量') return 'reduce';
  if (strategy === '暂无建议') return 'baseline';
  return 'maintain';
}

function appendNote(parent, note) {
  if (typeof note !== 'string' || !note.trim()) return;
  parent.appendChild(element('p', 'history-note', `备注：${note.trim()}`));
}

function renderExercise(log, planDay, history, profile) {
  const exercise = exerciseById.get(log.exerciseId);
  const name = exercise?.nameZh || (log.exerciseId === 'barbell_bench_press' ? '杠铃卧推' : '未知动作');
  const sets = Array.isArray(log.sets) ? log.sets.filter(Boolean) : [];
  const completed = sets.filter((set) => set.completed === true);
  const card = element('section', 'exercise history-exercise');
  const heading = element('div', 'feedback-row-head');
  heading.appendChild(element('h2', '', name));
  card.appendChild(heading);

  const list = element('ul', 'history-sets');
  sets.forEach((set, index) => {
    const row = element('li', 'history-set');
    row.appendChild(element('strong', '', `第 ${present(set.setIndex) ? set.setIndex : index + 1} 组`));
    const values = recordedValues(set);
    for (const value of values.length ? values : ['未记录']) row.appendChild(element('span', '', value));
    list.appendChild(row);
  });
  if (sets.length) card.appendChild(list);
  else card.appendChild(element('p', '', '未记录'));

  if (completed.length) {
    const planExercise = planDay?.exercises.find((item) => item.exerciseId === log.exerciseId)
      || { exerciseId: log.exerciseId, target: {} };
    const recentExerciseLogs = getRecentCompletedExerciseLogs(log.exerciseId, history, 3);
    const recommendation = recommendWeightForTarget({
      exercise,
      planExercise,
      recentExerciseLogs,
      userProfile: profile
    });
    const label = recommendationLabel(recommendation);
    if (label) heading.appendChild(element('span', '', label));

    const tone = recommendationTone(recommendation.strategy);
    const advice = element('div', `feedback-row feedback-row-${tone} history-advice`);
    const values = recommendation.type === 'time'
      ? [recommendation.suggestedDurationText]
      : [recommendation.suggestedWeightText, recommendation.suggestedRepsText];
    const suggestion = values.filter((value) => value && value !== '暂无建议').join(' · ');
    advice.append(
      element('span', '', `本次建议：${suggestion || '按计划目标继续'}`),
      element('p', '', `原因：${recommendationReason(recommendation)}`)
    );
    card.appendChild(advice);
  }

  appendNote(card, log.notes);
  return card;
}

function renderSession(page, session, history) {
  const back = element('a', 'history-back', '← 返回历史');
  back.href = '#history';
  const header = element('header', 'record-header page-heading');
  header.append(element('h1', '', sessionName(session)), element('p', '', sessionMeta(session)));
  if (!session.completed) header.appendChild(element('p', '', '这次训练没有记完整。'));
  page.append(back, header);

  const logs = Array.isArray(session.exerciseLogs) ? session.exerciseLogs : [];
  // Older logs can contain weighted movements that are no longer in the library.
  const legacyWeighted = logs.filter((log) => !exerciseById.has(log.exerciseId)
    && log.sets?.some((set) => set?.completed === true && present(set.weight) && present(set.reps)))
    .map((log) => ({ id: log.exerciseId, trackingType: 'weight_reps' }));
  const summary = buildWorkoutSummary(session, [...exercises, ...legacyWeighted]);
  const stats = element('div', 'target-grid history-stats');
  const items = [
    ['完成组数', `${summary.completedSetCount} / ${summary.totalSetCount} 组`],
    ['总容量', `${summary.totalVolume} kg·次`]
  ];
  if (summary.completedTimeSeconds > 0) items.push(['计时总时长', `${summary.completedTimeSeconds} 秒`]);
  for (const [label, value] of items) {
    const pill = element('div', 'target-pill');
    pill.append(element('span', 'stat-label', label), element('strong', 'stat-value', value));
    stats.appendChild(pill);
  }
  page.appendChild(stats);

  if (session.completed === false) {
    const resume = element('button', 'primary-action', '继续训练');
    resume.addEventListener('click', () => navigateTo(`record:${encodeURIComponent(session.id)}`));
    page.appendChild(resume);
  }

  if (summary.completedSetCount > 0) {
    page.appendChild(element('p', 'history-disclaimer', '建议按当前规则和档案，使用该场开始前的记录重算。'));
  }
  const past = earlierHistory(history, session);
  const profile = readUserTrainingProfile();
  const planDay = planDayById.get(session.planDayId);
  for (const log of logs) page.appendChild(renderExercise(log, planDay, past, profile));
  appendNote(page, session.notes);
}

export function renderWorkoutHistoryPage(root) {
  migrateStoredDraftToHistory();
  const history = readWorkoutHistory().slice().sort((a, b) => sessionTime(b) - sessionTime(a));
  const prefix = '#history:';
  const hash = window.location.hash;
  const isReview = hash.startsWith(prefix);
  let session;
  if (isReview) {
    try {
      const id = decodeURIComponent(hash.slice(prefix.length));
      session = history.find((item) => String(item.id) === id);
    } catch {
      // Invalid URL encoding is treated as a missing record.
    }
  }

  const page = element('section', 'page');
  root.replaceChildren(page);
  if (session) {
    renderSession(page, session, history);
    return;
  }

  const header = element('header', 'record-header page-heading');
  header.appendChild(element('h1', '', '训练记录'));
  page.appendChild(header);
  if (isReview) {
    const notice = element('p', 'notice', '没有找到这条训练记录。');
    notice.setAttribute('role', 'status');
    page.appendChild(notice);
  }

  if (!history.length) {
    const empty = element('section', 'page-empty');
    const today = element('a', 'support-link', '返回今日');
    today.href = '#today';
    empty.append(element('p', '', '还没有训练记录，保存一次训练后就会显示在这里。'), today);
    page.appendChild(empty);
    return;
  }

  for (const item of history) {
    const link = element('a', 'history-item history-link');
    link.href = `#history:${encodeURIComponent(item.id)}`;
    const copy = element('div', 'history-link-copy');
    copy.append(element('strong', '', sessionName(item)), element('span', '', sessionMeta(item)));
    link.appendChild(copy);
    page.appendChild(link);
  }
}
