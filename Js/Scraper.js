// Auto update system - cek chapter baru setiap 6 jam
const CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 jam
let updateTimer = null;

const SOURCES_FOR_SCRAPE = [
    {
        name: 'MangaDex',
        url: 'https://api.mangadex.org/manga',
        type: 'manga',
        parser: (data) => data.data.map(item => ({
            id: item.id,
            title: item.attributes.title.en || Object.values(item.attributes.title)[0],
            latestChapter: item.attributes.lastChapter,
            updatedAt: item.attributes.updatedAt
        }))
    },
    {
        name: 'Webtoon',
        url: 'https://www.webtoons.com/api',
        type: 'manhwa',
        parser: (data) => data.webtoons?.map(w => ({
            id: w.titleId,
            title: w.title,
            latestEpisode: w.latestEpisodeNo,
            updatedAt: w.lastUpdate
        })) || []
    }
];

async function autoUpdateContent() {
    console.log('[AutoUpdate] Checking for new chapters...');
    
    for(const source of SOURCES_FOR_SCRAPE) {
        try {
            const response = await fetch(source.url);
            const data = await response.json();
            const updates = source.parser(data);
            
            // Check and notify new chapters
            for(const update of updates) {
                const saved = localStorage.getItem(`manga_${update.id}`);
                if(saved) {
                    const savedData = JSON.parse(saved);
                    if(savedData.latest !== update.latestChapter && update.latestChapter) {
                        showNotification(update.title, `Chapter ${update.latestChapter} baru!`);
                    }
                }
                localStorage.setItem(`manga_${update.id}`, JSON.stringify(update));
            }
        } catch(e) {
            console.error(`Failed to scrape ${source.name}:`, e);
        }
    }
}

function showNotification(title, message) {
    // Browser notification
    if(Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/icon.png' });
    } else if(Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // In-app notification
    const toast = document.createElement('div');
    toast.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: #4ecdc4;
            color: #1a1a2e;
            padding: 15px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        ">
            <strong>📢 ${title}</strong><br>
            ${message}
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// RSS Feed support untuk update otomatis
function createRSSFeed() {
    const feedUrl = `${window.location.origin}/feed.xml`;
    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
        <channel>
            <title>MangaVerse Updates</title>
            <link>${window.location.origin}</link>
            <description>Latest manga, manhwa, manhua updates</description>
            <language>id</language>
            ${currentData.map(item => `
                <item>
                    <title>${item.title}</title>
                    <link>${window.location.origin}/read/${item.id}</link>
                    <description>${item.latest} released</description>
                    <pubDate>${new Date().toUTCString()}</pubDate>
                </item>
            `).join('')}
        </channel>
    </rss>`;
    
    // Save RSS file
    const blob = new Blob([rssContent], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    console.log('RSS Feed ready:', url);
}

// Start auto update
async function startAutoUpdate() {
    // Initial check
    await autoUpdateContent();
    
    // Periodic check
    if(updateTimer) clearInterval(updateTimer);
    updateTimer = setInterval(autoUpdateContent, CHECK_INTERVAL);
    
    // Create service worker for background updates
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(reg => {
            console.log('Service Worker registered for background updates');
        });
    }
}

// Background sync for offline support
async function setupBackgroundSync() {
    if('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        registration.sync.register('update-manga');
    }
}

startAutoUpdate();
