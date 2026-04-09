from flask import Flask, render_template, jsonify
from config import Config

app = Flask(__name__)

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
        "lua_chon_admin": Config.lua_chon_admin
    }
    # Chỉnh sửa path logo để web có thể truy cập được
    config_data["thong_tin_tieu_de"]["path_logo"] = "/static/logo.png"
    return jsonify(config_data)

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)