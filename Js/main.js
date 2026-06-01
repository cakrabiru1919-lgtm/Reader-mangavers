// API Sources (multiple source untuk redundancy)
const SOURCES = {
    manga: [
        'https://api.mangadex.org',
        'https://api.manganato.com'
    ],
    manhwa: [
        'https://api.webtoon.xyz',
        'https://api.mangaupdates.com'
    ],
    manhua: [
        'https://api.manhuaus.com',
        'https://api.suseshiki.com'
    ]
};

let currentData = [];
let currentType = 'all';
let currentSearch = '';

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    
    document.getElementById('searchBtn').addEventListener('click', () => {
        currentSearch = document.getElementById('searchInput').value;
        loadContent();
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentType = e.target.dataset.type;
            loadContent();
        });
    });
    
    document.getElementById('translateLang').addEventListener('change', (e) => {
        translatePageContent(e.target.value);
    });
    
    document.getElementById('autoTTS').addEventListener('change', (e) => {
        if(e.target.checked) {
            startAutoTTS();
        } else {
            stopAutoTTS();
        }
    });
});

async function loadContent() {
    const grid = document.getElementById('mangaGrid');
    grid.innerHTML = '<div class="loading">🔄 Memuat konten...</div>';
    
    try {
        let data = [];
        
        // Fetch dari multiple source
        for(const type of ['manga', 'manhwa', 'manhua']) {
            if(currentType === 'all' || currentType === type) {
                const typeData = await fetchContent(type, currentSearch);
                data.push(...typeData);
            }
        }
        
        currentData = data;
        displayContent(data);
    } catch(error) {
        console.error('Error loading:', error);
        grid.innerHTML = '<div class="error">❌ Gagal memuat. Coba lagi nanti.</div>';
    }
}

async function fetchContent(type, search = '') {
    // Simulasi fetch - di production ganti dengan API real
    const mockData = {
        manga: [
            { id: 1, title: 'One Piece', type: 'manga', cover: 'https://via.placeholder.com/200x240/FF6B6B/white?text=One+Piece', latest: 'Chapter 1090', url: '/read/1' },
            { id: 2, title: 'Naruto', type: 'manga', cover: 'https://via.placeholder.com/200x240/FFA500/white?text=Naruto', latest: 'Completed', url: '/read/2' }
        ],
        manhwa: [
            { id: 3, title: 'Solo Leveling', type: 'manhwa', cover: 'https://via.placeholder.com/200x240/4ECDC4/white?text=Solo+Leveling', latest: 'Chapter 179', url: '/read/3' },
            { id: 4, title: 'Tower of God', type: 'manhwa', cover: 'https://via.placeholder.com/200x240/9B59B6/white?text=Tower+of+God', latest: 'Chapter 600', url: '/read/4' }
        ],
        manhua: [
            { id: 5, title: 'Martial Peak', type: 'manhua', cover: 'https://via.placeholder.com/200x240/2ECC71/white?text=Martial+Peak', latest: 'Chapter 3500', url: '/read/5' }
        ]
    };
    
    let results = mockData[type] || [];
    
    if(search) {
        results = results.filter(item => 
            item.title.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    return results;
}

function displayContent(data) {
    const grid = document.getElementById('mangaGrid');
    
    if(data.length === 0) {
        grid.innerHTML = '<div class="error">📭 Tidak ada konten ditemukan</div>';
        return;
    }
    
    grid.innerHTML = data.map(item => `
        <div class="manga-card" onclick="openReader('${item.url}', '${item.title}')">
            <img src="${item.cover}" alt="${item.title}" loading="lazy">
            <div class="info">
                <h3>${item.title}</h3>
                <div class="type">${getTypeIcon(item.type)} ${item.type.toUpperCase()}</div>
                <div class="latest">📖 ${item.latest}</div>
            </div>
        </div>
    `).join('');
}

function getTypeIcon(type) {
    const icons = {
        manga: '📖',
        manhwa: '📱',
        manhua: '🎨'
    };
    return icons[type] || '📚';
}

function openReader(url, title) {
    localStorage.setItem('currentManga', title);
    window.location.href = `reader.html?manga=${encodeURIComponent(title)}`;
              }
