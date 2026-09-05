import { exercises } from '../../data/exercises/exercises.js';
import { readWorkoutHistory } from '../../data/workouts/workoutSession.js';
import {
  buildExerciseAnalysis,
  buildPrRecords,
  buildTrainingOverview,
  getAnalyzableExercises,
  getRecentSessionVolumeTrend,
  getRecentTrainingFrequency
} from '../../data/workouts/workoutAnalytics.js';

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number).toLocaleString('zh-CN') : '-';
}

function renderStatGrid(items) {
  const grid = document.createElement('div');
  grid.className = 'stat-grid';
  items.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'stat-item';
    item.innerHTML = `<span class="stat-label">${label}</span><span class="stat-value">${value}</span>`;
    grid.appendChild(item);
  });
  return grid;
}

function renderBars(items, { labelKey, valueKey, unit = '' }) {
  const list = document.createElement('div');
  list.className = 'bar-list';
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const label = document.createElement('span');
    label.textContent = item[labelKey] || '-';
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${Math.max(4, ((Number(item[valueKey]) || 0) / max) * 100)}%`;
    track.appendChild(fill);
    const value = document.createElement('span');
    value.textContent = `${formatNumber(item[valueKey])}${unit}`;
    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(value);
    list.appendChild(row);
  });

  return list;
}

function renderOverview(page, history) {
  const overview = buildTrainingOverview(history);
  const card = document.createElement('section');
  card.className = 'exercise';
  const title = document.createElement('h2');
  title.textContent = '训练概览';
  card.appendChild(title);
  card.appendChild(renderStatGrid([
    ['本周训练', `${overview.weeklyTrainingCount} 次`],
    ['本月训练', `${overview.monthlyTrainingCount} 次`],
    ['总训练次数', `${overview.totalTrainingCount} 次`],
    ['完成组数', `${overview.totalCompletedSets} 组`],
    ['总训练容量', `${formatNumber(overview.totalVolume)} kg·次`],
    ['最近训练', overview.lastTrainingDate || '-']
  ]));
  page.appendChild(card);
}

function renderTrendCharts(page, history) {
  const volumeTrend = getRecentSessionVolumeTrend(history, 7);
  const frequency = getRecentTrainingFrequency(history, 28);
  const weekly = [];

  for (let index = 0; index < 4; index += 1) {
    const slice = frequency.slice(index * 7, index * 7 + 7);
    weekly.push({
      label: `第 ${index + 1} 周`,
      count: slice.reduce((sum, item) => sum + item.count, 0)
    });
  }

  const volumeCard = document.createElement('section');
  volumeCard.className = 'exercise';
  volumeCard.innerHTML = '<h2>最近 7 次训练总容量</h2>';
  volumeCard.appendChild(renderBars(volumeTrend.map((item) => ({
    label: item.date,
    volume: item.volume
  })), { labelKey: 'label', valueKey: 'volume', unit: ' kg·次' }));
  page.appendChild(volumeCard);

  const frequencyCard = document.createElement('section');
  frequencyCard.className = 'exercise';
  frequencyCard.innerHTML = '<h2>最近 4 周训练次数</h2>';
  frequencyCard.appendChild(renderBars(weekly, { labelKey: 'label', valueKey: 'count', unit: ' 次' }));
  page.appendChild(frequencyCard);
}

function renderExerciseAnalysis(page, history, selectedExerciseId) {
  const options = getAnalyzableExercises(history, exercises);
  const card = document.createElement('section');
  card.className = 'exercise';
  const title = document.createElement('h2');
  title.textContent = '动作进步分析';
  card.appendChild(title);

  const label = document.createElement('label');
  label.className = 'field-label';
  label.append('选择动作');
  const select = document.createElement('select');
  options.forEach((option) => {
    const item = document.createElement('option');
    item.value = option.exerciseId;
    item.textContent = option.nameZh;
    select.appendChild(item);
  });
  select.value = selectedExerciseId || (options[0] && options[0].exerciseId) || '';
  select.addEventListener('change', () => {
    window.location.hash = `analytics:${select.value}`;
  });
  label.appendChild(select);
  card.appendChild(label);

  const exerciseId = select.value;
  if (!exerciseId) {
    page.appendChild(card);
    return;
  }

  const analysis = buildExerciseAnalysis(history, exerciseId, exercises);
  card.appendChild(renderStatGrid([
    ['最近重量', analysis.latestWeight ? `${analysis.latestWeight}kg` : '-'],
    ['最近次数', analysis.latestReps ? `${analysis.latestReps} 次` : '-'],
    ['历史最高重量', analysis.highestWeight ? `${analysis.highestWeight}kg` : '-'],
    ['历史最高容量', `${formatNumber(analysis.highestVolume)} kg·次`],
    ['进步状态', analysis.progress ? analysis.progress.status : '暂无数据'],
    ['动作', analysis.nameZh]
  ]));

  const progress = document.createElement('p');
  progress.textContent = analysis.progress ? analysis.progress.message : '暂无可比较记录。';
  card.appendChild(progress);

  const listTitle = document.createElement('h3');
  listTitle.textContent = '最近 5 次记录';
  card.appendChild(listTitle);
  card.appendChild(renderBars(analysis.recentRecords.slice().reverse().map((record) => ({
    label: record.date,
    volume: record.totalVolume
  })), { labelKey: 'label', valueKey: 'volume', unit: ' kg·次' }));

  page.appendChild(card);
}

function renderPrRecords(page, history) {
  const records = buildPrRecords(history, exercises);
  const card = document.createElement('section');
  card.className = 'exercise';
  const title = document.createElement('h2');
  title.textContent = 'PR 记录';
  card.appendChild(title);

  records.slice(0, 12).forEach((record) => {
    const item = document.createElement('div');
    item.className = 'meta-card';
    item.innerHTML = [
      `<strong>${record.nameZh}</strong>`,
      `<p>最高重量：${record.highestWeight ? `${record.highestWeight}kg` : '-'}，创造日期：${record.highestWeightDate || '-'}</p>`,
      `<p>最高次数：${record.highestReps ? `${record.highestReps} 次` : '-'}，创造日期：${record.highestRepsDate || '-'}</p>`,
      `<p>最高单次容量：${formatNumber(record.bestSetVolume)} kg·次，创造日期：${record.bestSetVolumeDate || '-'}</p>`,
      `<p>最佳训练容量：${formatNumber(record.bestTotalVolume)} kg·次，创造日期：${record.bestTotalVolumeDate || '-'}</p>`
    ].join('');
    card.appendChild(item);
  });

  page.appendChild(card);
}

export function renderAnalyticsPage(root) {
  const history = readWorkoutHistory();
  const selectedExerciseId = window.location.hash.includes(':')
    ? window.location.hash.split(':')[1]
    : '';

  root.innerHTML = '';

  const page = document.createElement('section');
  page.className = 'page';
  const hero = document.createElement('section');
  hero.className = 'hero-card';
  hero.innerHTML = '<p class="eyebrow">本地历史</p><h1>数据分析</h1><p>基于本机训练历史计算，不上传数据。</p>';
  page.appendChild(hero);

  if (!Array.isArray(history) || history.length === 0) {
    const empty = document.createElement('section');
    empty.className = 'exercise';
    empty.textContent = '暂无训练数据，完成一次训练后再查看分析。';
    page.appendChild(empty);
    root.appendChild(page);
    return;
  }

  renderOverview(page, history);
  renderTrendCharts(page, history);
  renderExerciseAnalysis(page, history, selectedExerciseId);
  renderPrRecords(page, history);

  root.appendChild(page);
}
