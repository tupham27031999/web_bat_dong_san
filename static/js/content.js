let currentLang = 'VI';
let configData = null;
let searchState = {
    dia_chi: '',
    so_phong_ngu: '',
    gia_thue_min: '',
    gia_thue_max: ''
};
let selectedPropertyType = ''; // Biến mới để lưu trạng thái chọn Thuê/Mua
let currentFilters = ['tim_kiem_tat_ca'];
let currentPage = 1;
let currentPropertyImages = [];
let currentLightboxIndex = 0;
let currentScale = 1;

// New state variables for Rent and Buy sections
let currentRentFilters = ['tim_kiem_tat_ca'];
let currentBuyFilters = ['tim_kiem_tat_ca'];
let currentViewedPropertyId = null; // Moved here
let currentRentPage = 1;
let currentBuyPage = 1;

async function initApp() {
    try {
        const response = await fetch('/api/config');
        configData = await response.json();
        currentLang = configData.ngon_ngu_mac_dinh;
        
        // Khôi phục trạng thái tìm kiếm từ sessionStorage nếu có
        const savedSearch = sessionStorage.getItem('searchState');
        if (savedSearch) searchState = JSON.parse(savedSearch);
        
        // Khôi phục trạng thái chọn Thuê/Mua từ sessionStorage
        // selectedPropertyType will now be used for scrolling to section, not filtering the main view
        selectedPropertyType = sessionStorage.getItem('selectedPropertyType') || 'Rent'; // Default to Rent section active/visible

        // Khôi phục trạng thái filter và page cho từng loại (Rent/Buy)
        const savedRentFilters = sessionStorage.getItem('currentRentFilters');
        if (savedRentFilters) currentRentFilters = JSON.parse(savedRentFilters);
        const savedBuyFilters = sessionStorage.getItem('currentBuyFilters');
        
        if (savedBuyFilters) currentBuyFilters = JSON.parse(savedBuyFilters);

        const savedRentPage = sessionStorage.getItem('currentRentPage');
        if (savedRentPage) currentRentPage = parseInt(savedRentPage);
        const savedBuyPage = sessionStorage.getItem('currentBuyPage');
        if (savedBuyPage) currentBuyPage = parseInt(savedBuyPage);

        renderNavbar();
        renderHero();
        refreshMainUI();
        updateSectionTitles();
        renderFooter();

        // Keyboard navigation for Lightbox
        document.addEventListener('keydown', (e) => {
            const lb = document.getElementById('lightbox-modal');
            if (lb && lb.style.display === 'flex') {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') changeLightboxImage(-1);
                if (e.key === 'ArrowRight') changeLightboxImage(1);
            }
        });

        // Mouse wheel zoom for Lightbox
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg) {
            lightboxImg.parentElement.addEventListener('wheel', (e) => {
                const modal = document.getElementById('lightbox-modal');
                if (modal && modal.style.display === 'flex') {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.2 : 0.2;
                    currentScale = Math.min(Math.max(1, currentScale + delta), 4);
                    applyZoom();
                }
            }, { passive: false });
        }
    } catch (error) {
        console.error("Không thể tải cấu hình:", error);
    }
}

function applyZoom() {
    const img = document.getElementById('lightbox-img');
    if (img) {
        img.style.transform = `scale(${currentScale})`;
        img.style.cursor = currentScale > 1 ? 'zoom-out' : 'zoom-in';
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
            <a href="javascript:void(0)" id="nav-rent" onclick="scrollToSection('Rent')" class="${selectedPropertyType === 'Rent' ? 'active-property-type' : ''}"><i class="fa-solid fa-key"></i> ${info.thue[currentLang]}</a>
            <a href="javascript:void(0)" id="nav-buy" onclick="scrollToSection('Buy')" class="${selectedPropertyType === 'Buy' ? 'active-property-type' : ''}"><i class="fa-solid fa-house-chimney"></i> ${info.mua[currentLang]}</a>
            <a href="javascript:void(0)"><i class="fas fa-newspaper"></i> ${info.blog[currentLang]}</a>
            <a href="javascript:void(0)"><i class="fas fa-circle-info"></i> ${info.about[currentLang]}</a>
            <a href="javascript:void(0)"><i class="fas fa-envelope"></i> ${info.contact[currentLang]}</a>
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
                    <a href="javascript:void(0)" onclick="showLoginModal()"><i class="fas fa-sign-in-alt"></i> ${admin.dang_nhap[currentLang]}</a>
                    <a href="javascript:void(0)" onclick="showChangePasswordModal()"><i class="fas fa-lock"></i> ${admin.doi_mat_khau[currentLang]}</a>
                </div>
            </div>
        </div>
    `;
}

function renderHero() {
    const heroSection = document.getElementById("hero-section");
    const searchBar = document.getElementById("search-bar");
    const sloganMain = document.getElementById("hero-slogan-text");
    
    if (!configData) return;

    const search = configData.thanh_tim_kiem;
    const locations = configData.danh_sach_dia_chi_lua_chon;
    
    if (sloganMain) sloganMain.textContent = configData.slogan_tim_kiem[currentLang];
    
    heroSection.style.backgroundImage = `url('${configData.path_hinh_nen}')`;
    
    const labels = {
        all: { "VI": "Tất cả", "EN": "All", "JP": "すべて" },
        searchBtn: { "VI": "Tìm kiếm", "EN": "Search", "JP": "検索" },
        placeholderBed: { "VI": "VD: 2", "EN": "e.g. 2", "JP": "例: 2" }
    };

    searchBar.innerHTML = `
        <div class="search-group">
            <label><i class="fa-solid fa-location-dot"></i> ${search.dia_chi[currentLang]}</label>
            <select id="search-location">
                <option value="">-- ${labels.all[currentLang]} --</option>
                ${locations.map(loc => `<option value="${loc}" ${searchState.dia_chi === loc ? 'selected' : ''}>${loc}</option>`).join('')}
            </select>
        </div>
        <div class="search-group">
            <label><i class="fa-solid fa-bed"></i> ${search.so_phong_ngu[currentLang]}</label>
            <input type="number" id="search-beds" min="1" placeholder="${labels.placeholderBed[currentLang]}" value="${searchState.so_phong_ngu}">
        </div>
        <div class="search-group" style="flex: 1.5;">
            <label style="align-self: center;"><i class="fa-solid fa-money-bill-wave"></i> ${search.gia_tien[currentLang]} (${search.don_vi})</label>
            <div class="price-inputs-wrapper">
                <input type="number" id="search-price-min" min="0" placeholder="${search.nho_nhat[currentLang]}" value="${searchState.gia_thue_min}">
                <span class="price-divider">-</span>
                <input type="number" id="search-price-max" min="0" placeholder="${search.lon_nhat[currentLang]}" value="${searchState.gia_thue_max}">
            </div>
        </div>
        <button class="btn-search" onclick="handleSearch()">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>${labels.searchBtn[currentLang]}</span>
        </button>
    `;
}

window.handleSearch = function() {
    const dia_chi = document.getElementById('search-location').value;
    const so_phong_ngu = document.getElementById('search-beds').value;
    const min_gia = document.getElementById('search-price-min').value;
    const max_gia = document.getElementById('search-price-max').value;

    // Validation logic
    const errorMsgs = {
        "VI": {
            bed: "Số phòng ngủ phải lớn hơn hoặc bằng 1!",
            negative: "Giá tiền không được âm!",
            compare: "Giá lớn nhất phải lớn hơn hoặc bằng giá nhỏ nhất!"
        },
        "EN": {
            bed: "Number of bedrooms must be at least 1!",
            negative: "Price cannot be negative!",
            compare: "Max price must be greater than or equal to min price!"
        },
        "JP": {
            bed: "寝室数は1以上である必要があります！",
            negative: "価格を負にすることはできません！",
            compare: "最大価格は最小価格以上である必要があります！"
        }
    };

    if (so_phong_ngu && parseInt(so_phong_ngu) < 1) {
        alert(errorMsgs[currentLang].bed);
        return;
    }
    if ((min_gia && parseFloat(min_gia) < 0) || (max_gia && parseFloat(max_gia) < 0)) {
        alert(errorMsgs[currentLang].negative);
        return;
    }
    if (min_gia && max_gia && parseFloat(max_gia) < parseFloat(min_gia)) {
        alert(errorMsgs[currentLang].compare);
        return;
    }

    searchState = {
        dia_chi: dia_chi,
        so_phong_ngu: so_phong_ngu,
        gia_thue_min: min_gia,
        gia_thue_max: max_gia
    };
    
    // Lưu vào sessionStorage để không mất khi tải lại trang/quay lại
    sessionStorage.setItem('searchState', JSON.stringify(searchState));
    
    // Thực hiện render lại danh sách với bộ lọc mới
    currentRentPage = 1;
    currentBuyPage = 1;
    refreshMainUI();
    window.scrollTo({ top: document.getElementById('main-content-wrapper').offsetTop - 100, behavior: 'smooth' });
};

window.scrollToSection = function(type) {
    selectedPropertyType = type;
    sessionStorage.setItem('selectedPropertyType', selectedPropertyType); // Lưu trạng thái
    renderNavbar(); // Cập nhật lại navbar để hiển thị trạng thái active
    // Nhắm mục tiêu đến ID của tiêu đề thay vì khung chứa để tiêu đề hiện ra khi cuộn
    const targetId = type === 'Rent' ? 'rent-title' : 'buy-title';
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        // Điều chỉnh lại thành -150px để tiêu đề nằm ở vị trí thoáng hơn, không bị che khuất
        window.scrollTo({ top: targetElement.offsetTop - 150, behavior: 'smooth' });
    }
};

function updateSectionTitles() {
    const rentTitle = document.getElementById('rent-title');
    const buyTitle = document.getElementById('buy-title');
    if (!rentTitle || !buyTitle || !configData) return;

    const info = configData.thong_tin_tieu_de;
    rentTitle.innerHTML = `<i class="fa-solid fa-key"></i> ${info.thue[currentLang]}`;
    buyTitle.innerHTML = `<i class="fa-solid fa-house-chimney"></i> ${info.mua[currentLang]}`;
}

function refreshMainUI() {
    renderRentSection();
    renderBuySection();
}
function renderRentSection() {
    renderSloganForType('Rent');
    renderFiltersForType('Rent');
    renderPropertiesForType('Rent');
}

function renderBuySection() {
    renderSloganForType('Buy');
    renderFiltersForType('Buy');
    renderPropertiesForType('Buy');
}

function renderSloganForType(type) {
    const containerId = type === 'Rent' ? 'slogan-container-rent' : 'slogan-container-buy';
    const container = document.getElementById(containerId);
    if (!container || !configData) return;

    const sloganKey = type === 'Rent' ? 'slogan_thue' : 'slogan_mua';
    const avatarPathKey = type === 'Rent' ? 'path_avatar_thue' : 'path_avatar_mua';
    const text = configData.slogan[sloganKey][currentLang];

    container.innerHTML = `
        <div class="slogan-text">${text}</div> 
        <img src="${configData[avatarPathKey]}" class="avatar-3d" alt="3D Avatar">
    `;
}

function renderFiltersForType(type) {
    const containerId = type === 'Rent' ? 'filter-options-rent' : 'filter-options-buy';
    const container = document.getElementById(containerId);
    if (!container || !configData) return;

    const options = type === 'Rent' ? configData.cac_lua_chon_thue : configData.cac_lua_chon_mua;
    const currentFilters = type === 'Rent' ? currentRentFilters : currentBuyFilters;

    container.innerHTML = Object.keys(options).map(key => `
        <div class="filter-tag ${currentFilters.includes(key) ? 'active' : ''}"
             onclick="toggleFilterForType('${type}', '${key}')">
            ${options[key][currentLang]}
        </div>
    `).join('');
}
window.toggleFilterForType = function(type, key) {
    let filters = type === 'Rent' ? currentRentFilters : currentBuyFilters;

    if (key === 'tim_kiem_tat_ca') {
        filters = ['tim_kiem_tat_ca'];
    } else {
        // Nếu chọn cái khác, bỏ 'tim_kiem_tat_ca'
        filters = filters.filter(f => f !== 'tim_kiem_tat_ca');
        
        if (filters.includes(key)) {
            filters = filters.filter(f => f !== key);
        } else {
            filters.push(key);
        }
        
        // Nếu không còn cái nào được chọn, tự động quay về 'tim_kiem_tat_ca'
        if (filters.length === 0) filters = ['tim_kiem_tat_ca'];
    }

    if (type === 'Rent') {
        currentRentFilters = filters;
        sessionStorage.setItem('currentRentFilters', JSON.stringify(currentRentFilters));
        currentRentPage = 1;
    } else {
        currentBuyFilters = filters;
        sessionStorage.setItem('currentBuyFilters', JSON.stringify(currentBuyFilters));
        currentBuyPage = 1;
    }
    renderFiltersForType(type);
    renderPropertiesForType(type);
};

function renderPropertiesForType(type) {
    const containerId = type === 'Rent' ? 'property-list-rent' : 'property-list-buy';
    const paginationContainerId = type === 'Rent' ? 'pagination-rent' : 'pagination-buy';
    const container = document.getElementById(containerId);
    const paginationContainer = document.getElementById(paginationContainerId);
    if (!container || !configData) return;

    // Start with all properties
    let filtered = configData.danh_sach_bds || [];

    // 2. Lọc theo Thanh tìm kiếm (Search Bar)
    if (searchState.dia_chi) {
        filtered = filtered.filter(p => {
            const p_ward = (p.quan_huyen && typeof p.quan_huyen === 'object') ? p.quan_huyen['EN'] : (p.quan_huyen || '');
            return p_ward === searchState.dia_chi;
        });
    }
    if (searchState.so_phong_ngu) {
        filtered = filtered.filter(p => parseInt(p.so_phong_ngu) >= parseInt(searchState.so_phong_ngu));
    }
    if (searchState.gia_thue_min) {
        filtered = filtered.filter(p => parseFloat(p.gia_jpy) >= parseFloat(searchState.gia_thue_min));
    }
    if (searchState.gia_thue_max) {
        filtered = filtered.filter(p => parseFloat(p.gia_jpy) <= parseFloat(searchState.gia_thue_max));
    }

    // 3. Lọc theo Loại (thue/ban) và Tags (Single room, Family, etc.)
    const currentFiltersForType = type === 'Rent' ? currentRentFilters : currentBuyFilters;
    filtered = filtered.filter(p => p.phan_loai === (type === 'Rent' ? 'thue' : 'ban'));
    if (!currentFiltersForType.includes('tim_kiem_tat_ca')) {
        filtered = filtered.filter(p => {
            return currentFiltersForType.some(f => p[f] === 'yes');
        });
    }
    
    const itemsPerPage = 6;
    const totalItems = filtered.length;
    const page = type === 'Rent' ? currentRentPage : currentBuyPage;
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    if (totalItems === 0) {
        container.innerHTML = `<div style="grid-column: span 3; padding: 100px 0; color: var(--text-sub);">
            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.2;"></i>
            <p>${currentLang === 'VI' ? 'Không tìm thấy bất động sản nào phù hợp.' : 'No properties found matching your criteria.'}</p>
        </div>`;
        paginationContainer.innerHTML = '';
        return;
    }

    container.innerHTML = paginatedItems.map(p => `
        <div class="property-card" onclick="showPropertyDetail('${p.ma_bds}')">
            ${renderBadge(p.phan_loai)}
            ${p.anh_bds && p.anh_bds.length > 0 
                ? `<img src="${p.anh_bds[0]}" class="property-img" alt="property">`
                : `<div class="no-image-placeholder"><i class="fas fa-image"></i><span style="font-size: 12px; font-weight: 600;">No Photo</span></div>`
            }
            <div class="property-info">
                <div class="property-price">${parseInt(p.gia_jpy || 0).toLocaleString()} <small>JPY</small></div>
                <div class="property-title">${(p.ten_bds && typeof p.ten_bds === 'object' ? p.ten_bds[currentLang] : p.ten_bds) || 'No Name'}</div>
                <div class="property-location"><i class="fa-solid fa-location-dot"></i> ${formatJapaneseAddress(p)}</div>
                <div class="property-details">
                    <span><i class="fas fa-bed"></i> ${p.so_phong_ngu || 0}</span>
                    <span><i class="fas fa-vector-square"></i> ${p.dien_tich || 0} m²</span>
                    ${p.so_tang ? `<span><i class="fas fa-building"></i> ${p.so_tang} F</span>` : ''}
                </div>
                <div class="property-features">
                    <i class="fas fa-user ${p.phong_don === 'yes' ? 'on' : 'off'}" title="${(type === 'Rent' ? configData.cac_lua_chon_thue : configData.cac_lua_chon_mua).phong_don[currentLang]}"></i>
                    <i class="fas fa-users ${p.phong_gia_dinh === 'yes' ? 'on' : 'off'}" title="${(type === 'Rent' ? configData.cac_lua_chon_thue : configData.cac_lua_chon_mua).phong_gia_dinh[currentLang]}"></i>
                    <i class="fas fa-home ${p.nha_rieng === 'yes' ? 'on' : 'off'}" title="${(type === 'Rent' ? configData.cac_lua_chon_thue : configData.cac_lua_chon_mua).nha_rieng[currentLang]}"></i>
                    <i class="fas fa-paw ${p.thu_nuoi === 'yes' ? 'on' : 'off'}" title="${configData.thong_tin_bds_form.thu_nuoi.label[currentLang]}"></i>
                </div>
            </div>
        </div>
    `).join('');

    // Render Pagination
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNo => `
        <div class="page-btn ${pageNo === page ? 'active' : ''}" 
             onclick="changePageForType('${type}', ${pageNo})">
            ${pageNo}
        </div>
    `).join('');

    // Save current page to session storage
    if (type === 'Rent') {
        sessionStorage.setItem('currentRentPage', currentPage);
    } else {
        sessionStorage.setItem('currentBuyPage', currentPage);
    }
};

window.changePageForType = function(type, page) {
    if (type === 'Rent') {
        currentRentPage = page;
    } else {
        currentBuyPage = page;
    }
    renderPropertiesForType(type);
    const targetId = type === 'Rent' ? 'rent-section-wrapper' : 'buy-section-wrapper';
    window.scrollTo({ top: document.getElementById(targetId).offsetTop - 100, behavior: 'smooth' });
};

function renderBadge(type) {
    if (!configData || !configData.thong_tin_bds_form.phan_loai) return '';
    const labels = configData.thong_tin_bds_form.phan_loai.options;
    if (type === 'thue') return `<span class="property-badge badge-rent">${labels.thue[currentLang]}</span>`;
    if (type === 'ban') return `<span class="property-badge badge-sale">${labels.ban[currentLang]}</span>`;
    if (type === 'dau_tu') return `<span class="property-badge badge-invest">${labels.dau_tu[currentLang]}</span>`;
    return '';
}

function getLangLabel(code) {
    const labels = { 'VI': 'Việt', 'EN': 'English', 'JP': '日本語' };
    return labels[code] || code;
}

window.changeLang = function(lang) {
    currentLang = lang;
    renderNavbar();
    renderHero();
    updateSectionTitles();
    refreshMainUI(); // Rerender both sections
    if (currentViewedPropertyId) { // If a detail view is open, re-render it with new language
        showPropertyDetail(currentViewedPropertyId);
    }
};

const formatJapaneseAddress = (item) => {
    if (!item) return '';
    const pref = (item.tinh_thanh && typeof item.tinh_thanh === 'object') ? item.tinh_thanh[currentLang] : (item.tinh_thanh || '');
    const ward = (item.quan_huyen && typeof item.quan_huyen === 'object') ? item.quan_huyen[currentLang] : (item.quan_huyen || '');
    const detail = (item.dia_chi_chi_tiet && typeof item.dia_chi_chi_tiet === 'object') 
                    ? item.dia_chi_chi_tiet[currentLang] 
                    : item.dia_chi_chi_tiet || '';
    
    if (currentLang === 'JP') {
        return `〒${item.ma_buu_dien || ''} ${pref}${ward}${detail}`;
    } else {
        return `${detail}, ${ward}, ${pref} ${item.ma_buu_dien || ''}`;
    }
};

window.showPropertyDetail = function(ma_bds) {
    currentViewedPropertyId = ma_bds;
    const prop = configData.danh_sach_bds.find(p => p.ma_bds === ma_bds);
    if (!prop) return;

    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('main-content-wrapper').style.display = 'none'; // Hide the entire main content wrapper
    const detailView = document.getElementById('property-detail-view');
    detailView.style.display = 'block';

    const labels = configData.thong_tin_bds_form;
    const name = (prop.ten_bds && typeof prop.ten_bds === 'object') ? prop.ten_bds[currentLang] : prop.ten_bds;

    const dict = {
        back: { VI: "Quay lại danh sách", EN: "Back to list", JP: "リストに戻る" },
        contact: { VI: "Liên hệ tư vấn", EN: "Quick Inquiry", JP: "お問い合わせ" },
        name: { VI: "Họ và tên", EN: "Full Name", JP: "お名前" },
        phone: { VI: "Số điện thoại", EN: "Phone", JP: "電話番号" },
        send: { VI: "Gửi yêu cầu", EN: "Send Inquiry", JP: "送信" },
        overview: { VI: "Tổng quan bất động sản", EN: "Property Overview", JP: "物件概要" },
        amenities: { VI: "Tiện ích & Đặc điểm", EN: "Features & Amenities", JP: "設備・特徴" },
        location: { VI: "Vị trí & Bản đồ", EN: "Location & Map", JP: "地図・アクセス" }
    };

    const images = prop.anh_bds || [];
    currentPropertyImages = images;
    
    let displayCount = 1;
    let gridClass = 'grid-1';
    if (images.length >= 5) { displayCount = 5; gridClass = 'grid-5'; }
    else if (images.length >= 3) { displayCount = 3; gridClass = 'grid-3'; }
    else if (images.length > 0) { displayCount = 1; gridClass = 'grid-1'; }

    let imagesHtml = `<div class="detail-gallery ${gridClass}">`;
    if (images.length === 0) {
        imagesHtml += `<div class="gallery-item img-1"><img src="/static/uploads/properties/default.jpg" class="gallery-img"></div>`;
    } else {
        for (let i = 0; i < displayCount; i++) {
            const isLast = (i === displayCount - 1);
            const hasMore = images.length > displayCount;
            const overlay = (isLast && hasMore) ? `<div class="gallery-overlay"><span>+${images.length - displayCount}</span></div>` : '';
            imagesHtml += `
                <div class="gallery-item img-${i+1}" onclick="openLightbox(${i})">
                    <img src="${images[i]}" class="gallery-img">
                    ${overlay}
                </div>`;
        }
    }
    imagesHtml += `</div>`;

    detailView.innerHTML = `
        <div class="back-btn" onclick="closePropertyDetail()">
            <i class="fas fa-chevron-left"></i> ${dict.back[currentLang]}
        </div>

        <div class="detail-header">
            <div>
                <h1 style="font-size: 2.2rem; margin-bottom: 12px;">${name}</h1>
                <div class="property-location" style="font-size: 1rem;"><i class="fa-solid fa-location-dot"></i> ${formatJapaneseAddress(prop)}</div>
            </div>
            ${renderBadge(prop.phan_loai)}
        </div>

        ${imagesHtml}

        <div class="detail-body">
            <div class="detail-main-info">
                <div class="detail-price-section">
                    <span class="detail-price-jpy">${parseInt(prop.gia_jpy || 0).toLocaleString()} <small>JPY</small></span>
                    <div class="detail-price-alt">
                        <div>≈ $${parseInt(prop.gia_usd || 0).toLocaleString()} USD</div>
                        <div>≈ ${parseInt(prop.gia_vnd || 0).toLocaleString()} VND</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item"><label>${labels.dien_tich.label[currentLang]}</label><span>${prop.dien_tich || '--'} m²</span></div>
                    <div class="info-item"><label>${labels.so_phong_ngu.label[currentLang]}</label><span>${prop.so_phong_ngu || '--'}</span></div>
                    <div class="info-item"><label>${labels.so_tang.label[currentLang]}</label><span>${prop.so_tang || '--'} F</span></div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title"><i class="fas fa-file-lines"></i> ${dict.overview[currentLang]}</div>
                    <p style="color: var(--text-sub); line-height: 2; font-size: 1.05rem; white-space: pre-line;">
                        ${(prop.mo_ta && prop.mo_ta[currentLang]) ? prop.mo_ta[currentLang] : 
                          (currentLang === 'VI' ? 'Thông tin mô tả đang được cập nhật...' : 'Description is being updated...')}
                    </p>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title"><i class="fas fa-list-check"></i> ${dict.amenities[currentLang]}</div>
                    <div class="amenities-grid">
                        <div class="amenity ${prop.phong_don === 'yes' ? '' : 'off'}"><i class="fas fa-user-circle"></i> ${labels.phong_don.label[currentLang]}</div>
                        <div class="amenity ${prop.phong_gia_dinh === 'yes' ? '' : 'off'}"><i class="fas fa-users"></i> ${labels.phong_gia_dinh.label[currentLang]}</div>
                        <div class="amenity ${prop.nha_rieng === 'yes' ? '' : 'off'}"><i class="fas fa-building"></i> ${labels.nha_rieng.label[currentLang]}</div>
                        <div class="amenity ${prop.thu_nuoi === 'yes' ? '' : 'off'}"><i class="fas fa-paw"></i> ${labels.thu_nuoi.label[currentLang]}</div>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title"><i class="fas fa-map-location-dot"></i> ${dict.location[currentLang]}</div>
                    <div class="map-container-wrapper">
                        <div id="map"></div>
                        <a href="https://www.google.com/maps/search/?api=1&query=${prop.toa_do || formatJapaneseAddress(prop)}" 
                           target="_blank" class="map-external-link">
                            <i class="fas fa-external-link-alt"></i> Open Google Maps
                        </a>
                    </div>
                </div>
            </div>

            <div class="detail-sidebar">
                <div class="contact-card">
                    <h3>${dict.contact[currentLang]}</h3>
                    <input type="text" class="contact-input" placeholder="${dict.name[currentLang]}">
                    <input type="email" class="contact-input" placeholder="Email">
                    <textarea class="contact-input" rows="4" placeholder="Message..."></textarea>
                    <button class="btn-search" style="width: 100%; justify-content: center; height: 50px;" onclick="alert('Inquiry sent successfully!')">${dict.send[currentLang]}</button>
                    <div style="margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                        <div style="font-size: 12px; opacity: 0.6; margin-bottom: 5px;">Hotline</div>
                        <div style="font-size: 1.2rem; font-weight: 700;">${configData.footer_data.contact.tel}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Khởi tạo bản đồ sau khi HTML đã được render
    setTimeout(() => initPropertyMap(prop), 100);
};

function initPropertyMap(prop) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Tọa độ mặc định (Tokyo) nếu không có dữ liệu
    let lat = 35.6895;
    let lng = 139.6917;

    if (prop.toa_do && prop.toa_do.includes(',')) {
        const parts = prop.toa_do.split(',');
        lat = parseFloat(parts[0].trim());
        lng = parseFloat(parts[1].trim());
    }

    // Xóa map cũ nếu đã tồn tại (tránh lỗi re-init)
    if (window.propertyMap) {
        window.propertyMap.remove();
    }

    // Khởi tạo bản đồ Leaflet
    window.propertyMap = L.map('map').setView([lat, lng], 16);

    // Sử dụng lớp bản đồ từ OpenStreetMap (Miễn phí)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(window.propertyMap);

    // Thêm Marker (điểm đánh dấu)
    const name = (prop.ten_bds && typeof prop.ten_bds === 'object') ? prop.ten_bds[currentLang] : prop.ten_bds;
    L.marker([lat, lng]).addTo(window.propertyMap)
        .bindPopup(`<b>${name}</b><br>${formatJapaneseAddress(prop)}`)
        .openPopup();
}

window.openLightbox = function(index) {
    currentLightboxIndex = index;
    currentScale = 1;
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    
    applyZoom();
    img.src = currentPropertyImages[index];
    caption.textContent = `${index + 1} / ${currentPropertyImages.length}`;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
};

window.closeLightbox = function() {
    document.getElementById('lightbox-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentScale = 1;
};

window.changeLightboxImage = function(step) {
    currentLightboxIndex += step;
    if (currentLightboxIndex < 0) currentLightboxIndex = currentPropertyImages.length - 1;
    if (currentLightboxIndex >= currentPropertyImages.length) currentLightboxIndex = 0;
    
    currentScale = 1;
    applyZoom();
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    img.src = currentPropertyImages[currentLightboxIndex];
    caption.textContent = `${currentLightboxIndex + 1} / ${currentPropertyImages.length}`;
};

window.closePropertyDetail = function() {
    currentViewedPropertyId = null;
    document.getElementById('hero-section').style.display = 'flex'; // Show hero
    document.getElementById('main-content-wrapper').style.display = 'flex'; // Show the entire main content wrapper
    document.getElementById('property-detail-view').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function renderFooter() {
    const footer = document.getElementById("main-footer");
    if (!footer || !configData || !configData.footer_data) return;

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

window.showLoginModal = function() {
    const modalContainer = document.getElementById("modal-container");
    const lang = configData.admin_window;
    const common = lang.chung;
    const login = lang.dang_nhap;

    modalContainer.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-user-lock"></i> ${login.tieu_de[currentLang]}</h2>
            </div>
            <div class="modal-body">
                <div class="modal-input-group">
                    <label>${login.tai_khoan[currentLang]}</label>
                    <input type="text" id="admin-user" placeholder="...">
                </div>
                <div class="modal-input-group">
                    <label>${login.mat_khau[currentLang]}</label>
                    <input type="password" id="admin-pass" placeholder="••••••••">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-modal-secondary" onclick="closeModal()">${common.nut_huy[currentLang]}</button>
                <button class="btn-modal btn-modal-primary" onclick="handleLoginSubmit()">${login.nut_gui[currentLang]}</button>
            </div>
        </div>
    `;
    modalContainer.style.display = 'flex';
};

window.showChangePasswordModal = function() {
    const modalContainer = document.getElementById("modal-container");
    const lang = configData.admin_window;
    const common = lang.chung;
    const cp = lang.doi_mat_khau;

    modalContainer.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-key"></i> ${cp.tieu_de[currentLang]}</h2>
            </div>
            <div class="modal-body">
                <div class="modal-input-group">
                    <label>${cp.mat_khau_cu[currentLang]}</label>
                    <input type="password" id="old-pass">
                </div>
                <div class="modal-input-group">
                    <label>${cp.mat_khau_moi[currentLang]}</label>
                    <input type="password" id="new-pass">
                </div>
                <div class="modal-input-group">
                    <label>${cp.xac_nhan[currentLang]}</label>
                    <input type="password" id="confirm-pass">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-modal-secondary" onclick="closeModal()">${common.nut_huy[currentLang]}</button>
                <button class="btn-modal btn-modal-primary" onclick="handleChangePasswordSubmit()">${cp.nut_gui[currentLang]}</button>
            </div>
        </div>
    `;
    modalContainer.style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById("modal-container").style.display = 'none';
};

window.handleLoginSubmit = async function() {
    const user = document.getElementById("admin-user").value;
    const pass = document.getElementById("admin-pass").value;
    const common = configData.admin_window.chung;

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/admin-dashboard';
        } else {
            alert(common.thong_bao_sai[currentLang]);
        }
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
    }
};

window.handleChangePasswordSubmit = async function() {
    const oldPass = document.getElementById("old-pass").value;
    const newPass = document.getElementById("new-pass").value;
    const confirmPass = document.getElementById("confirm-pass").value;
    const common = configData.admin_window.chung;

    if (newPass !== confirmPass) {
        alert(currentLang === 'VI' ? "Mật khẩu xác nhận không khớp!" : "Password confirmation does not match!");
        return;
    }

    try {
        const response = await fetch('/api/admin/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_pass: oldPass, new_pass: newPass })
        });
        const data = await response.json();
        if (data.success) {
            alert(common.thong_bao_dung[currentLang]);
            closeModal();
        } else {
            alert(data.message || common.thong_bao_sai[currentLang]);
        }
    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
    }
};

// Đóng modal khi nhấn ra ngoài vùng content
window.onclick = function(event) {
    const modal = document.getElementById("modal-container");
    if (event.target == modal) {
        closeModal();
    }
};

document.addEventListener("DOMContentLoaded", initApp);