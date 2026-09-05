const CACHE_NAME = 'adaptive-training-companion-v052';

const CORE_ASSETS = [
  './',
  './index.html',
  './main.js',
  './todayPage.js',
  './trainingDetailPage.js',
  './workoutRecordPage.js',
  './workoutHistoryPage.js',
  './profilePage.js',
  './backupPage.js',
  './analyticsPage.js',
  './nutritionPage.js',
  './appState.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  '../../data/exercises/exercises.js',
  '../../data/trainingPlans/bodyRecomposition4DayPlan.js',
  '../../data/trainingPlans/trainingPlanValidators.js',
  '../../data/workouts/dailyNutrition.js',
  '../../data/workouts/localBackup.js',
  '../../data/workouts/weightRecommendation.js',
  '../../data/workouts/workoutAnalytics.js',
  '../../data/workouts/workoutSession.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => cachedResponse || fetch(event.request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return networkResponse;
        })
        .catch(() => caches.match('./index.html')))
  );
});
