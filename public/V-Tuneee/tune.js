const clientID = '060fb638'; 
let player = new Audio();
let debounceTimer;

// 1. Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'light-mode') {
    body.classList.add('light-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light-mode' : 'dark-mode');
});

// 2. View Switching
function showSection(view) {
    const homeView = document.getElementById('view-home');
    const searchView = document.getElementById('view-search');
    const searchInput = document.getElementById('inner-search-input');

    if (view === 'search') {
        homeView.style.display = 'none';
        searchView.style.display = 'block';
        searchInput.focus(); 
    } else {
        homeView.style.display = 'block';
        searchView.style.display = 'none';
    }

    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    const navEl = document.getElementById(`nav-${view}`);
    if(navEl) navEl.classList.add('active');
}

// 3. Playback & Sliders
const playBtn = document.getElementById('play-pause');
const progressSlider = document.getElementById('progress');
const volumeSlider = document.getElementById('volume');

progressSlider.addEventListener('input', () => {
    if (!player.duration) return;
    player.currentTime = (progressSlider.value / 100) * player.duration;
});

volumeSlider.addEventListener('input', () => {
    player.volume = volumeSlider.value;
});

function playMusic(url, title, artist, img) {
    player.src = url;
    player.play();
    document.getElementById('track-name').textContent = title;
    document.getElementById('artist-name').textContent = artist;
    document.getElementById('now-playing-img').src = img;
    playBtn.textContent = "⏸";
}

playBtn.onclick = () => {
    if (!player.src) return;
    if (player.paused) { player.play(); playBtn.textContent = "⏸"; }
    else { player.pause(); playBtn.textContent = "▶"; }
};

player.ontimeupdate = () => {
    if (player.duration) {
        progressSlider.value = (player.currentTime / player.duration) * 100;
        document.getElementById('current-time').textContent = formatTime(player.currentTime);
        document.getElementById('total-duration').textContent = formatTime(player.duration);
    }
};

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// 4. Search API with Clear Button Logic
const innerSearch = document.getElementById('inner-search-input');
const clearBtn = document.getElementById('clear-search');

innerSearch.addEventListener('input', () => {
    const query = innerSearch.value.trim();
    
    // Toggle Clear button visibility
    clearBtn.style.display = query.length > 0 ? 'block' : 'none';

    clearTimeout(debounceTimer);
    if (query.length < 2) {
        document.getElementById('search-results').innerHTML = '';
        return;
    }
    document.getElementById('search-results').innerHTML = '<div class="loader"></div>';
    debounceTimer = setTimeout(() => fetchMusic(query, 'search-results'), 500);
});

// Logic to clear search
clearBtn.addEventListener('click', () => {
    innerSearch.value = '';
    clearBtn.style.display = 'none';
    document.getElementById('search-results').innerHTML = '';
    innerSearch.focus();
});

async function fetchMusic(query, targetGrid) {
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientID}&format=json&namesearch=${query}&include=musicinfo&imagesize=600&limit=15`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const container = document.getElementById(targetGrid);
        
        if (data.results.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:var(--muted);">No results found.</p>';
            return;
        }

        container.innerHTML = data.results.map(track => `
            <div class="box1" onclick="playMusic('${track.audio}', '${track.name}', '${track.artist_name}', '${track.image}')">
                <img src="${track.image}" width="100%" style="border-radius: 8px;">
                <h4>${track.name}</h4>
                <p>${track.artist_name}</p>
            </div>
        `).join('');
    } catch (error) { 
        console.error(error);
        document.getElementById(targetGrid).innerHTML = '<p style="color:red; text-align:center;">Error loading music.</p>';
    }
}

fetchMusic('top', 'track-list');