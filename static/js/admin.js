let configData = null;
let currentLang = 'EN';
let isEditing = false;
let currentSection = 'add'; // 'add', 'list', 'blog', 'blog-list'
let uploadedImages = [];
let originalImages = []; // Lưu danh sách ảnh gốc khi bắt đầu sửa
let editingBlogId = null;

async function initAdmin() {
    try {
        const response = await fetch('/api/config');
        configData = await response.json();
        
        // Ưu tiên ngôn ngữ đã chọn trước đó (nếu có)
        const savedLang = sessionStorage.getItem('adminLang');
        currentLang = savedLang || configData.ngon_ngu_mac_dinh;
        
        refreshAdminUI();
    } catch (error) {
        console.error("Lỗi khi tải cấu hình:", error);
    }
}

function refreshAdminUI() {
    updateStaticLabels();
    renderForm();
    renderPropertyList();
}

window.showSection = function(section) {
    currentSection = section;
    document.getElementById('section-form').style.display = (section === 'add' || section === 'blog') ? 'block' : 'none';
    document.getElementById('section-list').style.display = section === 'list' ? 'block' : 'none';
    document.getElementById('section-blog-list').style.display = section === 'blog-list' ? 'block' : 'none';
    
    document.getElementById('nav-add').classList.toggle('active', section === 'add');
    document.getElementById('nav-list').classList.toggle('active', section === 'list');
    document.getElementById('nav-blog').classList.toggle('active', section === 'blog');
    document.getElementById('nav-blog-list').classList.toggle('active', section === 'blog-list');
    
    if (!isEditing) {
        if (section === 'add') {
            resetForm();
        } else if (section === 'blog') {
            editingBlogId = null;
            uploadedImages = [];
            renderForm();
        }
    }

    renderForm(); 
    if (section === 'list') renderPropertyList();
    if (section === 'blog-list') renderBlogList();
    
    updateHeaderTitle();
}

function updateHeaderTitle() {
    const labels = configData.admin_dashboard_labels.header;
    const isListVisible = document.getElementById('section-list').style.display === 'block';
    const isBlogListVisible = document.getElementById('section-blog-list').style.display === 'block';
    const headerEl = document.getElementById('label-header-title');
    
    if (isListVisible) {
        headerEl.textContent = labels.tieu_de_danh_sach[currentLang];
    } else if (isBlogListVisible) {
        headerEl.textContent = labels.tieu_de_ds_blog[currentLang];
    } else if (currentSection === 'blog') {
        headerEl.textContent = labels.tieu_de_blog[currentLang];
    } else {
        headerEl.textContent = isEditing ? labels.tieu_de_chinh_sua[currentLang] : labels.tieu_de_dang_tin[currentLang];
    }
}

function updateStaticLabels() {
    const labels = configData.admin_dashboard_labels;
    
    // Cập nhật Sidebar
    document.getElementById('label-cms-title').textContent = labels.sidebar.cms_title[currentLang];
    document.getElementById('label-them-bds').textContent = labels.sidebar.them_bds[currentLang];
    document.getElementById('label-danh-sach').textContent = labels.sidebar.danh_sach[currentLang];
    document.getElementById('label-quan-ly-blog').textContent = labels.sidebar.quan_ly_blog[currentLang];
    document.getElementById('label-ds-blog').textContent = labels.sidebar.danh_sach_blog[currentLang];
    document.getElementById('label-them-blog').textContent = labels.sidebar.them_blog[currentLang];

    document.getElementById('label-quay-lai').textContent = labels.sidebar.quay_lai[currentLang];
    
    // Cập nhật Header
    updateHeaderTitle();
    document.getElementById('label-admin-user').textContent = labels.header.nguoi_dung[currentLang];
    
    // Cập nhật Placeholder tìm kiếm
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) searchInput.placeholder = configData.thong_tin_danh_sach_BDS.placeholder_tim_kiem[currentLang];

    // Cập nhật Nút
    document.getElementById('btn-reset').textContent = labels.buttons.lam_moi[currentLang];
    document.getElementById('btn-save').textContent = labels.buttons.luu[currentLang];
    
    // Cập nhật nhãn hiển thị trên nút chọn ngôn ngữ
    const langNames = { 'VI': 'Tiếng Việt', 'EN': 'English', 'JP': '日本語' };
    document.getElementById('admin-lang-btn').innerHTML = `<i class="fas fa-globe"></i> ${langNames[currentLang]} <i class="fas fa-chevron-down"></i>`;
}

function renderForm() {
    const container = document.getElementById('property-form-container');
    const formConfig = currentSection === 'blog' ? configData.thong_tin_blog_form : configData.thong_tin_bds_form;
    
    if (!formConfig) return;
    let html = '';

    for (const key in formConfig) {
        const field = formConfig[key];
        // Mã BĐS, Tên, Địa chỉ, Ga tàu và Mô tả sẽ chiếm trọn dòng để dễ nhập liệu
        const isFullWidth = ['ma_bds', 'ten_bds', 'dia_chi', 'ga_tau_gan', 'mo_ta', 'anh_bds', 'title', 'desc', 'content', 'image_url'].includes(key);
        const colClass = isFullWidth ? 'full-width' : '';

        html += `<div class="admin-input-group ${colClass}">`;

        // Nếu là trường đa ngôn ngữ (có VI, EN, JP trực tiếp)
        if (field.VI && field.EN && field.JP && !field.label) {
            html += `<label>${field[currentLang]}</label><div class="lang-inputs">`;
            ['VI', 'EN', 'JP'].forEach(lang => {
                if (key === 'mo_ta' || key === 'content') {
                    html += `<div class="lang-field"><span class="lang-badge">${lang}</span><textarea class="admin-input" id="${key}_${lang}" rows="4" placeholder="..."></textarea></div>`;
                } else {
                    html += `<div class="lang-field"><span class="lang-badge">${lang}</span><input type="text" class="admin-input" id="${key}_${lang}" placeholder="..."></div>`;
                }
            });
            html += `</div>`;
        } 
        // Nếu là trường Select (như phân loại)
        else if (field.options) {
            const isBinary = field.options.yes && field.options.no && key !== 'category_key';
            html += `<label>${field.label[currentLang]}</label>`;
            
            if (isBinary) {
                html += `<label class="switch"><input type="checkbox" id="${key}"><span class="slider round"></span></label>`;
            } else {
                html += `<select class="admin-input" id="${key}">`;
                for (const optKey in field.options) {
                    html += `<option value="${optKey}">${field.options[optKey][currentLang]}</option>`;
                }
                html += `</select>`;
            }
        }
        // Nếu là trường Ảnh
        else if (key === 'anh_bds' || key === 'image_url') {
            html += `
                <label>${field.label[currentLang]}</label>
                <div class="image-upload-wrapper">
                    <div id="image-preview-container" class="image-preview-grid"></div>
                    <label class="image-upload-btn">
                        <input type="file" multiple accept="image/*" onchange="handleImageUpload(event)" style="display:none">
                        <i class="fas fa-cloud-upload-alt"></i> ${currentLang === 'VI' ? 'Tải ảnh lên' : 'Upload Images'}
                    </label>
                </div>`;
        }
        // Các trường đơn lẻ khác
        else {
            const labelText = field.label ? field.label[currentLang] : (field[currentLang] || key);
            html += `<label>${labelText}</label>`;
            const inputType = (key.includes('gia') || key.includes('tien') || key.includes('so_') || key === 'dien_tich') ? 'number' : 'text';
            const minAttr = inputType === 'number' ? 'min="0"' : '';
            html += `<input type="${inputType}" ${minAttr} class="admin-input" id="${key}" placeholder="...">`;
        }
        html += `</div>`;
    }
    container.innerHTML = html;
    renderImagePreviews();
}

window.handleImageUpload = async function(event) {
    const files = event.target.files;
    for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success && result.url) {
            if (currentSection === 'blog') {
                uploadedImages = [String(result.url)]; // Blog chỉ có 1 ảnh bìa
            } else {
                uploadedImages.push(String(result.url));
            }
                renderImagePreviews();
            }
        } catch (e) { console.error("Upload error:", e); }
    }
}

function renderImagePreviews() {
    const container = document.getElementById('image-preview-container');
    if (!container) return;
    container.innerHTML = uploadedImages.map((url, index) => `
        <div class="image-preview-item">
            <img src="${url}">
            <button class="remove-img-btn" onclick="removeImage(${index})"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

window.removeImage = async function(index) {
    const urlToRemove = uploadedImages[index];
    
    // Nếu ảnh bị xóa KHÔNG nằm trong danh sách gốc (tức là ảnh vừa mới upload)
    // thì xóa vật lý ngay lập tức để tránh rác bộ nhớ
    if (!originalImages.includes(urlToRemove)) {
        try {
            await fetch('/api/admin/delete-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlToRemove })
            });
        } catch (e) { console.error("Lỗi xóa file tạm:", e); }
    }

    uploadedImages.splice(index, 1);
    renderImagePreviews();
}

window.changeAdminLang = function(lang) {
    currentLang = lang;
    sessionStorage.setItem('adminLang', lang); // Lưu lại lựa chọn
    refreshAdminUI();
}

window.renderPropertyList = function() {
    const container = document.getElementById('property-table-container');
    const searchVal = document.getElementById('admin-search-input')?.value.toLowerCase() || '';
    const properties = configData.danh_sach_bds;
    const headers = configData.thong_tin_danh_sach_BDS;
    
    let filtered = properties;
    if (searchVal) {
        filtered = properties.filter(p => p.ma_bds.toLowerCase().includes(searchVal));
    }

    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>${headers.ma_bds[currentLang]}</th>
                    <th>${headers.ten_bds[currentLang]}</th>
                    <th>${headers.dia_chi[currentLang]}</th>
                    <th>${headers.gia[currentLang]}</th>
                    <th>${headers.thao_tac[currentLang]}</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtered.forEach(p => {
        const langKey = currentLang.toLowerCase();
        const name = p[`ten_bds_${langKey}`] || '';
        const prefecture = p[`tinh_thanh_${langKey}`] || '';
        const ward = p[`quan_huyen_${langKey}`] || '';
        const fullAddr = `${prefecture} ${ward}`;

        html += `
            <tr>
                <td style="font-weight: 700; color: var(--primary-color);">${p.ma_bds}</td>
                <td>${name}</td>
                <td>${fullAddr}</td>
                <td>${parseInt(p.gia_jpy || 0).toLocaleString()}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-action edit" onclick="editProperty('${p.ma_bds}')" title="Sửa"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" onclick="deleteProperty('${p.ma_bds}')" title="Xóa"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    if (filtered.length === 0) html = '<div style="text-align: center; padding: 40px; color: var(--text-sub);">Không tìm thấy tin đăng nào.</div>';
    container.innerHTML = html;
}

window.renderBlogList = async function() {
    const container = document.getElementById('blog-table-container');
    const searchVal = document.getElementById('blog-search-input')?.value.toLowerCase() || '';
    
    const response = await fetch('/api/blog-posts?category=tat_ca');
    const blogs = await response.json();
    
    let filtered = blogs;
    if (searchVal) {
        filtered = blogs.filter(b => 
            (b.title_vi && b.title_vi.toLowerCase().includes(searchVal)) ||
            (b.title_en && b.title_en.toLowerCase().includes(searchVal)) ||
            (b.title_jp && b.title_jp.toLowerCase().includes(searchVal))
        );
    }

    const dict = {
        title: { VI: "Tiêu đề", EN: "Title", JP: "タイトル" },
        cat: { VI: "Chuyên mục", EN: "Category", JP: "カテゴリー" },
        date: { VI: "Ngày tạo", EN: "Created At", JP: "作成日" },
        actions: { VI: "Thao tác", EN: "Actions", JP: "操作" }
    };

    let html = `<table class="admin-table"><thead><tr>
                    <th>${dict.title[currentLang]}</th>
                    <th>${dict.cat[currentLang]}</th>
                    <th>${dict.date[currentLang]}</th>
                    <th>${dict.actions[currentLang]}</th>
                </tr></thead><tbody>`;

    filtered.forEach(b => {
        const title = b['title_' + currentLang.toLowerCase()] || '';
        const cat = configData.blog_categories[b.category_key]?.[currentLang] || b.category_key;
        const date = new Date(b.created_at).toLocaleDateString();
        html += `<tr>
                <td style="font-weight: 700;">${title}</td>
                <td><span class="lang-badge">${cat}</span></td>
                <td>${date}</td>
                <td><div style="display: flex; gap: 8px;">
                    <button class="btn-action edit" onclick="editBlog(${b.id})" title="Sửa"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" onclick="deleteBlog(${b.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`;
    });
    html += `</tbody></table>`;
    if (filtered.length === 0) html = '<div style="text-align: center; padding: 40px; color: var(--text-sub);">Không tìm thấy bài viết nào.</div>';
    container.innerHTML = html;
}

window.editBlog = async function(id) {
    const response = await fetch('/api/blog-posts?category=tat_ca');
    const blogs = await response.json();
    const blog = blogs.find(b => b.id === id);
    if (!blog) return;

    isEditing = true;
    editingBlogId = id;
    showSection('blog');
    
    uploadedImages = blog.image_url ? [blog.image_url] : [];
    originalImages = [...uploadedImages];

    const formConfig = configData.thong_tin_blog_form;
    for (const key in formConfig) {
        if (key === 'image_url') continue;
        if (['title', 'desc', 'content'].includes(key)) {
            if (document.getElementById(`${key}_VI`)) document.getElementById(`${key}_VI`).value = blog[`${key}_vi`] || '';
            if (document.getElementById(`${key}_EN`)) document.getElementById(`${key}_EN`).value = blog[`${key}_en`] || '';
            if (document.getElementById(`${key}_JP`)) document.getElementById(`${key}_JP`).value = blog[`${key}_jp`] || '';
        } else {
            const el = document.getElementById(key);
            if (el) el.value = blog[key] || '';
        }
    }
    renderImagePreviews();
}

window.deleteProperty = async function(ma_bds) {
    if (!confirm(currentLang === 'VI' ? `Bạn có chắc chắn muốn xóa tin ${ma_bds}?` : `Delete property ${ma_bds}?`)) return;

    try {
        const response = await fetch('/api/admin/delete-property', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ma_bds: ma_bds })
        });
        const result = await response.json();
        if (result.success) {
            // Cập nhật lại list trong bộ nhớ local để không phải reload trang
            configData.danh_sach_bds = configData.danh_sach_bds.filter(p => p.ma_bds !== ma_bds);
            renderPropertyList();
        }
    } catch (e) { console.error(e); }
}

window.deleteBlog = async function(id) {
    if (!confirm(currentLang === 'VI' ? `Bạn có chắc chắn muốn xóa bài viết này?` : `Delete this blog post?`)) return;

    try {
        const response = await fetch('/api/admin/delete-blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();
        if (result.success) {
            renderBlogList();
        }
    } catch (e) { console.error(e); }
}

window.editProperty = function(ma_bds) {
    const prop = configData.danh_sach_bds.find(p => p.ma_bds === ma_bds);
    if (!prop) return;

    isEditing = true;
    showSection('add');
    uploadedImages = prop.anh_bds || [];
    originalImages = [...uploadedImages]; // Copy danh sách ảnh gốc

    updateHeaderTitle();

    const formConfig = configData.thong_tin_bds_form;
    for (const key in formConfig) {
        if (key === 'anh_bds') continue; // Bỏ qua vì ảnh được xử lý qua biến uploadedImages

        const field = formConfig[key];
        if (field.VI && field.EN && field.JP && !field.label) {
            if (document.getElementById(`${key}_VI`)) document.getElementById(`${key}_VI`).value = prop[`${key}_vi`] || '';
            if (document.getElementById(`${key}_EN`)) document.getElementById(`${key}_EN`).value = prop[`${key}_en`] || '';
            if (document.getElementById(`${key}_JP`)) document.getElementById(`${key}_JP`).value = prop[`${key}_jp`] || '';
        } else {
            const el = document.getElementById(key);
            if (el) {
                if (el.type === 'checkbox') el.checked = prop[key] === 'yes';
                else el.value = prop[key] || '';
            }
        }
    }
    renderImagePreviews();
    // Disable việc sửa mã BĐS khi đang edit
    document.getElementById('ma_bds').disabled = true;
    document.getElementById('ma_bds').style.opacity = '0.6';
}

window.resetForm = function() {
    isEditing = false;
    editingBlogId = null;
    uploadedImages = [];
    originalImages = [];
    location.reload();
}

window.saveProperty = async function() {
    const formConfig = currentSection === 'blog' ? configData.thong_tin_blog_form : configData.thong_tin_bds_form;
    const propertyData = {};

    if (currentSection === 'blog' && editingBlogId) propertyData['id'] = editingBlogId;

    for (const key in formConfig) {
        if (key === 'anh_bds' || key === 'image_url') continue;

        const field = formConfig[key];
        
        // Nếu là trường đa ngôn ngữ (VI, EN, JP)
        if (field.VI && field.EN && field.JP && !field.label) {
            propertyData[`${key}_vi`] = document.getElementById(`${key}_VI`)?.value || '';
            propertyData[`${key}_en`] = document.getElementById(`${key}_EN`)?.value || '';
            propertyData[`${key}_jp`] = document.getElementById(`${key}_JP`)?.value || '';
        } 
        // Nếu là trường đơn (ID, Giá, Diện tích, Select, Checkbox...)
        else {
            const el = document.getElementById(key);
            if (el) {
                if (el.type === 'checkbox') {
                    propertyData[key] = el.checked ? 'yes' : 'no';
                } else {
                    // Chuyển đổi sang số hoặc null cho các trường số để tránh lỗi DB (PostgreSQL 22P02)
                    const numericFields = ['dien_tich', 'so_phong_ngu', 'so_tang', 'gia_jpy', 'tien_thue_thang', 'gia_usd', 'gia_vnd', 'phi_quan_ly'];
                    const val = el.value.trim();
                    // Nếu là trường số và bỏ trống, gửi null thay vì chuỗi rỗng "" để DB chấp nhận
                    propertyData[key] = (numericFields.includes(key)) ? (val === "" ? null : parseFloat(val)) : val;
                }
            }
        }
    }

    if (currentSection === 'blog') {
        propertyData['image_url'] = uploadedImages[0] || '';
    } else {
        propertyData['anh_bds'] = uploadedImages;
    }

    // Helper function to format string to Title Case
    const formatTitleCase = (str) => {
        if (!str) return '';
        return str.trim().toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Apply Title Case formatting to each language version of tinh_thanh and quan_huyen
    for (const key of ['tinh_thanh', 'quan_huyen']) {
        for (const lang of ['vi', 'en', 'jp']) {
            const flatKey = `${key}_${lang}`;
            if (propertyData[flatKey]) {
                propertyData[flatKey] = formatTitleCase(propertyData[flatKey]);
            }
        }
    }

    // Kiểm tra giá trị âm cho các trường số (nếu có nhập)
    const numericFields = ['dien_tich', 'so_phong_ngu', 'so_tang', 'gia_jpy', 'tien_thue_thang', 'gia_usd', 'gia_vnd', 'phi_quan_ly'];
    for (const key of numericFields) {
        if (propertyData[key] && parseFloat(propertyData[key]) < 0) {
            alert(configData.admin_window.chung.loi_gia_tri_am[currentLang]);
            return;
        }
    }

    let url = isEditing ? '/api/admin/update-property' : '/api/admin/add-property';
    if (currentSection === 'blog') {
        url = editingBlogId ? '/api/admin/update-blog' : '/api/admin/add-blog';
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(propertyData)
        });
        const result = await response.json();
        if (result.success) {
            alert(configData.admin_window.chung.thong_bao_dung[currentLang]);
            location.reload(); // Tải lại để làm trống form
        } else if (result.message === "EXISTED") {
            alert(configData.admin_window.chung.loi_trung_ma[currentLang]);
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi khi lưu:", error);
    }
}

document.addEventListener('DOMContentLoaded', initAdmin);