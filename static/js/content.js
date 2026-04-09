let currentLang = 'VI';
let configData = null;

async function initApp() {
    try {
        const response = await fetch('/api/config');
        configData = await response.json();
        currentLang = configData.ngon_ngu_mac_dinh;
        renderNavbar();
        updateBodyText();
    } catch (error) {
        console.error("Không thể tải cấu hình:", error);
    }
}

function renderNavbar() {
    const navElement = document.getElementById("main-nav");
    if (!navElement || !configData) return;

    const info = configData.thong_tin_tieu_de;
    const admin = configData.lua_chon_admin;

    navElement.innerHTML = `
        <div class="nav-left">
            <img src="${info.path_logo}" alt="Logo">
            <span>${info.tieu_de_ten_web[currentLang]}</span>
        </div>
        <div class="nav-center">
            <a href="#"><i class="fa-solid fa-key"></i> ${info.thue[currentLang]}</a>
            <a href="#"><i class="fa-solid fa-house-chimney"></i> ${info.mua[currentLang]}</a>
            <a href="#"><i class="fas fa-newspaper"></i> ${info.blog[currentLang]}</a>
            <a href="#"><i class="fas fa-circle-info"></i> ${info.about[currentLang]}</a>
            <a href="#"><i class="fas fa-envelope"></i> ${info.contact[currentLang]}</a>
        </div>
        <div class="nav-right">
            <div class="dropdown">
                <button class="dropbtn"><i class="fas fa-globe"></i> ${getLangLabel(currentLang)} <i class="fas fa-chevron-down"></i></button>
                <div class="dropdown-content">
                    <a href="javascript:void(0)" onclick="changeLang('VI')">Tiếng Việt</a>
                    <a href="javascript:void(0)" onclick="changeLang('EN')">English</a>
                    <a href="javascript:void(0)" onclick="changeLang('JP')">日本語</a>
                </div>
            </div>
            <div class="dropdown">
                <button class="dropbtn"><i class="fas fa-user-shield"></i> ${info.admin[currentLang]} <i class="fas fa-chevron-down"></i></button>
                <div class="dropdown-content">
                    <a href="#"><i class="fas fa-sign-in-alt"></i> ${admin.dang_nhap[currentLang]}</a>
                    <a href="#"><i class="fas fa-lock"></i> ${admin.doi_mat_khau[currentLang]}</a>
                </div>
            </div>
        </div>
    `;
}

function updateBodyText() {
    const mainText = document.getElementById("main-text");
    const subText = document.getElementById("sub-text");
    
    const welcome = {
        "VI": "Chào mừng bạn đến với hệ thống!",
        "EN": "Welcome to our system!",
        "JP": "システムへようこそ！"
    };
    
    if (mainText) mainText.innerText = welcome[currentLang];
    if (subText) subText.innerText = configData.thong_tin_tieu_de.about[currentLang];
}

function getLangLabel(code) {
    const labels = { 'VI': 'Việt', 'EN': 'English', 'JP': '日本語' };
    return labels[code] || code;
}

window.changeLang = function(lang) {
    currentLang = lang;
    renderNavbar();
    updateBodyText();
};

document.addEventListener("DOMContentLoaded", initApp);