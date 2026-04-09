from flask import Flask, render_template, jsonify
from config import Config

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Route để web gọi lấy thông tin khi cần
@app.route('/api/info')
def get_info():
    return jsonify({
        "project_name": Config.PROJECT_NAME,
        "version": Config.VERSION
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)