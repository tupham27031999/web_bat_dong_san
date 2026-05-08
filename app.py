from flask import Flask, render_template, jsonify, request
from config import Config, supabase
import sys
import config as cfg
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Vô hiệu hóa việc tự động sắp xếp các phím JSON theo bảng chữ cái
# Điều này giúp giữ nguyên thứ tự các trường như đã định nghĩa trong config.py
app.json.sort_keys = False

UPLOAD_FOLDER = os.path.join(cfg.PATH_PHAN_MEM, 'static/uploads/properties')
try:
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
except Exception as e:
    print(f"Warning: Could not create upload folder: {e}", file=sys.stderr)

def delete_cloud_images(image_list):
    """Xóa các file ảnh khỏi Supabase Storage."""
    if not image_list:
        return
    # Trích xuất tên file từ URL Supabase
    paths = []
    for url in image_list:
        if 'storage/v1/object/public/properties/' in url:
            # Lấy phần tên file sau /properties/ và loại bỏ các tham số query nếu có
            filename = url.split('/public/properties/')[-1].split('?')[0]
            paths.append(filename)
    
    if paths:
        try:
            supabase.storage.from_('properties').remove(paths)
        except Exception as e:
            print(f"Lỗi khi xóa ảnh trên Cloud: {e}")

@app.route('/')
def index():
    return render_template('index.html')

# Route để web gọi lấy thông tin khi cần
@app.route('/api/config')
def get_config():
    # Lấy dữ liệu mới nhất từ Supabase (dạng cột phẳng)
    try:
        response = supabase.table('properties').select("*").execute()
        Config.danh_sach_bds = response.data
    except Exception as e:
        print(f"Error fetching properties: {e}", file=sys.stderr)
        # Giữ lại dữ liệu cũ hoặc danh sách trống thay vì crash

    all_wards = []
    for p in Config.danh_sach_bds:
        ward_en = p.get('quan_huyen_en')
        if ward_en:
            all_wards.append(str(ward_en))
    unique_wards = sorted(list(set(all_wards)))

    config_data = {
        "ngon_ngu_mac_dinh": Config.ngon_ngu_mac_dinh,
        "thong_tin_tieu_de": Config.thong_tin_tieu_de.copy(),
        "lua_chon_admin": Config.lua_chon_admin,
        "thanh_tim_kiem": Config.thanh_tim_kiem,
        "danh_sach_dia_chi_lua_chon": unique_wards,
        "slogan": Config.slogan,
        "slogan_tim_kiem": Config.slogan_tim_kiem,
        "admin_window": Config.admin_window,
        "admin_auth": Config.admin, # Tạm thời để test so sánh ở frontend
        "thong_tin_bds_form": Config.thong_tin_bds_form,
        "danh_sach_bds": Config.danh_sach_bds,
        "admin_dashboard_labels": Config.admin_dashboard_labels,
        "cac_lua_chon_thue": Config.cac_lua_chon_thue, # New
        "cac_lua_chon_mua": Config.cac_lua_chon_mua,   # New
        "thong_tin_danh_sach_BDS": Config.thong_tin_danh_sach_BDS,
        "footer_data": Config.footer_data
    }
    # Chỉnh sửa path logo để web có thể truy cập được
    config_data["thong_tin_tieu_de"]["path_logo"] = cfg.path_logo
    config_data["path_hinh_nen"] = cfg.path_hinh_nen
    config_data["path_avatar_thue"] = cfg.path_avatar_thue # New
    config_data["path_avatar_mua"] = cfg.path_avatar_mua   # New
    return jsonify(config_data)

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username == Config.admin['tai_khoan'] and password == Config.admin['mat_khau']:
        return jsonify({"success": True})
    return jsonify({"success": False})

@app.route('/api/admin/change-password', methods=['POST'])
def change_password():
    data = request.json
    old_pass = data.get('old_pass')
    new_pass = data.get('new_pass')
    
    if old_pass == Config.admin['mat_khau']:
        new_creds = {"tai_khoan": Config.admin['tai_khoan'], "mat_khau": new_pass}
        if Config.save_admin(new_creds):
            return jsonify({"success": True})
            
    return jsonify({"success": False, "message": "Mật khẩu cũ không chính xác"})

@app.route('/api/admin/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"})
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"})
    
    try:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_content = file.read()
        
        # Upload lên Supabase Storage bucket 'properties'
        supabase.storage.from_('properties').upload(
            path=unique_filename, 
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        
        try:
            # Lấy URL công khai từ Supabase Storage
            res_url = supabase.storage.from_('properties').get_public_url(unique_filename)
            # Đảm bảo res_url là một chuỗi (phòng trường hợp thư viện trả về object)
            if not isinstance(res_url, str):
                # Supabase-py v2 trả về object có thuộc tính public_url
                res_url = getattr(res_url, 'public_url', str(res_url))
        except Exception as storage_err:
            print(f"Storage error: {storage_err}")
            return jsonify({"success": False, "message": "Could not get public URL"})

        return jsonify({"success": True, "url": res_url})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/api/admin/delete-file', methods=['POST'])
def delete_file():
    try:
        url = request.json.get('url')
        if url:
            delete_cloud_images([url])
            return jsonify({"success": True})
    except Exception as e:
        print(e)
    return jsonify({"success": False})

@app.route('/admin-dashboard')
def admin_dashboard():
    return render_template('admin.html')

@app.route('/api/admin/add-property', methods=['POST'])
def add_property():
    try:
        new_prop = request.json
        new_ma_id = str(new_prop.get('ma_bds', '')).strip().upper()
        new_prop['ma_bds'] = new_ma_id

        # Kiểm tra trùng mã trên DB
        check = supabase.table('properties').select("ma_bds").eq("ma_bds", new_ma_id).execute()
        if check.data:
            return jsonify({"success": False, "message": "EXISTED"})
            
        # Thêm vào Supabase
        supabase.table('properties').insert(new_prop).execute()
        
        # Đồng bộ lại cache local (không bắt buộc nếu bạn gọi lại API config,
        # nhưng giúp cập nhật ngay lập tức mà không cần tải lại toàn bộ config)
        if not hasattr(Config, 'danh_sach_bds'): Config.danh_sach_bds = []
        Config.danh_sach_bds.append(new_prop)
        Config.save_properties(Config.danh_sach_bds) # Lưu backup local
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/api/admin/delete-property', methods=['POST'])
def delete_property():
    try:
        ma_bds = request.json.get('ma_bds')
        # Xóa trên Supabase
        supabase.table('properties').delete().eq("ma_bds", ma_bds).execute()

        # Xóa ảnh cloud và cập nhật cache
        prop_to_delete = next((p for p in Config.danh_sach_bds if p.get('ma_bds') == ma_bds), None)
        if prop_to_delete:
            delete_cloud_images(prop_to_delete.get('anh_bds', []))
        
        Config.danh_sach_bds = [p for p in Config.danh_sach_bds if p.get('ma_bds') != ma_bds]
        Config.save_properties(Config.danh_sach_bds)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/api/admin/update-property', methods=['POST'])
def update_property():
    try:
        updated_prop = request.json
        ma_bds = updated_prop.get('ma_bds')
        
        for i, p in enumerate(Config.danh_sach_bds):
            if p.get('ma_bds') == ma_bds:
                old_images = set(p.get('anh_bds', []))
                new_images = set(updated_prop.get('anh_bds', []))
                removed_images = old_images - new_images
                delete_cloud_images(list(removed_images))
                
                # Cập nhật Supabase
                supabase.table('properties').update(updated_prop).eq("ma_bds", ma_bds).execute()
                
                Config.danh_sach_bds[i] = updated_prop
                Config.save_properties(Config.danh_sach_bds)
                return jsonify({"success": True})
        return jsonify({"success": False, "message": "Property not found or save failed"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    # Ưu tiên lấy Port từ môi trường (như PythonAnywhere cung cấp hoặc bạn đặt)
    # Nếu không có, mặc định dùng 5001 để tránh xung đột với port 5000 phổ biến
    port = int(os.environ.get("PORT", 5001))
    try:
        print(f"Khởi động Server tại: http://127.0.0.1:{port}")
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        print(f"Không thể khởi động trên cổng {port}: {e}")