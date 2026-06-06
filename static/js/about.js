let currentLang = 'VI';
let configData = null;

async function initAbout() {
    try {
        const response = await fetch('/api/config');
        configData = await response.json();
        const savedLang = sessionStorage.getItem('currentLang');
        currentLang = savedLang || configData.ngon_ngu_mac_dinh;

        renderNavbar();
        renderHero();
        renderIntro();
        renderServices();
        renderTeam();
        renderFooter();
    } catch (error) {
        console.error("Lỗi khởi tạo trang Giới thiệu:", error);
    }
}

function renderNavbar() {
    const navElement = document.getElementById("main-nav");
    if (!navElement || !configData) return;
    const info = configData.thong_tin_tieu_de;
    const admin = configData.lua_chon_admin;
    navElement.innerHTML = `
        <div class="nav-left" onclick="window.location.href='/'" style="cursor:pointer">
            <img src="${info.path_logo}" alt="Logo">
            <span>${info.tieu_de_ten_web[currentLang]}</span>
        </div>
        <div class="nav-center">
            <a href="/"><i class="fa-solid fa-house"></i> ${info.trang_chu[currentLang]}</a>
            <a href="/#Rent"><i class="fa-solid fa-key"></i> ${info.thue[currentLang]}</a>
            <a href="/#Buy"><i class="fa-solid fa-house-chimney"></i> ${info.mua[currentLang]}</a>
            <a href="/blog"><i class="fas fa-newspaper"></i> ${info.blog[currentLang]}</a>
            <a href="/about" class="active-property-type"><i class="fas fa-circle-info"></i> ${info.about[currentLang]}</a>
            <a href="javascript:void(0)"><i class="fas fa-envelope"></i> ${info.contact[currentLang]}</a>
        </div>
        <div class="nav-right">
            <div class="dropdown">
                <button class="dropbtn"><i class="fas fa-globe"></i> ${currentLang === 'VI' ? 'Việt' : (currentLang === 'EN' ? 'English' : '日本語')} <i class="fas fa-chevron-down"></i></button>
                <div class="dropdown-content">
                    <a href="javascript:void(0)" onclick="changeLang('VI')">Tiếng Việt</a>
                    <a href="javascript:void(0)" onclick="changeLang('EN')">English</a>
                    <a href="javascript:void(0)" onclick="changeLang('JP')">日本語</a>
                </div>
            </div>
        </div>
    `;
}

function renderHero() {
    const hero = document.getElementById('about-hero');
    const title = document.getElementById('about-hero-title');
    if (hero) hero.style.backgroundImage = `url('${configData.path_hinh_nen_gioi_thieu}')`;
    if (title) title.textContent = configData.tab_gioi_thieu.tieu_de[currentLang];
}

function renderIntro() {
    const data = configData.tab_gioi_thieu;
    document.getElementById('about-intro-title').textContent = data.tieu_de_noi_dung[currentLang];
    document.getElementById('about-intro-text').textContent = data.noi_dung[currentLang];
}

function renderServices() {
    const data = configData.tab_gioi_thieu;
    const container = document.getElementById('about-services');
    // Mapping icons phù hợp với nội dung 1-5
    const icons = [
        'fa-file-signature',    // Thông tin 1: Hợp đồng thuê
        'fa-building-columns',  // Thông tin 2: Mua bán (Icon ngân hàng/pháp lý vững chắc)
        'fa-chart-line',        // Thông tin 3: Đầu tư
        'fa-file-contract',     // Thông tin 4: Hồ sơ/Hợp đồng (Sửa từ fa-file-shield bản Pro sang bản Free)
        'fa-truck-fast'         // Thông tin 5: Chuyển nhà
    ];
    
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `
            <div class="admin-card" style="padding: 40px; border-radius: 20px; transition: 0.3s; border: 1px solid #f0f0f0;">
                <div style="width: 70px; height: 70px; background: #f4f7fe; color: var(--primary-color); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 30px;">
                    <i class="fas ${icons[i-1]}"></i>
                </div>
                <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; color: var(--text-main);">${data['thong_tin_' + i][currentLang]}</h3>
                <p style="font-size: 1rem; color: var(--text-sub); line-height: 1.8;">${data['noi_dung_thong_tin_' + i][currentLang]}</p>
            </div>
        `;
    }
    container.innerHTML = html;
}

function renderTeam() {
    const data = configData.tab_gioi_thieu;
    const teamData = configData.thong_tin_thanh_vien;
    document.getElementById('team-label').textContent = data.team[currentLang];
    document.getElementById('team-title').textContent = data.thong_tin_chung_team[currentLang];
    
    const grid = document.getElementById('team-grid');
    grid.innerHTML = Object.values(teamData).map(member => `
        <div style="flex: 0 0 300px; text-align: center; padding: 20px;">
            <div style="width: 220px; height: 220px; margin: 0 auto 30px; border-radius: 50%; overflow: hidden; border: 6px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                <img src="${member.link_anh}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h4 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">${member.ten[currentLang]}</h4>
            <p style="color: var(--primary-color); font-weight: 700; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1.5px;">${member.chuc_vu[currentLang]}</p>
        </div>
    `).join('');
}

function renderFooter() {
    const footer = document.getElementById("main-footer");
    if (!footer || !configData || !configData.footer_data) return;

    const data = configData.footer_data;
    const info = data.company_info;
    const contact = data.contact;

    let sectionsHtml = (data.sections || []).map(sec => `
        <div class="footer-column">
            <h3>${sec.title[currentLang]}</h3>
            <ul>
                ${sec.links.map(link => `<li><a href="${link.url}">${link.label[currentLang]}</a></li>`).join('')}
            </ul>
        </div>
    `).join('');

    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-column footer-about">
                <div class="nav-left" style="margin-bottom: 20px; padding: 0;">
                    <img src="${configData.thong_tin_tieu_de.path_logo}" alt="Logo" style="height: 40px;">
                    <span>${info.logo_text}</span>
                </div>
                <p>${info.slogan[currentLang]}</p>
                <div style="font-size: 12px; color: #00D084;"><i class="fas fa-shield-halved"></i> ${info.dmca_text}</div>
            </div>
            ${sectionsHtml}
            <div class="footer-column">
                <h3>${contact.title[currentLang]}</h3>
                <div class="footer-contact-item"><i class="fas fa-phone"></i> <span>TEL: ${contact.tel}</span></div>
                <div class="footer-contact-item"><i class="fas fa-envelope"></i> <span>Email: ${contact.email}</span></div>
                <div class="footer-contact-item">
                    <i class="fas fa-clock"></i>
                    <div><strong>${contact.opening_hours.label[currentLang]}:</strong><br><span style="white-space: pre-line;">${contact.opening_hours.detail[currentLang]}</span></div>
                </div>
                <div class="footer-contact-item">
                    <i class="fas fa-location-dot"></i>
                    <div><strong>${contact.address.label[currentLang]}:</strong><br><span>${contact.address.detail[currentLang]}</span></div>
                </div>
                <div class="footer-socials">
                    ${contact.socials.map(s => `<a href="${s.url}"><i class="${s.icon}"></i></a>`).join('')}
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div>${info.copyright}</div>
            <div style="display: flex; gap: 20px;"><span>Privacy</span> <span>Terms</span></div>
        </div>
    `;
}

window.changeLang = function(lang) {
    currentLang = lang;
    sessionStorage.setItem('currentLang', lang);
    renderNavbar();
    renderHero();
    renderIntro();
    renderServices();
    renderTeam();
    renderFooter();
};

document.addEventListener("DOMContentLoaded", initAbout);