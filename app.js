
const CONFIG = {
    API_BEARER: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3ODE3MDM2NTYuMzE1LCJkYXRhIjp7Il9pZCI6IjY5YjRmN2RhMGQyOTk0ZjE3MTliMjBlMCIsInVzZXJuYW1lIjoiODcyNjgzMjk0MiIsImZpcnN0TmFtZSI6Ik5pa2hpbCIsImxhc3ROYW1lIjoiIiwib3JnYW5pemF0aW9uIjp7Il9pZCI6IjVlYjM5M2VlOTVmYWI3NDY4YTc5ZDE4OSIsIndlYnNpdGUiOiJwaHlzaWNzd2FsbGFoLmNvbSIsIm5hbWUiOiJQaHlzaWNzd2FsbGFoIn0sInJvbGVzIjpbIjViMjdiZDk2NTg0MmY5NTBhNzc4YzZlZiJdLCJjb3VudHJ5R3JvdXAiOiJJTiIsIm9uZVJvbGVzIjpbXSwidHlwZSI6IlVTRVIifSwianRpIjoiOFBwa2RRejdRN3VWa0wyNXNtSmJFd182OWI0ZjdkYTBkMjk5NGYxNzE5YjIwZTAiLCJpYXQiOjE3ODEwOTg4NTZ9.5vM0jZUjaeVWr_EwW2bmgdlPXBgcOXVlDAIQ95Y6ezw",
    AUTH_TOKEN: "Qd2wfhzRoi5eQdoITwpbNKPMdMTNSs37YUjvj0rSb5sGwlFOxcRHjSW3cSaE0hDaUBuW4ndc2/LJfWgnU3M9KD+0h9LOCL43lZLNFivHRbceQ8zjDm+16KVkOlchcwRGdiWFGM9f+MQbdFMZvUIj63p5D45/tz14GrSLNA0Xh4GPAEe3geyn4PNOxlkuhUr64W5z59LIEcd0IJefCxKxtARsKFCEkKJmYwCB7Agi3bM/KtXaXkz3bUTjnf//mjOEI1UoPmH1C77uCGJZ7MULWDZ46wIvAPEGm6YJGsab6nv4f4IDHe8WMFW25PFzGLfuY08qPTZhuueqZJXB4cxGzNqhYMhu2h2DqK2JskLRcc1FOvTug18G7yXTUT/5+D39reYCpLuYxNr32TYAEvniE6h8OpNpKc2lzNGdMhW9fgrSSNFKSlY0eduqDIMeLi4IoOuYL6HAEIUSlFfYkoEQnbO4k3xGZN2UPniWloDVB5Fw5kKyMDwFPMt3R93tHhbhM30Ugl5TQtDdPRpphLC1oAaOYezzF0f0yBHYw+/1Ks1Vff9Gxw4jE/9Eit5NNP1Zx6NKo5WkcEhXmhrnfbTtEtTnkky2mO6Rwhw0EnW1JCpGJsulSnycjJWlAw3G5aZUSDfx7sRUGMeqY9MHZDIP81yRl4uq0Z6dwRiueFS8fBRvrCZkS0MLRhSUUeDWqSzG3kmLCaBJxwWapLcG0ksT5BgGuQazFRW1l0LSZOXmZZRMrBvJOikMN4Xe4WDXC7we8P5KRjns1YaMdTCCPVowB41OR4IQA8+FMY9PlV5qDAo=",
    CLIENT_ID: "5eb393ee95fab7468a79d189"
};

let state = {
    view: 'batches',
    history: [],
    currentBatch: null,
    currentSubject: null,
    currentTopic: null,
    allBatches: []
};

// Theme Logic
function applyTheme(theme) {
    const body = document.body;
    const themeClasses = ["sandalwood-mode", "forest-emerald", "ocean-deep", "sakura-blossom", "dracula-midnight", "lavender-mist", "cyberpunk-neon", "dark-mode", "dark", "light"];
    themeClasses.forEach(c => body.classList.remove(c));
    
    if (theme === 'light') {
        body.classList.add('light');
    } else {
        body.classList.add('dark', 'dark-mode');
        if (theme !== 'dark') body.classList.add(theme + (theme === 'sandalwood' ? '-mode' : ''));
    }
    
    localStorage.setItem('theme-mode', theme);
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === theme);
    });
}

// API Helper
async function apiFetch(url) {
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${CONFIG.API_BEARER}`,
            'Client-Id': CONFIG.CLIENT_ID,
            'Client-Type': 'WEB'
        }
    });
    return await res.json();
}

// Navigation
function navigate(view, params = {}) {
    state.history.push({ 
        view: state.view, 
        currentBatch: state.currentBatch,
        currentSubject: state.currentSubject,
        currentTopic: state.currentTopic,
        subjectTitle: state.subjectTitle,
        topicTitle: state.topicTitle
    });
    state.view = view;
    Object.assign(state, params);
    render();
}

function goBack() {
    if (state.history.length > 0) {
        const prev = state.history.pop();
        Object.assign(state, prev);
        render();
    }
}

// Rendering
async function render() {
    const grid = document.getElementById('batchGrid');
    const backBtn = document.getElementById('backBtn');
    const pageTitle = document.getElementById('pageTitle');
    
    showLoader(true);
    backBtn.classList.toggle('hidden', state.view === 'batches');

    try {
        if (state.view === 'batches') {
            pageTitle.innerHTML = 'RAHUL MAIDA<span> FREE STUDY</span>';
            if (state.allBatches.length === 0) {
                const res = await fetch('batches.json');
                const data = await res.json();
                state.allBatches = data.batches;
            }
            grid.innerHTML = state.allBatches.map(b => `
                <div class="card" onclick="navigate('subjects', { currentBatch: '${b._id}' })">
                    <div class="card-img-wrap">
                        <img src="${b.previewImage || 'https://i.ibb.co/RTvsC93K/bannerimage-Rahul-maida.jpg'}" class="card-img" loading="lazy">
                    </div>
                    <div class="card-content">
                        <div class="card-title">${b.name}</div>
                        <div class="action-btn">EXPLORE BATCH</div>
                    </div>
                </div>
            `).join('');
        } 
        else if (state.view === 'subjects') {
            pageTitle.innerHTML = 'SELECT<span> SUBJECT</span>';
            const data = await apiFetch(`https://api.penpencil.co/v2/batches/${state.currentBatch}/subjects`);
            grid.innerHTML = data.data.map(s => `
                <div class="card" onclick="navigate('topics', { currentSubject: '${s._id}', subjectTitle: '${s.subject}' })">
                    <div class="card-img-wrap">
                        <img src="${s.imageId || 'https://i.ibb.co/RTvsC93K/bannerimage-Rahul-maida.jpg'}" class="card-img">
                    </div>
                    <div class="card-content">
                        <div class="card-title">${s.subject}</div>
                        <div class="action-btn">VIEW TOPICS</div>
                    </div>
                </div>
            `).join('');
        }
        else if (state.view === 'topics') {
            pageTitle.innerHTML = `<span>${state.subjectTitle}</span>`;
            const data = await apiFetch(`https://api.penpencil.co/v2/batches/${state.currentBatch}/subject/${state.currentSubject}/contents?contentType=videos&page=1`);
            const tags = {};
            data.data.forEach(item => {
                item.tags.forEach(t => tags[t._id] = t.name);
            });

            grid.innerHTML = Object.entries(tags).map(([id, name]) => `
                <div class="card" onclick="navigate('content', { currentTopic: '${id}', topicTitle: '${name}' })">
                    <div class="card-content">
                        <div class="card-title">${name}</div>
                        <div class="action-btn">VIEW CONTENT</div>
                    </div>
                </div>
            `).join('');
        }
        else if (state.view === 'content') {
            pageTitle.innerHTML = `<span>${state.topicTitle}</span>`;
            const data = await apiFetch(`https://api.penpencil.co/v2/batches/${state.currentBatch}/subject/${state.currentSubject}/contents?tag=${state.currentTopic}&contentType=videos&page=1`);
            grid.innerHTML = data.data.map(item => `
                <div class="card">
                    <div class="card-img-wrap">
                        <img src="${item.videoDetails?.image || 'https://i.ibb.co/RTvsC93K/bannerimage-Rahul-maida.jpg'}" class="card-img">
                    </div>
                    <div class="card-content">
                        <div class="card-title text-sm">${item.topic}</div>
                        <div class="flex gap-2 mt-4">
                            <button class="action-btn flex-1" onclick="window.open('${item.url}')">WATCH</button>
                            <button class="action-btn flex-1 bg-gray-600" onclick="alert('Bhai, notes logic integration is next!')">NOTES</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error("Navigation error:", e);
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 font-bold">Bhai, Token expired ho gaya lagta hai! Documentation wale tokens check karo.</div>`;
    } finally {
        showLoader(false);
    }
}

// Fuzzy Search Logic
function handleSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const results = document.getElementById('searchResults');
    
    if (!q) {
        results.innerHTML = '';
        return;
    }

    const filtered = state.allBatches.filter(b => b.name.toLowerCase().includes(q));
    results.innerHTML = filtered.map(b => `
        <div class="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer" onclick="closeSearchModal(); navigate('subjects', { currentBatch: '${b._id}' })">
            <img src="${b.previewImage}" class="w-12 h-12 rounded object-cover">
            <div>
                <div class="text-white font-bold text-sm">${b.name}</div>
                <div class="text-gray-400 text-xs">${b.language}</div>
            </div>
        </div>
    `).join('');
}

function closeSearchModal() {
    document.getElementById('searchModal').classList.remove('active');
}

function showLoader(show) {
    document.getElementById('globalPreloader').style.display = show ? 'flex' : 'none';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(localStorage.getItem('theme-mode') || 'dark');
    render();

    document.getElementById('backBtn').onclick = goBack;
    document.getElementById('themeBtn').onclick = () => document.getElementById('themeModal').classList.add('active');
    document.getElementById('closeTheme').onclick = () => document.getElementById('themeModal').classList.remove('active');
    
    document.getElementById('searchBtn').onclick = () => document.getElementById('searchModal').classList.add('active');
    document.getElementById('closeSearch').onclick = closeSearchModal;
    document.getElementById('searchInput').oninput = handleSearch;

    document.querySelectorAll('.theme-card').forEach(card => {
        card.onclick = () => {
            applyTheme(card.dataset.theme);
            document.getElementById('themeModal').classList.remove('active');
        };
    });

    window.onclick = (e) => {
        if (e.target.id === 'themeModal') document.getElementById('themeModal').classList.remove('active');
        if (e.target.id === 'searchModal') closeSearchModal();
    };
});
