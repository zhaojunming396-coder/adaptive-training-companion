import { renderMePage } from './mePage.js';
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
  me: renderMePage,
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
  const page = Object.hasOwn(routes, route) ? routes[route] : renderTodayPage;
  const isChildOfMe = ['profile', 'nutrition', 'backup', 'analytics'].includes(route);
  const activeTab = isChildOfMe ? 'me' : route === 'detail' || !Object.hasOwn(routes, route) ? 'today' : route;
  for (const link of document.querySelectorAll('nav a')) {
    if (link.hash === `#${activeTab}`) {
      link.setAttribute('aria-current', link.hash === window.location.hash || !window.location.hash ? 'page' : 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }

  root.dataset.parent = isChildOfMe ? 'me' : '';
  page(root);
}

window.addEventListener('hashchange', render);
render();
