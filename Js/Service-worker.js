const CACHE_NAME = 'mangaverse-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/translator.js',
    '/js/tts.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

self.addEventListener('sync', event => {
    if(event.tag === 'update-manga') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    const updates = await fetch('/api/updates');
    const data = await updates.json();
    
    if(data.newChapters && data.newChapters.length > 0) {
        self.registration.showNotification('Manga Update', {
            body: `${data.newChapters.length} chapter baru tersedia!`,
            icon: '/icon.png'
        });
    }
}
