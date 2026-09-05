import { bodyRecomposition4DayPlan } from '../../data/trainingPlans/bodyRecomposition4DayPlan.js';
import { readWorkoutHistory } from '../../data/workouts/workoutSession.js';
import { getPlanDayName, navigateTo } from './appState.js';

export function renderWorkoutHistoryPage(root) {
  const history = readWorkoutHistory();

  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';

  const title = document.createElement('h1');
  title.textContent = '训练记录';
  page.appendChild(title);

  if (history.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = '暂无训练记录。';
    page.appendChild(empty);
  }

  history.forEach((session) => {
    const item = document.createElement('article');
    item.className = 'history-item';

    const name = document.createElement('h3');
    name.className = 'exercise-title';
    name.textContent = getPlanDayName(bodyRecomposition4DayPlan, session.planDayId);
    item.appendChild(name);

    const stats = document.createElement('div');
    stats.className = 'target-grid';
    [
      ['日期', session.date],
      ['训练时长', `${session.durationMinutes || 0} 分钟`],
      ['完成状态', session.completed ? '已完成' : '未完成'],
      ['动作数量', `${Array.isArray(session.exerciseLogs) ? session.exerciseLogs.length : 0} 个`]
    ].forEach(([label, value]) => {
      const stat = document.createElement('div');
      stat.className = 'target-pill';
      stat.innerHTML = `<span class="stat-label">${label}</span><span class="stat-value">${value}</span>`;
      stats.appendChild(stat);
    });
    item.appendChild(stats);

    page.appendChild(item);
  });

  const actions = document.createElement('div');
  actions.className = 'actions';

  const todayButton = document.createElement('button');
  todayButton.textContent = '返回今日训练';
  todayButton.addEventListener('click', () => navigateTo('today'));
  actions.appendChild(todayButton);

  page.appendChild(actions);
  root.appendChild(page);
}
