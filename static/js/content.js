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

async function initApp() {
    try {
        const response = await fetch('/api/config');
        configData = await response.json();
        currentLang = configData.ngon_ngu_mac_dinh;
        
        // Khôi phục trạng thái tìm kiếm từ sessionStorage nếu có
        const savedSearch = sessionStorage.getItem('searchState');
        if (savedSearch) searchState = JSON.parse(savedSearch);
        
        // Khôi phục trạng thái chọn Thuê/Mua từ sessionStorage
        const savedPropertyType = sessionStorage.getItem('selectedPropertyType');
        if (savedPropertyType) selectedPropertyType = savedPropertyType;

        renderNavbar();
        renderHero();
        refreshMainUI();
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
            <a href="javascript:void(0)" id="nav-rent" onclick="selectPropertyType('Rent')" class="${selectedPropertyType === 'Rent' ? 'active-property-type' : ''}"><i class="fa-solid fa-key"></i> ${info.thue[currentLang]}</a>
            <a href="javascript:void(0)" id="nav-buy" onclick="selectPropertyType('Buy')" class="${selectedPropertyType === 'Buy' ? 'active-property-type' : ''}"><i class="fa-solid fa-house-chimney"></i> ${info.mua[currentLang]}</a>
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
                    <a href="#"><i class="fas fa-sign-in-alt"></i> ${admin.dang_nhap[currentLang]}</a>
                    <a href="#"><i class="fas fa-lock"></i> ${admin.doi_mat_khau[currentLang]}</a>
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
    
    console.log("Giá trị lọc hiện tại:", searchState);
    alert(currentLang === 'VI' ? "Đã lưu bộ lọc!" : "Search criteria saved!");
};

window.selectPropertyType = function(type) {
    selectedPropertyType = (selectedPropertyType === type) ? '' : type; // Toggle selection
    sessionStorage.setItem('selectedPropertyType', selectedPropertyType); // Lưu trạng thái
    renderNavbar(); // Cập nhật lại navbar để hiển thị trạng thái active
    console.log("Loại bất động sản được chọn:", selectedPropertyType);
};

function refreshMainUI() {
    renderSlogan();
    renderFilters();
    renderProperties();
}

function renderSlogan() {
    const container = document.getElementById("slogan-container");
    if (!container || !configData) return;

    const sloganType = selectedPropertyType === 'Buy' ? 'slogan_mua' : 'slogan_thue';
    const text = configData.slogan[sloganType][currentLang];

    container.innerHTML = `
        <div class="slogan-text">${text}</div> 
        <img src="${configData.path_avatar}" class="avatar-3d" alt="3D Avatar">
    `;
}

function renderFilters() {
    const container = document.getElementById("filter-options");
    if (!container || !configData) return;

    const options = configData.cac_lua_chon;
    container.innerHTML = Object.keys(options).map(key => `
        <div class="filter-tag ${currentFilters.includes(key) ? 'active' : ''}" 
             onclick="toggleFilter('${key}')">
            ${options[key][currentLang]}
        </div>
    `).join('');
}

window.toggleFilter = function(key) {
    if (key === 'tim_kiem_tat_ca') {
        currentFilters = ['tim_kiem_tat_ca'];
    } else {
        // Nếu chọn cái khác, bỏ 'tim_kiem_tat_ca'
        currentFilters = currentFilters.filter(f => f !== 'tim_kiem_tat_ca');
        
        if (currentFilters.includes(key)) {
            currentFilters = currentFilters.filter(f => f !== key);
        } else {
            currentFilters.push(key);
        }
        
        // Nếu không còn cái nào được chọn, tự động quay về 'tim_kiem_tat_ca'
        if (currentFilters.length === 0) currentFilters = ['tim_kiem_tat_ca'];
    }
    currentPage = 1;
    renderFilters();
    renderProperties();
};

function renderProperties() {
    const container = document.getElementById("property-list");
    const paginationContainer = document.getElementById("pagination");
    if (!container || !configData) return;

    // Tạo dữ liệu mẫu lớn hơn để test phân trang
    const totalItems = 20;
    const allProperties = Array.from({ length: totalItems }, (_, i) => ({
        id: i + 1,
        price: (Math.floor(Math.random() * 200) + 50) + ",000",
        title: `Property ${i + 1} - ${selectedPropertyType || 'All'}`,
        loc: configData.danh_sach_dia_chi_lua_chon[i % 3],
        img: `https://images.unsplash.com/photo-${1560448204 + i}-e02f11c3d0e2?w=500`
    }));

    const itemsPerPage = 6;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = allProperties.slice(startIndex, startIndex + itemsPerPage);

    container.innerHTML = paginatedItems.map(p => `
        <div class="property-card">
            <img src="${p.img}" class="property-img" alt="property">
            <div class="property-info">
                <div class="property-price">${p.price} <small>JPY</small></div>
                <div class="property-title">${p.title}</div>
                <div class="property-location"><i class="fa-solid fa-location-dot"></i> ${p.loc}</div>
            </div>
        </div>
    `).join('');

    // Render Pagination
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
        <div class="page-btn ${page === currentPage ? 'active' : ''}" 
             onclick="changePage(${page})">
            ${page}
        </div>
    `).join('');
}

window.changePage = function(page) {
    currentPage = page;
    renderProperties();
    window.scrollTo({ top: document.querySelector('.main-content-wrapper').offsetTop - 100, behavior: 'smooth' });
};

function getLangLabel(code) {
    const labels = { 'VI': 'Việt', 'EN': 'English', 'JP': '日本語' };
    return labels[code] || code;
}

window.changeLang = function(lang) {
    currentLang = lang;
    renderNavbar();
    renderHero();
    refreshMainUI();
};

document.addEventListener("DOMContentLoaded", initApp);