import { renderTodayPage } from './todayPage.js';
import { renderTrainingDetailPage } from './trainingDetailPage.js';
import { renderWorkoutRecordPage } from './workoutRecordPage.js';
import { renderWorkoutHistoryPage } from './workoutHistoryPage.js';
import { renderProfilePage } from './profilePage.js';
import { renderBackupPage } from './backupPage.js';
import { renderAnalyticsPage } from './analyticsPage.js';
import { renderNutritionPage } from './nutritionPage.js';

const root = document.querySelector('#app');

const routes = {
  today: renderTodayPage,
  detail: renderTrainingDetailPage,
  record: renderWorkoutRecordPage,
  history: renderWorkoutHistoryPage,
  profile: renderProfilePage,
  backup: renderBackupPage,
  analytics: renderAnalyticsPage,
  nutrition: renderNutritionPage
};

function render() {
  const route = (window.location.hash.replace('#', '') || 'today').split(':')[0];
  const page = routes[route] || renderTodayPage;
  page(root);
}

window.addEventListener('hashchange', render);
render();
