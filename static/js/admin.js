let configData = null;
let currentLang = 'EN';
let isEditing = false;
let uploadedImages = [];
let originalImages = []; // Lưu danh sách ảnh gốc khi bắt đầu sửa

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
    document.getElementById('section-form').style.display = section === 'add' ? 'block' : 'none';
    document.getElementById('section-list').style.display = section === 'list' ? 'block' : 'none';
    
    document.getElementById('nav-add').classList.toggle('active', section === 'add');
    document.getElementById('nav-list').classList.toggle('active', section === 'list');
    
    if (section === 'list') {
        renderPropertyList();
    } else if (section === 'add' && !isEditing) {
        resetForm();
    }
    updateHeaderTitle();
}

function updateHeaderTitle() {
    const labels = configData.admin_dashboard_labels.header;
    const isListVisible = document.getElementById('section-list').style.display === 'block';
    const headerEl = document.getElementById('label-header-title');
    
    if (isListVisible) {
        headerEl.textContent = labels.tieu_de_danh_sach[currentLang];
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
    const formConfig = configData.thong_tin_bds_form;
    let html = '';

    for (const key in formConfig) {
        const field = formConfig[key];
        // Mã BĐS, Tên, Địa chỉ và Ga tàu sẽ chiếm trọn dòng để dễ nhập liệu
        const isFullWidth = ['ma_bds', 'ten_bds', 'dia_chi', 'ga_tau_gan', 'anh_bds'].includes(key);
        const colClass = isFullWidth ? 'full-width' : '';

        html += `<div class="admin-input-group ${colClass}">`;

        // Nếu là trường đa ngôn ngữ (có VI, EN, JP trực tiếp)
        if (field.VI && field.EN && field.JP && !field.label) {
            html += `<label>${field[currentLang]}</label><div class="lang-inputs">`;
            ['VI', 'EN', 'JP'].forEach(lang => {
                html += `<div class="lang-field"><span class="lang-badge">${lang}</span><input type="text" class="admin-input" id="${key}_${lang}" placeholder="..."></div>`;
            });
            html += `</div>`;
        } 
        // Nếu là trường Select (như phân loại)
        else if (field.options) {
            html += `<label>${field.label[currentLang]}</label><select class="admin-input" id="${key}">`;
            for (const optKey in field.options) {
                html += `<option value="${optKey}">${field.options[optKey][currentLang]}</option>`;
            }
            html += `</select>`;
        }
        // Nếu là trường Ảnh
        else if (key === 'anh_bds') {
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
            if (result.success) {
                uploadedImages.push(result.url);
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
        // Đảm bảo lấy đúng ngôn ngữ cho dữ liệu từng hàng
        const name = (p.ten_bds && typeof p.ten_bds === 'object') ? p.ten_bds[currentLang] : (p.ten_bds || '');
        const addr = (p.dia_chi && typeof p.dia_chi === 'object') ? p.dia_chi[currentLang] : (p.dia_chi || '');

        html += `
            <tr>
                <td style="font-weight: 700; color: var(--primary-color);">${p.ma_bds}</td>
                <td>${name}</td>
                <td>${addr}</td>
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
            if (document.getElementById(`${key}_VI`)) document.getElementById(`${key}_VI`).value = prop[key]?.VI || '';
            if (document.getElementById(`${key}_EN`)) document.getElementById(`${key}_EN`).value = prop[key]?.EN || '';
            if (document.getElementById(`${key}_JP`)) document.getElementById(`${key}_JP`).value = prop[key]?.JP || '';
        } else {
            const el = document.getElementById(key);
            if (el) el.value = prop[key] || '';
        }
    }
    renderImagePreviews();
    // Disable việc sửa mã BĐS khi đang edit
    document.getElementById('ma_bds').disabled = true;
    document.getElementById('ma_bds').style.opacity = '0.6';
}

window.resetForm = function() {
    isEditing = false;
    uploadedImages = [];
    originalImages = [];
    location.reload();
}

window.saveProperty = async function() {
    const formConfig = configData.thong_tin_bds_form;
    const propertyData = {};
    for (const key in formConfig) {
        if (key === 'anh_bds') continue; // Bỏ qua trường ảnh vì được xử lý riêng bên dưới

        const field = formConfig[key];
        
        // Nếu là trường đa ngôn ngữ (VI, EN, JP)
        if (field.VI && field.EN && field.JP && !field.label) {
            propertyData[key] = {
                VI: document.getElementById(`${key}_VI`)?.value || '',
                EN: document.getElementById(`${key}_EN`)?.value || '',
                JP: document.getElementById(`${key}_JP`)?.value || ''
            };
        } 
        // Nếu là trường đơn (ID, Giá, Diện tích, Select...)
        else {
            const el = document.getElementById(key);
            if (el) propertyData[key] = el.value;
        }
    }
    // Thêm danh sách ảnh vào dữ liệu
    propertyData['anh_bds'] = uploadedImages;

    // Kiểm tra giá trị âm cho các trường số (nếu có nhập)
    const numericFields = ['dien_tich', 'so_phong_ngu', 'so_tang', 'gia_jpy', 'tien_thue_thang', 'gia_usd', 'gia_vnd', 'phi_quan_ly'];
    for (const key of numericFields) {
        if (propertyData[key] && parseFloat(propertyData[key]) < 0) {
            alert(configData.admin_window.chung.loi_gia_tri_am[currentLang]);
            return;
        }
    }

    const url = isEditing ? '/api/admin/update-property' : '/api/admin/add-property';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(isEditing ? propertyData : propertyData)
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