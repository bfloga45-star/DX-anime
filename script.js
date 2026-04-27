const API_BASE_URL = 'https://api.jikan.moe/v4';

// DOM Elements
const navbar = document.getElementById('navbar');
const searchInput = document.getElementById('searchInput');
const voiceSearchBtn = document.getElementById('voice-search-btn');
const searchSection = document.getElementById('search-section');
const mainContent = document.getElementById('main-content');
const searchResults = document.getElementById('search-results');
const modal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-video-modal');
const videoContainer = document.getElementById('video-container');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const genreFilter = document.getElementById('genre-filter');

// Details Modal Elements
const detailsModal = document.getElementById('anime-details-modal');
const closeDetailsBtn = document.getElementById('close-details-modal');
const detailsHeroBg = document.getElementById('details-hero-bg');
const detailsTitle = document.getElementById('details-title');
const detailsYear = document.getElementById('details-year');
const detailsScore = document.getElementById('details-score');
const detailsSynopsis = document.getElementById('details-synopsis');
const detailsPlayBtn = document.getElementById('details-play-btn');
const detailsDownloadBtn = document.getElementById('details-download-btn');
const detailsMyListBtn = document.getElementById('details-mylist-btn');
const episodesList = document.getElementById('episodes-list');

// Admin DOM Elements
const adminLoginSection = document.getElementById('admin-login-section');
const adminLoginForm = document.getElementById('admin-login-form');
const adminSection = document.getElementById('admin-section');
const adminForm = document.getElementById('admin-form');
const adminLogoutBtn = document.getElementById('admin-logout');

// Admin Manage Elements
const adminItemsList = document.getElementById('admin-items-list');
const adminFilterCategory = document.getElementById('admin-filter-category');
const adminCancelEditBtn = document.getElementById('admin-cancel-edit-btn');
const adminSubmitBtn = document.getElementById('admin-submit-btn');
const adminFormTitle = document.getElementById('admin-form-title');

// Hero Elements
const hero = document.getElementById('hero');
const heroTitle = document.querySelector('.hero-title');
const heroDesc = document.getElementById('hero-desc');
const heroPlayBtn = document.getElementById('hero-play');
const heroMyListBtn = document.getElementById('hero-mylist');

// State
let contentLibrary = [];
let myListIds = JSON.parse(localStorage.getItem('dx_anime_mylist')) || [];

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`API returned status: ${response.status}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Initialization
async function init() {
    // Theme setup
    const savedTheme = localStorage.getItem('dx_anime_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.className = 'fa-solid fa-sun';
    }

    const stored = localStorage.getItem('dx_anime_content');
    if (stored) {
        contentLibrary = JSON.parse(stored);
    } else {
        await seedContentLibrary();
    }
    
    renderMainPage();
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        themeIcon.className = 'fa-solid fa-sun';
        localStorage.setItem('dx_anime_theme', 'light');
    } else {
        themeIcon.className = 'fa-solid fa-moon';
        localStorage.setItem('dx_anime_theme', 'dark');
    }
});

// Voice Search
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    voiceSearchBtn.addEventListener('click', () => {
        voiceSearchBtn.style.color = 'var(--accent-color)';
        recognition.start();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        voiceSearchBtn.style.color = '';
        
        const lowerTrans = transcript.toLowerCase();
        if (lowerTrans.startsWith('play ')) {
            const query = lowerTrans.replace('play ', '').trim();
            searchInput.value = query;
            performSearch(query).then(() => {
                setTimeout(() => {
                    const firstResult = searchResults.querySelector('.anime-card');
                    if (firstResult) {
                        firstResult.click();
                        setTimeout(() => {
                            const playBtn = document.getElementById('details-play-btn');
                            if(playBtn) playBtn.click();
                        }, 500);
                    }
                }, 1000);
            });
        } else {
            performSearch(transcript);
        }
    };
    
    recognition.onerror = () => voiceSearchBtn.style.color = '';
    recognition.onend = () => voiceSearchBtn.style.color = '';
} else {
    voiceSearchBtn.style.display = 'none';
}

async function seedContentLibrary() {
    contentLibrary = [];
    
    // Import old admin_uploads if they exist
    const oldUploads = JSON.parse(localStorage.getItem('admin_uploads')) || [];
    oldUploads.forEach(u => {
        contentLibrary.push({
            id: 'custom_' + Date.now() + Math.random().toString(36).substr(2, 5),
            mal_id: null,
            title: u.title_english || u.title || 'Unknown',
            imgUrl: u.images?.webp?.large_image_url || '',
            mediaType: 'direct',
            mediaValue: u.customVideoUrl || '',
            category: u.category || 'custom-anime',
            year: u.year || '',
            score: u.score || 'User',
            synopsis: u.synopsis || '',
            order: contentLibrary.length
        });
    });

    // We fetch a few items from Jikan to pre-populate sections if empty
    const trending = await fetchAPI('/top/anime?filter=trending&limit=15');
    if(trending) trending.forEach(a => contentLibrary.push(mapJikanToContent(a, 'trending', contentLibrary.length)));
    
    await sleep(500);
    const popular = await fetchAPI('/top/anime?filter=bypopularity&limit=15');
    if(popular) popular.forEach(a => contentLibrary.push(mapJikanToContent(a, 'popular', contentLibrary.length)));

    await sleep(500);
    const upcoming = await fetchAPI('/seasons/upcoming?limit=15');
    if(upcoming) upcoming.forEach(a => contentLibrary.push(mapJikanToContent(a, 'upcoming', contentLibrary.length)));

    saveContentLibrary();
}

function mapJikanToContent(anime, category, order) {
    return {
        id: 'jikan_' + anime.mal_id + '_' + Math.random().toString(36).substr(2, 9),
        mal_id: anime.mal_id,
        title: anime.title_english || anime.title,
        imgUrl: anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url || '',
        mediaType: 'youtube',
        mediaValue: anime.trailer?.youtube_id || '',
        category: category,
        year: anime.year || (anime.aired?.prop?.from?.year) || '',
        score: anime.score || 'N/A',
        synopsis: anime.synopsis ? anime.synopsis.split('[')[0] : 'No description available.',
        genres: anime.genres ? anime.genres.map(g => g.name) : [],
        order: order
    };
}

function saveContentLibrary() {
    contentLibrary.sort((a, b) => a.order - b.order);
    localStorage.setItem('dx_anime_content', JSON.stringify(contentLibrary));
}

function renderMainPage() {
    // Hide all sections initially
    const allSections = ['custom-anime-section', 'movies-section', 'indian-toon-section', 'old-cartoon-section', 'trending', 'popular', 'upcoming'];
    allSections.forEach(id => {
        const sec = document.getElementById(id);
        if(sec) sec.classList.add('hidden');
    });

    const categoriesMap = {
        'trending': { containerId: 'trending-slider', sectionId: 'trending' },
        'popular': { containerId: 'popular-slider', sectionId: 'popular' },
        'upcoming': { containerId: 'upcoming-slider', sectionId: 'upcoming' },
        'custom-anime': { containerId: 'custom-anime-slider', sectionId: 'custom-anime-section' },
        'movie': { containerId: 'movies-slider', sectionId: 'movies-section' },
        'indian-toon': { containerId: 'indian-toon-slider', sectionId: 'indian-toon-section' },
        'old-cartoon': { containerId: 'old-cartoon-slider', sectionId: 'old-cartoon-section' }
    };

    let heroUpdated = false;

    for (const [cat, info] of Object.entries(categoriesMap)) {
        const items = contentLibrary.filter(item => item.category === cat).sort((a, b) => a.order - b.order);
        const container = document.getElementById(info.containerId);
        if (container) container.innerHTML = '';

        if (items.length > 0) {
            document.getElementById(info.sectionId).classList.remove('hidden');
            items.forEach(item => {
                container.appendChild(createAnimeCard(item));
            });
            
            // Set Hero to the first Trending or Custom Anime
            if (!heroUpdated && (cat === 'trending' || cat === 'custom-anime')) {
                updateHero(items[0]);
                heroUpdated = true;
            }
        }
    }
    
    renderMyList();
}

function updateHero(item) {
    if (item.imgUrl) {
        hero.style.backgroundImage = `url('${item.imgUrl}')`;
    }
    heroTitle.textContent = item.title;
    heroDesc.textContent = item.synopsis;

    heroPlayBtn.onclick = () => {
        playMedia(item);
    };
    
    const inList = myListIds.includes(item.id);
    heroMyListBtn.innerHTML = inList ? '<i class="fa-solid fa-check"></i> Added' : '<i class="fa-solid fa-plus"></i> My List';
    heroMyListBtn.onclick = () => toggleMyList(item, heroMyListBtn);
}

function createAnimeCard(item) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    
    card.innerHTML = `
        <img src="${item.imgUrl}" alt="${item.title}" loading="lazy">
        <div class="anime-info">
            <h4 class="anime-info-title" title="${item.title}">${item.title}</h4>
            <div class="anime-info-meta">
                <span class="score">${item.score !== 'N/A' ? '★ ' + item.score : 'N/A'}</span>
                <span>${item.year}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        openAnimeDetails(item);
    });

    return card;
}

// Modal Functions
async function openAnimeDetails(item) {
    // Ensure video player is closed if a recommendation is clicked from within the player
    closeModal();
    
    detailsHeroBg.style.backgroundImage = `url('${item.imgUrl}')`;
    detailsTitle.textContent = item.title;
    detailsYear.textContent = item.year || 'N/A';
    detailsScore.textContent = item.score !== 'N/A' ? `★ ${item.score}` : 'N/A';
    detailsSynopsis.textContent = item.synopsis;

    detailsPlayBtn.onclick = () => playMedia(item);
    
    const inList = myListIds.includes(item.id);
    detailsMyListBtn.innerHTML = inList ? '<i class="fa-solid fa-check"></i> Added' : '<i class="fa-solid fa-plus"></i> My List';
    detailsMyListBtn.onclick = () => toggleMyList(item, detailsMyListBtn);
    
    // Download logic (only show for direct video files)
    if (item.mediaType === 'direct' && item.mediaValue) {
        detailsDownloadBtn.style.display = 'inline-flex';
        detailsDownloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = item.mediaValue;
            a.download = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp4';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    } else {
        detailsDownloadBtn.style.display = 'none';
    }

    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    episodesList.innerHTML = '<div class="loader"></div>';
    
    if (item.mal_id) {
        const episodes = await fetchAPI(`/anime/${item.mal_id}/episodes`);
        episodesList.innerHTML = '';
        if (episodes && episodes.length > 0) {
            episodes.forEach(ep => {
                const epTitle = ep.title || `Episode ${ep.mal_id}`;
                const epItem = document.createElement('div');
                epItem.className = 'episode-item';
                epItem.innerHTML = `
                    <div class="episode-info">
                        <span class="episode-title">${epTitle}</span>
                        <span class="episode-number">Episode ${ep.mal_id}</span>
                    </div>
                    <i class="fa-solid fa-play episode-play-icon"></i>
                `;
                epItem.onclick = () => playMedia(item);
                episodesList.appendChild(epItem);
            });
        } else {
            episodesList.innerHTML = createDefaultEpisodeHTML(item);
            document.getElementById('default-ep-btn').onclick = () => playMedia(item);
        }
    } else {
        episodesList.innerHTML = createDefaultEpisodeHTML(item);
        document.getElementById('default-ep-btn').onclick = () => playMedia(item);
    }
}

function createDefaultEpisodeHTML(item) {
    const title = item.mediaType === 'direct' ? 'Full Feature' : 'Official Trailer / Movie';
    return `
        <div class="episode-item" id="default-ep-btn">
            <div class="episode-info">
                <span class="episode-title">${title}</span>
                <span class="episode-number">1</span>
            </div>
            <i class="fa-solid fa-play episode-play-icon"></i>
        </div>
    `;
}

function toggleMyList(item, btnElement) {
    const index = myListIds.indexOf(item.id);
    if (index > -1) {
        myListIds.splice(index, 1);
        if(btnElement) btnElement.innerHTML = '<i class="fa-solid fa-plus"></i> My List';
    } else {
        myListIds.push(item.id);
        if(btnElement) btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Added';
    }
    localStorage.setItem('dx_anime_mylist', JSON.stringify(myListIds));
    renderMyList();
}

function renderMyList() {
    const section = document.getElementById('mylist-section');
    const container = document.getElementById('mylist-slider');
    const recSection = document.getElementById('recommended-section');
    const recContainer = document.getElementById('recommended-slider');
    
    if (!section || !container) return;
    container.innerHTML = '';
    if(recContainer) recContainer.innerHTML = '';
    
    const listItems = contentLibrary.filter(item => myListIds.includes(item.id));
    
    if (listItems.length > 0) {
        section.classList.remove('hidden');
        listItems.forEach(item => {
            container.appendChild(createAnimeCard(item));
        });
        
        // Build Recommendations based on genres
        if(recSection && recContainer) {
            const favoriteGenres = new Set();
            listItems.forEach(i => i.genres?.forEach(g => favoriteGenres.add(g)));
            
            const recItems = contentLibrary.filter(item => 
                !myListIds.includes(item.id) && 
                item.genres?.some(g => favoriteGenres.has(g))
            ).slice(0, 15); // max 15 recommendations
            
            if(recItems.length > 0) {
                recSection.classList.remove('hidden');
                recItems.forEach(item => {
                    recContainer.appendChild(createAnimeCard(item));
                });
            } else {
                recSection.classList.add('hidden');
            }
        }
    } else {
        section.classList.add('hidden');
        if(recSection) recSection.classList.add('hidden');
    }
}

function playMedia(item, initialEpIndex = 0, initialSeasonIndex = 0) {
    // Populate Player UI
    const playerTitle = document.getElementById('player-title');
    const seasonContainer = document.getElementById('player-season-container');
    const seasonSelector = document.getElementById('player-season-selector');
    const episodesGrid = document.getElementById('player-episodes-grid');
    
    // Clear previous
    episodesGrid.innerHTML = '';
    seasonSelector.innerHTML = '';
    
    if (item.mediaType === 'series' && item.seasons && item.seasons.length > 0) {
        // Multi-episode series
        seasonContainer.style.display = 'block';
        
        // Populate Seasons
        item.seasons.forEach((season, sIdx) => {
            const option = document.createElement('option');
            option.value = sIdx;
            option.textContent = season.name;
            if (sIdx === initialSeasonIndex) option.selected = true;
            seasonSelector.appendChild(option);
        });
        
        // Function to render episodes
        const renderPlayerEpisodes = (sIdx) => {
            episodesGrid.innerHTML = '';
            const season = item.seasons[sIdx];
            season.episodes.forEach((ep, eIdx) => {
                const card = document.createElement('div');
                card.className = 'player-episode-card';
                card.innerHTML = `
                    <div class="player-ep-title">${ep.title}</div>
                    <div class="player-ep-desc">Episode ${ep.epNum}</div>
                `;
                card.onclick = () => {
                    // Update active state
                    document.querySelectorAll('.player-episode-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    playerTitle.textContent = `${item.title} - ${season.name} | ${ep.title}`;
                    playInContainer(ep.url, 'direct'); // Assuming series links are direct MP4s
                };
                episodesGrid.appendChild(card);
                
                // Auto play initial
                if (eIdx === initialEpIndex) {
                    card.click();
                }
            });
        };
        
        seasonSelector.onchange = (e) => renderPlayerEpisodes(parseInt(e.target.value));
        renderPlayerEpisodes(initialSeasonIndex);
        
    } else {
        // Single Video / YouTube
        seasonContainer.style.display = 'none';
        playerTitle.textContent = item.title;
        playInContainer(item.mediaValue, item.mediaType);
    }
    
    // Show Modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Recommendations in Player
    renderPlayerRecommendations(item);
}

function playInContainer(value, type) {
    if (!value) {
        videoContainer.innerHTML = '<p style="color:red; padding: 2rem;">Video source not available.</p>';
        return;
    }
    if (type === 'youtube') {
        videoContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${value}?autoplay=1&mute=0&rel=0" 
                title="YouTube video player" frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        videoContainer.innerHTML = `
            <video controls autoplay>
                <source src="${value}" type="video/mp4">
                Your browser does not support HTML video.
            </video>
        `;
    }
}

function renderPlayerRecommendations(currentItem) {
    const recContainer = document.getElementById('player-recommended-slider');
    if (!recContainer) return;
    recContainer.innerHTML = '';
    
    let recItems = contentLibrary.filter(item => item.id !== currentItem.id);
    // Simple shuffle and limit to 10
    recItems = recItems.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    recItems.forEach(item => {
        recContainer.appendChild(createAnimeCard(item));
    });
}

// Close Video Modal

function closeModal() {
    modal.style.display = 'none';
    videoContainer.innerHTML = '';
    if (detailsModal.style.display !== 'block') {
        document.body.style.overflow = 'auto';
    }
}

closeModalBtn.addEventListener('click', closeModal);

closeDetailsBtn.addEventListener('click', () => {
    detailsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
    if (e.target === detailsModal) {
        detailsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Genre Filtering
genreFilter.addEventListener('change', (e) => {
    const genre = e.target.value;
    
    if (genre === 'all') {
        searchSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
        return;
    }
    
    mainContent.classList.add('hidden');
    searchSection.classList.remove('hidden');
    document.querySelector('#search-section .section-title').textContent = `${genre} Anime`;
    searchResults.innerHTML = '';
    
    const results = contentLibrary.filter(item => 
        item.genres && item.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );

    const countEl = document.getElementById('search-results-count');
    
    if (results.length > 0) {
        countEl.textContent = `${results.length} title${results.length > 1 ? 's' : ''} found`;
        results.forEach(item => {
            searchResults.appendChild(createAnimeCard(item));
        });
    } else {
        countEl.textContent = '';
        searchResults.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:4rem 1rem; color:var(--text-muted);">
                <i class="fa-solid fa-ghost" style="font-size:3rem; margin-bottom:1rem; opacity:0.2;"></i>
                <p style="font-size:1.1rem;">No ${genre} anime found in the library.</p>
            </div>`;
    }
});

// Search Functionality
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    
    if (query.length > 2) {
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 600);
    } else if (query.length === 0) {
        searchSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
    }
});

async function performSearch(query) {
    mainContent.classList.add('hidden');
    searchSection.classList.remove('hidden');
    document.querySelector('#search-section .section-title').textContent = `Results for "${query}"`;
    document.getElementById('search-results-count').textContent = 'Searching...';
    searchResults.innerHTML = '<div class="loader"></div>';
    
    const results = await fetchAPI(`/anime?q=${encodeURIComponent(query)}&limit=20`);
    searchResults.innerHTML = '';
    
    const countEl = document.getElementById('search-results-count');

    if (results && results.length > 0) {
        countEl.textContent = `${results.length} result${results.length > 1 ? 's' : ''} found`;
        results.forEach(anime => {
            const mappedItem = mapJikanToContent(anime, 'search', 0);
            const card = createAnimeCard(mappedItem);
            searchResults.appendChild(card);
        });
    } else {
        countEl.textContent = '';
        searchResults.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:4rem 1rem; color:var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass" style="font-size:3rem; margin-bottom:1rem; opacity:0.2;"></i>
                <p style="font-size:1.1rem;">No results found for "${query}".</p>
            </div>`;
    }
}

// Back Button for Search/Genre Section
document.getElementById('search-back-btn').addEventListener('click', () => {
    searchSection.classList.add('hidden');
    mainContent.classList.remove('hidden');
    genreFilter.value = 'all';
    searchInput.value = '';
    window.scrollTo(0, 0);
});

// Footer Genre Links
document.getElementById('footer-genre-links').addEventListener('click', (e) => {
    const link = e.target.closest('a[data-genre]');
    if (!link) return;
    e.preventDefault();
    const genre = link.dataset.genre;

    // Sync the navbar dropdown
    genreFilter.value = genre;
    genreFilter.dispatchEvent(new Event('change'));
    window.scrollTo(0, 0);
});

// Navigation Events
document.querySelector('.logo').addEventListener('click', () => location.reload());
document.querySelectorAll('.nav-links a[href^="#"]').forEach(el => {
    el.addEventListener('click', (e) => {
        location.reload();
    });
});

function openAdminArea() {
    mainContent.classList.add('hidden');
    searchSection.classList.add('hidden');
    
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        adminSection.classList.remove('hidden');
        adminLoginSection.classList.add('hidden');
        renderAdminList();
        
        // Hide Main Navbar when in Admin layout for a clean look
        navbar.style.display = 'none';
        document.body.style.overflow = 'hidden'; // Let the admin-main handle scroll
    } else {
        adminLoginSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
    }

    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    window.scrollTo(0, 0);
}

// Exit Admin Area when logging out
document.getElementById('admin-logout').addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    location.reload();
});

// Admin Sidebar Navigation
document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active class
        document.querySelectorAll('.admin-nav-item').forEach(nav => nav.classList.remove('active'));
        e.target.closest('.admin-nav-item').classList.add('active');
        
        // Update view
        const targetId = e.target.closest('.admin-nav-item').dataset.target;
        document.querySelectorAll('.admin-view').forEach(view => view.classList.add('hidden'));
        document.getElementById(targetId).classList.remove('hidden');
    });
});

// 2. Secret Access via Keyboard Shortcut (Ctrl + Shift + A)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openAdminArea();
    }
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-username').value;
    const pass = document.getElementById('admin-password').value;
    
    if (user === 'admin' && pass === 'admin123') {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        document.getElementById('login-error').style.display = 'none';
        adminLoginForm.reset();
        
        adminLoginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        renderAdminList();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

adminLogoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    location.reload();
});

// Admin Form Management (Add / Edit)

const adminMediaTypeSelect = document.getElementById('admin-media-type');
const adminVideoGroup = document.getElementById('admin-video-group');
const adminSeriesGroup = document.getElementById('admin-series-group');

adminMediaTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'series') {
        adminVideoGroup.classList.add('hidden');
        adminSeriesGroup.classList.remove('hidden');
        document.getElementById('admin-video').required = false;
        document.getElementById('admin-video-links').required = true;
    } else {
        adminVideoGroup.classList.remove('hidden');
        adminSeriesGroup.classList.add('hidden');
        document.getElementById('admin-video').required = true;
        document.getElementById('admin-video-links').required = false;
    }
});

adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const itemId = document.getElementById('admin-item-id').value;
    const category = document.getElementById('admin-category').value;
    const mediaType = document.getElementById('admin-media-type').value;
    
    let seasons = [];
    let mediaValue = document.getElementById('admin-video').value;
    
    if (mediaType === 'series') {
        mediaValue = ''; // Clear single media value
        let currentSeason = { name: 'Season 1', episodes: [] };
        let epCount = 1;

        const lines = document.getElementById('admin-video-links').value.split('\n').map(l => l.trim()).filter(l => l);
        lines.forEach(line => {
            if (line.startsWith('[') && line.endsWith(']')) {
                if (currentSeason.episodes.length > 0) {
                    seasons.push(currentSeason);
                }
                currentSeason = { name: line.slice(1, -1), episodes: [] };
                epCount = 1;
            } else if (line) {
                currentSeason.episodes.push({ epNum: epCount, title: `Episode ${epCount}`, url: line });
                epCount++;
            }
        });
        if (currentSeason.episodes.length > 0) {
            seasons.push(currentSeason);
        }
    }
    
    const itemData = {
        title: document.getElementById('admin-title').value,
        imgUrl: document.getElementById('admin-image').value,
        category: category,
        mediaType: mediaType,
        mediaValue: mediaValue,
        seasons: seasons,
        year: document.getElementById('admin-year').value,
        score: document.getElementById('admin-score').value,
        synopsis: document.getElementById('admin-synopsis').value,
        genres: document.getElementById('admin-genres').value.split(',').map(g => g.trim()).filter(g => g)
    };

    if (itemId) {
        // Editing existing item
        const index = contentLibrary.findIndex(i => i.id === itemId);
        if (index > -1) {
            contentLibrary[index] = { ...contentLibrary[index], ...itemData };
        }
        resetAdminForm();
        alert("Content updated successfully!");
    } else {
        // Adding new item
        const catItems = contentLibrary.filter(i => i.category === category);
        const order = catItems.length > 0 ? catItems[0].order - 1 : 0;
        
        contentLibrary.push({
            ...itemData,
            id: 'custom_' + Date.now() + Math.random().toString(36).substr(2, 5),
            mal_id: null,
            order: order
        });
        adminForm.reset();
        alert("Content added successfully!");
    }
    
    saveContentLibrary();
    renderAdminList();
});

adminCancelEditBtn.addEventListener('click', resetAdminForm);

function resetAdminForm() {
    adminForm.reset();
    document.getElementById('admin-item-id').value = '';
    document.getElementById('admin-genres').value = '';
    document.getElementById('admin-video-links').value = '';
    
    adminMediaTypeSelect.value = 'direct';
    adminMediaTypeSelect.dispatchEvent(new Event('change')); // Trigger visibility logic
    
    adminFormTitle.textContent = 'Add New Content';
    adminSubmitBtn.textContent = 'Save Content';
    adminCancelEditBtn.style.display = 'none';
}

// Global functions for inline HTML event listeners
window.editAdminItem = function(id) {
    const item = contentLibrary.find(i => i.id === id);
    if (!item) return;
    
    // Switch to the Add/Edit View
    document.querySelector('.admin-nav-item[data-target="admin-add-content"]').click();
    
    document.getElementById('admin-item-id').value = item.id;
    document.getElementById('admin-title').value = item.title;
    document.getElementById('admin-image').value = item.imgUrl;
    document.getElementById('admin-category').value = item.category;
    document.getElementById('admin-media-type').value = item.mediaType;
    document.getElementById('admin-video').value = item.mediaValue || '';
    
    if (item.mediaType === 'series' && item.seasons) {
        let textContent = '';
        item.seasons.forEach(season => {
            textContent += `[${season.name}]\n`;
            season.episodes.forEach(ep => {
                textContent += `${ep.url}\n`;
            });
            textContent += `\n`;
        });
        document.getElementById('admin-video-links').value = textContent.trim();
    }
    
    adminMediaTypeSelect.dispatchEvent(new Event('change')); // Trigger visibility logic
    
    document.getElementById('admin-year').value = item.year;
    document.getElementById('admin-score').value = item.score;
    document.getElementById('admin-synopsis').value = item.synopsis;
    document.getElementById('admin-genres').value = item.genres ? item.genres.join(', ') : '';

    adminFormTitle.textContent = 'Edit Content';
    adminSubmitBtn.textContent = 'Update Content';
    adminCancelEditBtn.style.display = 'block';
    
    document.querySelector('.admin-form-container').scrollIntoView({ behavior: 'smooth' });
};

window.deleteAdminItem = function(id) {
    if (confirm("Are you sure you want to delete this content?")) {
        contentLibrary = contentLibrary.filter(i => i.id !== id);
        saveContentLibrary();
        renderAdminList();
    }
};

window.moveAdminItem = function(id, direction) {
    const itemIndex = contentLibrary.findIndex(i => i.id === id);
    if (itemIndex === -1) return;
    
    const item = contentLibrary[itemIndex];
    const catItems = contentLibrary.filter(i => i.category === item.category).sort((a, b) => a.order - b.order);
    const catIndex = catItems.findIndex(i => i.id === id);
    
    if (direction === 'up' && catIndex > 0) {
        const swapItem = catItems[catIndex - 1];
        const tempOrder = item.order;
        item.order = swapItem.order;
        swapItem.order = tempOrder;
    } else if (direction === 'down' && catIndex < catItems.length - 1) {
        const swapItem = catItems[catIndex + 1];
        const tempOrder = item.order;
        item.order = swapItem.order;
        swapItem.order = tempOrder;
    }
    
    saveContentLibrary();
    renderAdminList();
};

adminFilterCategory.addEventListener('change', renderAdminList);

function renderAdminList() {
    const filter = adminFilterCategory.value;
    adminItemsList.innerHTML = '';
    
    // Update Stats
    const total = contentLibrary.length || 1;
    const animeCount = contentLibrary.filter(i => ['trending', 'popular', 'upcoming', 'custom-anime'].includes(i.category)).length;
    const movieCount = contentLibrary.filter(i => i.category === 'movie').length;

    document.getElementById('stat-total').textContent = contentLibrary.length;
    document.getElementById('stat-anime').textContent = animeCount;
    document.getElementById('stat-movies').textContent = movieCount;

    // Update Circle Graphs
    document.getElementById('graph-total').style.setProperty('--percentage', contentLibrary.length > 0 ? 100 : 0);
    document.getElementById('graph-anime').style.setProperty('--percentage', (animeCount / total) * 100);
    document.getElementById('graph-movies').style.setProperty('--percentage', (movieCount / total) * 100);

    let itemsToRender = contentLibrary.sort((a, b) => a.order - b.order);
    if (filter !== 'all') {
        itemsToRender = itemsToRender.filter(i => i.category === filter);
    }
    
    if (itemsToRender.length === 0) {
        adminItemsList.innerHTML = '<p style="color: #888;">No content found for this category.</p>';
        return;
    }

    itemsToRender.forEach((item, index) => {
        const isFirst = index === 0;
        const isLast = index === itemsToRender.length - 1;

        const div = document.createElement('div');
        div.className = 'admin-list-item';
        div.innerHTML = `
            <img src="${item.imgUrl}" alt="${item.title}" class="admin-list-img" onerror="this.src='https://via.placeholder.com/60x80?text=No+Img'">
            <div class="admin-list-info">
                <div class="admin-list-title">${item.title}</div>
                <div class="admin-list-meta">
                    <span style="color: var(--accent-color); font-weight: 600;">[${formatCategoryName(item.category)}]</span> • 
                    ${item.year || 'N/A'} • ★ ${item.score || 'N/A'}
                </div>
            </div>
            <div class="admin-item-actions">
                ${filter !== 'all' ? `
                    <button type="button" class="admin-action-btn" onclick="moveAdminItem('${item.id}', 'up')" title="Move Up" ${isFirst ? 'style="opacity:0.3; cursor:not-allowed;" disabled' : ''}>
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>
                    <button type="button" class="admin-action-btn" onclick="moveAdminItem('${item.id}', 'down')" title="Move Down" ${isLast ? 'style="opacity:0.3; cursor:not-allowed;" disabled' : ''}>
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                ` : ''}
                <button type="button" class="admin-action-btn" onclick="editAdminItem('${item.id}')" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="admin-action-btn delete-btn" onclick="deleteAdminItem('${item.id}')" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        adminItemsList.appendChild(div);
    });
}

function formatCategoryName(cat) {
    const map = {
        'trending': 'Trending Now',
        'popular': 'Popular Anime',
        'upcoming': 'Top Upcoming',
        'custom-anime': 'Custom Anime',
        'movie': 'Movie',
        'indian-toon': 'Indian Toon',
        'old-cartoon': 'Old Cartoon'
    };
    return map[cat] || cat;
}

// ==========================================
// REQUEST ANIME / MOVIE FEATURE
// ==========================================

let userRequests = JSON.parse(localStorage.getItem('dx_anime_requests')) || [];

function saveRequests() {
    localStorage.setItem('dx_anime_requests', JSON.stringify(userRequests));
}

// --- Floating Action Button ---
const requestFab = document.getElementById('request-anime-fab');
const requestModal = document.getElementById('request-modal');
const closeRequestModal = document.getElementById('close-request-modal');
const requestForm = document.getElementById('request-form');

requestFab.addEventListener('click', () => {
    requestModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

closeRequestModal.addEventListener('click', () => {
    requestModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === requestModal) {
        requestModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// --- Submit Request ---
requestForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newRequest = {
        id: 'req_' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: document.getElementById('request-name').value.trim(),
        title: document.getElementById('request-title').value.trim(),
        type: document.getElementById('request-type').value,
        message: document.getElementById('request-message').value.trim(),
        date: new Date().toISOString(),
        status: 'pending'
    };

    userRequests.push(newRequest);
    saveRequests();
    requestForm.reset();
    requestModal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Visual confirmation
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#28a745,#20c997);color:#fff;padding:1rem 2rem;border-radius:10px;font-weight:600;z-index:9999;box-shadow:0 8px 25px rgba(0,0,0,0.3);animation:fadeIn 0.3s ease;';
    toast.textContent = '✅ Request submitted! The admin will review it.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);

    updateRequestBadge();
    updateDecoStats();
});

// --- Admin: Filter Tabs ---
let currentReqFilter = 'pending';

document.querySelectorAll('.req-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.req-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentReqFilter = tab.dataset.filter;
        renderAdminRequests();
    });
});

function updateDecoStats() {
    const totalEl = document.getElementById('req-deco-total');
    const fulfilledEl = document.getElementById('req-deco-fulfilled');
    if (totalEl) totalEl.textContent = userRequests.length;
    if (fulfilledEl) fulfilledEl.textContent = userRequests.filter(r => r.status === 'approved').length;
}

// --- Admin: Render Requests ---
function renderAdminRequests() {
    const container = document.getElementById('admin-requests-list');
    if (!container) return;
    container.innerHTML = '';

    // Update stats pills
    const pendingCount = userRequests.filter(r => r.status === 'pending').length;
    const doneCount = userRequests.filter(r => r.status === 'approved').length;
    const pendingStat = document.getElementById('req-stat-pending');
    const doneStat = document.getElementById('req-stat-done');
    if (pendingStat) pendingStat.textContent = pendingCount;
    if (doneStat) doneStat.textContent = doneCount;

    let filtered = userRequests;
    if (currentReqFilter === 'pending') {
        filtered = userRequests.filter(r => r.status === 'pending');
    } else if (currentReqFilter === 'approved') {
        filtered = userRequests.filter(r => r.status === 'approved');
    }

    if (filtered.length === 0) {
        const emptyIcon = currentReqFilter === 'approved' ? 'fa-circle-check' : 'fa-inbox';
        const emptyMsg = currentReqFilter === 'approved'
            ? 'No approved requests yet.'
            : 'No pending requests. All caught up! 🎉';
        container.innerHTML = `
            <div style="text-align:center; padding:4rem 2rem; color: var(--text-muted);">
                <i class="fa-solid ${emptyIcon}" style="font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.2;"></i>
                <p style="font-size: 1.1rem; max-width: 300px; margin: 0 auto;">${emptyMsg}</p>
            </div>
        `;
        return;
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    filtered.forEach(req => {
        const date = new Date(req.date);
        const timeAgo = getTimeAgo(date);
        const typeIcon = req.type === 'Movie' ? 'fa-film' : req.type === 'Indian Toon' ? 'fa-child' : req.type === 'Old Cartoon' ? 'fa-tv' : 'fa-dragon';
        const isPending = req.status === 'pending';
        const statusClass = isPending ? 'pending' : 'approved';

        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <div class="request-card-stripe ${statusClass}"></div>
            <div class="request-card-icon ${statusClass}">
                <i class="fa-solid ${typeIcon}"></i>
            </div>
            <div class="request-card-body">
                <div class="request-card-header">
                    <h4 class="request-card-title">${req.title}</h4>
                    <span class="request-card-status ${statusClass}">${isPending ? 'Pending' : 'Done'}</span>
                </div>
                <div class="request-card-meta">
                    <span><i class="fa-solid fa-user"></i> ${req.name}</span>
                    <span><i class="fa-solid fa-tag"></i> ${req.type}</span>
                    <span><i class="fa-solid fa-clock"></i> ${timeAgo}</span>
                </div>
                ${req.message ? `<div class="request-card-message">"${req.message}"</div>` : ''}
            </div>
            ${isPending ? `
            <div class="request-card-actions">
                <button class="admin-action-btn" onclick="approveRequest('${req.id}')" title="Mark as Done" style="background:#28a745;">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="admin-action-btn delete-btn" onclick="dismissRequest('${req.id}')" title="Dismiss">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            ` : `
            <div class="request-card-actions">
                <button class="admin-action-btn delete-btn" onclick="dismissRequest('${req.id}')" title="Remove">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            `}
        `;
        container.appendChild(card);
    });
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

window.approveRequest = function(id) {
    const req = userRequests.find(r => r.id === id);
    if (req) {
        req.status = 'approved';
        saveRequests();
        renderAdminRequests();
        updateRequestBadge();
    }
};

window.dismissRequest = function(id) {
    if (confirm('Dismiss this request?')) {
        userRequests = userRequests.filter(r => r.id !== id);
        saveRequests();
        renderAdminRequests();
        updateRequestBadge();
    }
};

function updateRequestBadge() {
    const badge = document.getElementById('request-count-badge');
    if (!badge) return;
    const pending = userRequests.filter(r => r.status === 'pending').length;
    if (pending > 0) {
        badge.textContent = pending;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Hook into admin view switching to render requests when tab is opened
const originalAdminNavHandler = true; // marker
document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.dataset.target;
        if (target === 'admin-requests') {
            renderAdminRequests();
        }
    });
});

// Update badge on initial admin load
const originalRenderAdminList = renderAdminList;
const patchedRenderAdminList = function() {
    originalRenderAdminList();
    updateRequestBadge();
};

// Start application
document.addEventListener('DOMContentLoaded', () => {
    init();
    updateRequestBadge();
});
