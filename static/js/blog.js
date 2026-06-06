let currentLang = 'VI';
let configData = null;
let currentCategory = 'tat_ca';
let allBlogPosts = [];
let currentViewedBlogId = null;

async function initBlog() {
    try {
        const response = await fetch('/api/config');
        configData = await response.json();

        // Ưu tiên lấy ngôn ngữ từ sessionStorage để đồng bộ giữa các trang
        const savedLang = sessionStorage.getItem('currentLang');
        currentLang = savedLang || configData.ngon_ngu_mac_dinh;

        renderNavbar();
        renderHero();
        renderCategories();
        loadPosts();
        renderFooter();

        // Hỗ trợ nút quay lại của trình duyệt
        window.onpopstate = function(event) {
            if (currentViewedBlogId) {
                closeBlogDetail();
            }
        };

    } catch (error) {
        console.error("Lỗi khởi tạo Blog:", error);
    }
}

function renderNavbar() {
    const navElement = document.getElementById("main-nav");
    if (!navElement || !configData) return;

    const info = configData.thong_tin_tieu_de;
    const admin = configData.lua_chon_admin;

    navElement.innerHTML = `
        <div class="nav-left" onclick="window.location.href='/'">
            <img src="${info.path_logo}" alt="Logo">
            <span>${info.tieu_de_ten_web[currentLang]}</span>
        </div>
        <div class="nav-center">
            <a href="/"><i class="fa-solid fa-house"></i> ${info.trang_chu[currentLang]}</a>
            <a href="/#Rent"><i class="fa-solid fa-key"></i> ${info.thue[currentLang]}</a>
            <a href="/#Buy"><i class="fa-solid fa-house-chimney"></i> ${info.mua[currentLang]}</a>
            <a href="/blog" class="active-property-type"><i class="fas fa-newspaper"></i> ${info.blog[currentLang]}</a>
            <a href="/about"><i class="fas fa-circle-info"></i> ${info.about[currentLang]}</a>
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
            <div class="dropdown">
                <button class="dropbtn"><i class="fas fa-user-shield"></i> ${info.admin[currentLang]} <i class="fas fa-chevron-down"></i></button>
                <div class="dropdown-content">
                    <a href="javascript:void(0)" onclick="window.location.href='/#login'"><i class="fas fa-sign-in-alt"></i> ${admin.dang_nhap[currentLang]}</a>
                </div>
            </div>
        </div>
    `;
}

function renderHero() {
    const hero = document.getElementById('blog-hero');
    const title = document.getElementById('blog-hero-title');
    const sub = document.getElementById('blog-hero-sub');

    if (hero && configData.path_hinh_nen_blog) {
        hero.style.backgroundImage = `url('${configData.path_hinh_nen_blog}')`;
    }
    if (title) title.textContent = configData.blog_ui.hero_title[currentLang];
    if (sub) sub.textContent = configData.blog_ui.hero_sub[currentLang];
}

function renderCategories() {
    const container = document.getElementById('blog-categories');
    if (!container) return;
    
    const cats = configData.blog_categories;
    const allLabel = configData.blog_ui.all_categories_label[currentLang];
    
    let html = `<div class="filter-tag ${currentCategory === 'tat_ca' ? 'active' : ''}" onclick="filterBlog('tat_ca')">${allLabel}</div>`;
    
    for (const key in cats) {
        html += `
            <div class="filter-tag ${currentCategory === key ? 'active' : ''}" onclick="filterBlog('${key}')">
                ${cats[key][currentLang]}
            </div>
        `;
    }
    container.innerHTML = html;
}

async function loadPosts() {
    const grid = document.getElementById('blog-post-grid');
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center; width:100%">Đang tải bài viết...</p>';
    
    try {
        const res = await fetch(`/api/blog-posts?category=${currentCategory}`);
        allBlogPosts = await res.json();
        
        if (allBlogPosts.length === 0) {
            grid.innerHTML = '<p style="grid-column: span 3; text-align:center; padding: 50px;">Chưa có bài viết nào trong mục này.</p>';
            return;
        }

        grid.innerHTML = allBlogPosts.map(post => `
            <div class="blog-card" onclick="showBlogDetail(${post.id})">
                <img src="${post.image_url}" class="blog-card-img" alt="blog">
                <div class="blog-card-content">
                    <div class="lang-badge" style="margin-bottom: 10px;">${configData.blog_categories[post.category_key][currentLang]}</div>
                    <div class="blog-card-title">${post['title_' + currentLang.toLowerCase()]}</div>
                    <div class="blog-card-desc">${post['desc_' + currentLang.toLowerCase()]}</div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        grid.innerHTML = '<p style="text-align:center; width:100%">Lỗi tải dữ liệu bài viết.</p>';
    }
}

window.showBlogDetail = function(blogId) {
    currentViewedBlogId = blogId;
    const post = allBlogPosts.find(p => p.id === blogId);
    if (!post) return;

    document.getElementById('blog-hero').style.display = 'none';
    document.getElementById('main-content-wrapper').style.display = 'none';
    const detailView = document.getElementById('blog-detail-view');
    detailView.style.display = 'block';

    const langSuffix = currentLang.toLowerCase();
    const categoryName = configData.blog_categories[post.category_key][currentLang];
    
    const dict = {
        back: { VI: "Quay lại Blog", EN: "Back to Blog", JP: "ブログに戻る" },
        share: { VI: "Chia sẻ", EN: "Share", JP: "共有" }
    };

    detailView.innerHTML = `
        <div class="detail-view-container" style="max-width: 900px; margin: 0 auto; padding-bottom: 100px;">
            <div class="back-btn" onclick="closeBlogDetail()" style="margin-bottom: 40px;">
                <i class="fas fa-arrow-left"></i> ${dict.back[currentLang]}
            </div>

            <header style="text-align: center; margin-bottom: 50px;">
                <div class="lang-badge" style="background: var(--primary-color); color: white; margin-bottom: 20px; padding: 5px 15px;">${categoryName}</div>
                <h1 style="font-size: 3rem; font-weight: 800; line-height: 1.2; margin-bottom: 20px; color: var(--text-main);">${post['title_' + langSuffix]}</h1>
                <div style="color: var(--text-sub); font-size: 0.9rem; display: flex; justify-content: center; gap: 20px; align-items: center;">
                    <span><i class="far fa-calendar-alt"></i> ${new Date(post.created_at).toLocaleDateString()}</span>
                    <span><i class="far fa-clock"></i> 5 min read</span>
                </div>
            </header>

            <div style="width: 100%; border-radius: 20px; overflow: hidden; margin-bottom: 50px; box-shadow: var(--shadow);">
                <img src="${post.image_url}" style="width: 100%; display: block; object-fit: cover; max-height: 500px;">
            </div>

            <article class="blog-content-body" style="font-size: 1.2rem; line-height: 1.8; color: #333;">
                <div style="font-weight: 600; font-size: 1.4rem; color: var(--text-main); margin-bottom: 30px; border-left: 4px solid var(--primary-color); padding-left: 20px;">
                    ${post['desc_' + langSuffix]}
                </div>
                <div class="content-text">
                    ${post['content_' + langSuffix]}
                </div>
            </article>

            <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 10px;">
                    <button class="btn-action edit" onclick="window.scrollTo({top:0, behavior:'smooth'})"><i class="fas fa-chevron-up"></i></button>
                </div>
                <div class="footer-socials" style="margin-top: 0;">
                    <span style="color: var(--text-sub); font-size: 0.9rem; margin-right: 10px;">${dict.share[currentLang]}</span>
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-line"></i></a>
                </div>
            </div>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.closeBlogDetail = function() {
    currentViewedBlogId = null;
    document.getElementById('blog-hero').style.display = 'flex';
    document.getElementById('main-content-wrapper').style.display = 'block';
    document.getElementById('blog-detail-view').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.filterBlog = function(catKey) {
    currentCategory = catKey;
    renderCategories();
    loadPosts();
};

function renderFooter() {
    const footer = document.getElementById("main-footer");
    if (!footer || !configData.footer_data) return;

    const data = configData.footer_data;
    const info = data.company_info;
    const contact = data.contact;

    let sectionsHtml = data.sections.map(sec => `
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
    sessionStorage.setItem('currentLang', lang); // Lưu vào bộ nhớ trình duyệt
    renderNavbar();
    renderHero(); // Phải gọi lại hàm này để cập nhật tiêu đề Blog & Knowledge
    renderCategories();
    loadPosts();
    if (currentViewedBlogId) {
        showBlogDetail(currentViewedBlogId);
    }
};

document.addEventListener("DOMContentLoaded", initBlog);