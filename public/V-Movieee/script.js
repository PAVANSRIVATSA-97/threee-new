const API_KEY = "api_key=1cf50e6248dc270629e802686245c2c8";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + API_KEY;
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const searchURL = BASE_URL + "/search/movie?" + API_KEY;

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const clearBtn = document.getElementById("clear-search"); 
const suggestionsBox = document.getElementById("search-suggestions");
const themeToggle = document.getElementById('theme-toggle');
const current = document.getElementById("current");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

var currentPage = 1;
var totalPages = 100;
var lastUrl = "";

// 1. Theme Persistence Logic
if (localStorage.getItem('theme') === 'light-mode') {
    document.body.classList.add('light-mode');
    if(themeToggle) themeToggle.textContent = '☀️';
}

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggle.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('theme', isLight ? 'light-mode' : 'dark-mode');
    });
}

// 2. Real-time Search & Clear Button Logic
search.addEventListener("input", () => {
    const query = search.value.trim();
    
    if (query.length > 0) {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }

    if (query.length > 1) {
        fetchSuggestions(query);
    } else {
        suggestionsBox.style.display = "none";
    }
});

clearBtn.addEventListener("click", () => {
    search.value = "";
    clearBtn.style.display = "none";
    suggestionsBox.style.display = "none";
    getMovies(API_URL); 
    search.focus();
});

async function fetchSuggestions(query) {
    try {
        const res = await fetch(`${BASE_URL}/search/movie?${API_KEY}&query=${query}`);
        const data = await res.json();
        const results = data.results.slice(0, 6);
        if (results.length > 0) {
            showSuggestions(results);
        } else {
            suggestionsBox.style.display = "none";
        }
    } catch (e) { 
        suggestionsBox.style.display = "none"; 
    }
}

function showSuggestions(movies) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "block";
    movies.forEach(movie => {
        const item = document.createElement("div");
        item.classList.add("suggestion-item");
        item.innerHTML = `
            <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'http://via.placeholder.com/50x75'}">
            <div class="suggestion-info">
                <h4>${movie.title}</h4>
                <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
            </div>`;
        item.addEventListener("click", () => {
            search.value = movie.title;
            suggestionsBox.style.display = "none";
            clearBtn.style.display = "block"; 
            getMovies(searchURL + "&query=" + movie.title);
        });
        suggestionsBox.appendChild(item);
    });
}

// 3. Movie Fetching & Rendering Logic
function getMovies(url) {
    lastUrl = url;
    fetch(url).then(res => res.json()).then(data => {
        if (data.results && data.results.length !== 0) {
            showMovies(data.results);
            currentPage = data.page;
            totalPages = data.total_pages;
            current.innerText = currentPage;
            
            prev.classList.toggle("disabled", currentPage <= 1);
            next.classList.toggle("disabled", currentPage >= totalPages);
        } else {
            main.innerHTML = `<h1 class="no-results">No Results Found</h1>`;
        }
    });
}

function showMovies(data) {
    main.innerHTML = "";
    data.forEach(movie => {
        const { title, poster_path, vote_average, overview, id } = movie;
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${poster_path ? IMG_URL + poster_path : "http://via.placeholder.com/1080x1580"}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>
            <div class="overview">
                <h3>Overview</h3>
                ${overview}
                <br/> 
                <button class="know-more" id="${id}">Know More</button>
            </div>`;
        main.appendChild(movieEl);

        // Event listener for the Know More button
        document.getElementById(id).addEventListener('click', () => {
            openNav(movie);
        });
    });
}

function getColor(vote) {
    if (vote >= 8) return "green";
    if (vote >= 5) return "orange";
    return "red";
}

// 4. Initialization & Global Listeners
getMovies(API_URL);

form.addEventListener("submit", (e) => {
    e.preventDefault();
    suggestionsBox.style.display = "none";
    if (search.value) {
        getMovies(searchURL + "&query=" + search.value);
    }
});

prev.addEventListener("click", () => { 
    if (currentPage > 1) {
        pageCall(currentPage - 1);
        document.querySelector('.content-wrapper').scrollTo({ top: 0, behavior: "smooth" });
    }
});

next.addEventListener("click", () => { 
    if (currentPage < totalPages) {
        pageCall(currentPage + 1);
        document.querySelector('.content-wrapper').scrollTo({ top: 0, behavior: "smooth" });
    }
});

function pageCall(page) {
    let urlSplit = lastUrl.split("?");
    let queryParams = urlSplit[1].split("&");
    let key = queryParams[queryParams.length - 1].split("=");
    if (key[0] != "page") {
        getMovies(lastUrl + "&page=" + page);
    } else {
        key[1] = page.toString();
        queryParams[queryParams.length - 1] = key.join("=");
        getMovies(urlSplit[0] + "?" + queryParams.join("&"));
    }
}

document.addEventListener("click", (e) => {
    if (!search.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = "none";
    }
});

/* ---------------- TRAILER OVERLAY LOGIC ---------------- */

const overlayContent = document.getElementById('overlay-content');

function openNav(movie) {
    let id = movie.id;
    fetch(BASE_URL + '/movie/' + id + '/videos?' + API_KEY).then(res => res.json()).then(videoData => {
        if (videoData.results.length > 0) {
            document.getElementById("myNav").style.width = "100%";
            var embed = [];
            videoData.results.forEach((video) => {
                let {name, key, site} = video;
                if (site == 'YouTube') {
                    embed.push(`
                        <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" 
                        title="${name}" frameborder="0" allow="accelerometer; autoplay; 
                        clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    `);
                }
            });
            overlayContent.innerHTML = embed.join('');
        } else {
            document.getElementById("myNav").style.width = "100%";
            overlayContent.innerHTML = `<h1 class="no-results">No Trailers Found</h1>`;
        }
    });
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
    overlayContent.innerHTML = ''; // Stops the video when closing
}