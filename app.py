from flask import Flask, render_template, jsonify, request
from config import Config
import config as cfg
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Vô hiệu hóa việc tự động sắp xếp các phím JSON theo bảng chữ cái
# Điều này giúp giữ nguyên thứ tự các trường như đã định nghĩa trong config.py
app.json.sort_keys = False

UPLOAD_FOLDER = os.path.join(cfg.PATH_PHAN_MEM, 'static/uploads/properties')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def delete_physical_images(image_list):
    """Xóa các file ảnh vật lý khỏi thư mục upload."""
    if not image_list:
        return
    for url in image_list:
        try:
            filename = os.path.basename(url)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Lỗi khi xóa file {url}: {e}")

@app.route('/')
def index():
    return render_template('index.html')

# Route để web gọi lấy thông tin khi cần
@app.route('/api/config')
def get_config():
    # Trả về toàn bộ cấu hình cần thiết cho frontend
    config_data = {
        "ngon_ngu_mac_dinh": Config.ngon_ngu_mac_dinh,
        "thong_tin_tieu_de": Config.thong_tin_tieu_de.copy(),
        "lua_chon_admin": Config.lua_chon_admin,
        "thanh_tim_kiem": Config.thanh_tim_kiem,
        "danh_sach_dia_chi_lua_chon": Config.danh_sach_dia_chi_lua_chon,
        "slogan": Config.slogan,
        "cac_lua_chon": Config.cac_lua_chon,
        "slogan_tim_kiem": Config.slogan_tim_kiem,
        "admin_window": Config.admin_window,
        "admin_auth": Config.admin, # Tạm thời để test so sánh ở frontend
        "thong_tin_bds_form": Config.thong_tin_bds_form,
        "danh_sach_bds": Config.danh_sach_bds,
        "admin_dashboard_labels": Config.admin_dashboard_labels,
        "thong_tin_danh_sach_BDS": Config.thong_tin_danh_sach_BDS
    }
    # Chỉnh sửa path logo để web có thể truy cập được
    config_data["thong_tin_tieu_de"]["path_logo"] = cfg.path_logo
    config_data["path_hinh_nen"] = cfg.path_hinh_nen
    config_data["path_avatar"] = cfg.path_avatar
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
    
    if file:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        return jsonify({"success": True, "url": f"/static/uploads/properties/{unique_filename}"})

@app.route('/api/admin/delete-file', methods=['POST'])
def delete_file():
    """API để xóa nhanh một file ảnh (dùng cho ảnh vừa upload nhưng bị xóa ngay)."""
    try:
        url = request.json.get('url')
        if url:
            delete_physical_images([url])
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
        # Lấy danh sách hiện tại, thêm mới và lưu lại
        current_list = Config.danh_sach_bds
        
        # Chuẩn hóa mã BĐS mới: xóa khoảng trắng và chuyển thành chữ hoa
        new_ma_id = str(new_prop.get('ma_bds', '')).strip().upper()
        new_prop['ma_bds'] = new_ma_id

        # Kiểm tra trùng mã BĐS (so sánh không phân biệt hoa thường)
        if any(str(p.get('ma_bds', '')).strip().upper() == new_ma_id for p in current_list):
            return jsonify({"success": False, "message": "EXISTED"})
            
        current_list.append(new_prop)
        if Config.save_properties(current_list):
            return jsonify({"success": True})
        return jsonify({"success": False, "message": "Could not save to file"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/api/admin/delete-property', methods=['POST'])
def delete_property():
    try:
        ma_bds = request.json.get('ma_bds')
        current_list = Config.danh_sach_bds
        
        # Tìm và xóa ảnh vật lý của BĐS trước khi xóa khỏi danh sách
        prop_to_delete = next((p for p in current_list if p.get('ma_bds') == ma_bds), None)
        if prop_to_delete:
            delete_physical_images(prop_to_delete.get('anh_bds', []))

        new_list = [p for p in current_list if p.get('ma_bds') != ma_bds]
        
        if Config.save_properties(new_list):
            return jsonify({"success": True})
        return jsonify({"success": False, "message": "Could not save to file"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/api/admin/update-property', methods=['POST'])
def update_property():
    try:
        updated_prop = request.json
        ma_bds = updated_prop.get('ma_bds')
        current_list = Config.danh_sach_bds
        
        for i, p in enumerate(current_list):
            if p.get('ma_bds') == ma_bds:
                # So sánh ảnh cũ và mới để xóa các file không còn dùng
                old_images = set(p.get('anh_bds', []))
                new_images = set(updated_prop.get('anh_bds', []))
                removed_images = old_images - new_images
                delete_physical_images(list(removed_images))
                
                current_list[i] = updated_prop
                if Config.save_properties(current_list):
                    return jsonify({"success": True})
                break

        return jsonify({"success": False, "message": "Property not found or save failed"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)