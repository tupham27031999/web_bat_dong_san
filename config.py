# config.py
import os
import json

def edit_path(input):
    return input.replace("\\", "/")


PATH_PHAN_MEM = edit_path(os.path.dirname(os.path.realpath(__file__)))
path_logo = "/static/logo.PNG"
path_hinh_nen = "/static/nen_bat_dong_san.jpg"
path_avatar = "/static/slogan.png"

def load_admin_credentials():
    admin_file = os.path.join(PATH_PHAN_MEM, "admin.json")
    if os.path.exists(admin_file):
        try:
            with open(admin_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Lỗi khi đọc file admin.json: {e}")
    # Giá trị mặc định nếu không tìm thấy file hoặc lỗi
    return {"tai_khoan": "admin", "mat_khau": "123"}

def load_properties():
    properties_file = os.path.join(PATH_PHAN_MEM, "properties.json")
    if os.path.exists(properties_file):
        try:
            with open(properties_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Lỗi khi đọc file properties.json: {e}")
    return []

def load_footer_data():
    footer_file = os.path.join(PATH_PHAN_MEM, "footer.json")
    if os.path.exists(footer_file):
        try:
            with open(footer_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Lỗi khi đọc file footer.json: {e}")
    return {}

class Config:
    ngon_ngu_mac_dinh = "EN" # ngôn ngữ mặc định khi mở phần mềm
    thong_tin_tieu_de = {"path_logo": path_logo,
                         "tieu_de_ten_web": {"VI": "Housing.jp", "EN": "Housing.jp", "JP": "Housing.jp"},
                         "thue": {"VI": "Thuê", "EN": "Rent", "JP": "賃貸"},
                         "mua": {"VI": "Mua", "EN": "Buy", "JP": "購入"},
                         "blog": {"VI": "Tin tức", "EN": "Blog", "JP": "ブログ"},
                         "about": {"VI": "Giới thiệu", "EN": "About", "JP": "紹介"},
                         "contact": {"VI": "Liên hệ", "EN": "Contact", "JP": "お問い合わせ"},
                         "admin": {"VI": "Quản trị", "EN": "Admin", "JP": "管理"}}
    
    # 2 lựa chọn khi nhấn vào quản trị/admin
    lua_chon_admin = {"dang_nhap": {"VI": "Đăng nhập", "EN": "Login", "JP": "ログイン"},
                      "doi_mat_khau": {"VI": "Đổi mật khẩu", "EN": "Change password", "JP": "パスワードを変更"}}
    
    # slogan trên thanh tìm kiếm 
    slogan_tim_kiem = {"VI": "Giúp bạn tìm được ngôi nhà mơ ước tại Tokyo",
                       "EN": "Helping You Find Your Home in Tokyo",
                       "JP": "東京での住まい探しをお手伝いします"}
    # thanh tìm kiếm ở trung tâm của web
    danh_sach_dia_chi_lua_chon = [] # Sẽ được tính toán động từ dữ liệu thực tế
    thanh_tim_kiem = {"dia_chi": {"VI": "Địa chỉ", "EN": "Address", "JP": "住所"},
                      "so_phong_ngu": {"VI": "Phòng ngủ", "EN": "Bedrooms", "JP": "寝室数"},
                      "gia_tien": {"VI": "Giá tiền", "EN": "Price", "JP": "価格"},
                      "nho_nhat": {"VI": "Nhỏ nhất", "EN": "Min", "JP": "最小"},
                      "lon_nhat": {"VI": "Lớn nhất", "EN": "Max", "JP": "最大"},
                      "don_vi": "JPY"} # đơn vị mặc định là Yên nhật
    

    # dòng chữ bên phải khu vực các bất động sản sau khi nhấn tìm kiếm
    slogan = {"slogan_thue": {"VI":"Căn hộ / Nhà cho thuê dài han.\nBạn dự định sống ở Tokyo từ 1 năm trở lên?\nChúng tôi sẽ tìm cho bạn một căn hộ cho thuê phù hợp với lối sống của bạn",
                              "EN": "Long-term apartment/house rentals available.\nPlanning to live in Tokyo for a year or more?\nWe will find you a rental apartment that suits your lifestyle.",
                              "JP": "長期賃貸アパート・一戸建てをご用意しております。\n東京に1年以上滞在予定ですか？\nお客様のライフスタイルに合った賃貸アパートをお探しいたします。"},
                "slogan_mua": {"VI": "NHÀ BÁN,\nMua trả góp hay trả tiền mặt?\nTừ căn hộ và nhà biệt lập để ở hoặc đầu tư, đến các tòa nhà và đất đai, chúng tôi đều đáp ứng được nhu cầu của bạn.",
                               "EN": "HOUSE FOR SALE,\nInstallment or Cash?\nFrom apartments and detached houses for living or investment, to buildings and land, we can meet your needs.",
                               "JP": "154住宅販売、分割払い \n現金払いどちらでもお探しですか？\n居住用または投資用のアパートや一戸建て住宅から、建物や土地まで、お客様のご希望に合った物件をご用意しております。"}
            }
    cac_lua_chon = {"tim_kiem_tat_ca": {"VI": "Tìm kiếm tất cả", "EN": "Search all", "JP": "すべて検索する"},
                    "phong_don": {"VI": "Phòng đơn", "EN": "Single room", "JP": "シングルルーム"},
                    "phong_gia_dinh": {"VI": "Phòng gia đình", "EN": "Family room", "JP": "ファミリールーム"},
                    "nha_rieng": {"VI": "Nhà riêng/Biệt lập", "EN": "Private house/Apartment", "JP": "プライベートハウス/アパートメント"},}
    
    admin = load_admin_credentials()
    admin_window = {
        "dang_nhap": {
            "tieu_de": {"VI": "Đăng Nhập Quản Trị", "EN": "Admin Login", "JP": "管理者ログイン"},
            "tai_khoan": {"VI": "Tên đăng nhập", "EN": "Username", "JP": "ユーザー名"},
            "mat_khau": {"VI": "Mật khẩu", "EN": "Password", "JP": "パスワード"},
            "nut_gui": {"VI": "Đăng Nhập", "EN": "Sign In", "JP": "サインイン"},
        },
        "doi_mat_khau": {
            "tieu_de": {"VI": "Đổi Mật Khẩu", "EN": "Change Password", "JP": "パスワード変更"},
            "mat_khau_cu": {"VI": "Mật khẩu cũ", "EN": "Current Password", "JP": "現在のパスワード"},
            "mat_khau_moi": {"VI": "Mật khẩu mới", "EN": "New Password", "JP": "新しいパスワード"},
            "xac_nhan": {"VI": "Xác nhận mật khẩu", "EN": "Confirm Password", "JP": "パスワードの確認"},
            "nut_gui": {"VI": "Cập Nhật", "EN": "Update", "JP": "更新"},
        },
        "chung": {
            "nut_huy": {"VI": "Đóng", "EN": "Close", "JP": "閉じる"},
            "thong_bao_sai": {"VI": "Thông tin không chính xác!", "EN": "Incorrect information!", "JP": "不正確な情報です！"},
            "thong_bao_dung": {"VI": "Thao tác thành công!", "EN": "Success!", "JP": "成功しました！"},
            "loi_trung_ma": {"VI": "Mã bất động sản đã tồn tại!", "EN": "Property ID already exists!", "JP": "物件IDは既に存在します！"},
            "loi_gia_tri_am": {"VI": "Giá trị không được nhỏ hơn 0!", "EN": "Value cannot be less than 0!", "JP": "値は0未満にすることはできません！"}
        }
    }

    # Biến cấu trúc cho form nhập liệu và hiển thị Bất động sản
    thong_tin_bds_form = {
        "ma_bds": {"label": {"VI": "Mã bất động sản", "EN": "Property ID", "JP": "物件ID"}},
        "ten_bds": {"VI": "Tên bất động sản", "EN": "Property Name", "JP": "物件名"},
        "ma_buu_dien": {"label": {"VI": "Mã bưu điện (〒)", "EN": "Postal Code", "JP": "郵便番号"}},
        "tinh_thanh": {
            "VI": "Tỉnh/Thành phố", "EN": "Prefecture", "JP": "都道府県"
        },
        "quan_huyen": {
            "VI": "Quận/Thị xã (Ward/City)", "EN": "Ward/City", "JP": "市区町村"
        },
        "dia_chi_chi_tiet": {
            "VI": "Số nhà, Tòa nhà, Phòng", "EN": "Building Name / House No.", "JP": "番地・建物名・部屋番号"
        },
        "mo_ta": {"VI": "Mô tả chi tiết", "EN": "Detailed Description", "JP": "詳細説明"},
        "phan_loai": {
            "label": {"VI": "Phân loại", "EN": "Category", "JP": "カテゴリー"},
            "options": {
                "thue": {"VI": "Cho thuê", "EN": "For Rent", "JP": "賃貸"},
                "ban": {"VI": "Nhà bán", "EN": "For Sale", "JP": "販売"},
                "dau_tu": {"VI": "Tòa nhà đầu tư", "EN": "Investment Building", "JP": "投資用ビル"}
            }
        },
        "dien_tich": {"label": {"VI": "Diện tích (m2)", "EN": "Area (sqm)", "JP": "面積 (m2)"}},
        "so_phong_ngu": {"label": {"VI": "Số phòng ngủ", "EN": "Bedrooms", "JP": "寝室数"}},
        "so_tang": {"label": {"VI": "Số tầng", "EN": "Number of floors", "JP": "階数"}},
        "gia_jpy": {"label": {"VI": "Giá JPY", "EN": "Price JPY", "JP": "価格 JPY"}},
        "tien_thue_thang": {"label": {"VI": "Tiền nhà hàng tháng (Cho thuê)", "EN": "Monthly Rent", "JP": "月額賃料"}},
        "gia_usd": {"label": {"VI": "Giá USD", "EN": "Price USD", "JP": "価格 USD"}},
        "gia_vnd": {"label": {"VI": "Giá VNĐ", "EN": "Price VND", "JP": "価格 VND"}},
        "phi_quan_ly": {"label": {"VI": "Phí quản lý (nếu có)", "EN": "Management fee", "JP": "管理費"}},
        "phong_don": {
            "label": {"VI": "Phòng đơn", "EN": "Single room", "JP": "シングルルーム"},
            "options": {"yes": {"VI": "Có", "EN": "Yes", "JP": "はい"}, "no": {"VI": "Không", "EN": "No", "JP": "いいえ"}}
        },
        "phong_gia_dinh": {
            "label": {"VI": "Phòng gia đình", "EN": "Family room", "JP": "ファミリールーム"},
            "options": {"yes": {"VI": "Có", "EN": "Yes", "JP": "はい"}, "no": {"VI": "Không", "EN": "No", "JP": "いいえ"}}
        },
        "nha_rieng": {
            "label": {"VI": "Nhà riêng/Biệt lập", "EN": "Private house/Apartment", "JP": "プライベートハウス/アパートメント"},
            "options": {
                "yes": {"VI": "Có", "EN": "Yes", "JP": "はい"},
                "no": {"VI": "Không", "EN": "No", "JP": "いいえ"}
            }
        },
        "thu_nuoi": {
            "label": {"VI": "Cho phép thú nuôi", "EN": "Pets allowed", "JP": "ペット可"},
            "options": {
                "yes": {"VI": "Có", "EN": "Yes", "JP": "はい"},
                "no": {"VI": "Không", "EN": "No", "JP": "いいえ"}
            }
        },
        "toa_do": {"label": {"VI": "Vị trí (tọa độ)", "EN": "Location (coordinates)", "JP": "位置 (座標)"}},
        "ga_tau_gan": {"VI": "Các ga tàu gần", "EN": "Nearby stations", "JP": "最寄り駅"},
        "anh_bds": {"label": {"VI": "Hình ảnh bất động sản", "EN": "Property Images", "JP": "物件の画像"}}
    }

    danh_sach_bds = load_properties() # Tải dữ liệu từ file khi khởi động
    footer_data = load_footer_data() # Tải dữ liệu footer
    print("danh_sach_bds", danh_sach_bds)
    temp_property_data = {} # Biến để lưu giá trị sau khi người dùng nhập

    admin_dashboard_labels = {
        "sidebar": {
            "cms_title": {"VI": "CMS Quản trị", "EN": "CMS Admin", "JP": "CMS管理"},
            "them_bds": {"VI": "Thêm Bất Động Sản", "EN": "Add Property", "JP": "物件追加"},
            "danh_sach": {"VI": "Danh sách tin đăng", "EN": "Property List", "JP": "物件一覧"},
            "quay_lai": {"VI": "Quay lại trang chủ", "EN": "Back to Home", "JP": "ホームに戻る"}
        },
        "header": {
            "tieu_de_dang_tin": {"VI": "Đăng tin BĐS mới", "EN": "Post New Property", "JP": "新規物件投稿"},
            "tieu_de_danh_sach": {"VI": "Danh sách bất động sản", "EN": "Property List", "JP": "物件一覧"},
            "tieu_de_chinh_sua": {"VI": "Chỉnh sửa BĐS", "EN": "Edit Property", "JP": "物件の編集"},
            "nguoi_dung": {"VI": "Quản trị viên", "EN": "Administrator", "JP": "管理者"}
        },
        "buttons": {
            "lam_moi": {"VI": "Làm mới", "EN": "Reset", "JP": "リセット"},
            "luu": {"VI": "Lưu thông tin", "EN": "Save Information", "JP": "情報を保存"}
        }
    }

    thong_tin_danh_sach_BDS = {
        "ma_bds": {"VI": "Mã BĐS", "EN": "Property ID", "JP": "物件ID"},
        "ten_bds": {"VI": "Tên BĐS", "EN": "Property Name", "JP": "物件名"},
        "dia_chi": {"VI": "Địa chỉ", "EN": "Address", "JP": "住所"},
        "gia": {"VI": "Giá (JPY)", "EN": "Price (JPY)", "JP": "価格 (JPY)"},
        "thao_tac": {"VI": "Thao tác", "EN": "Actions", "JP": "操作"},
        "placeholder_tim_kiem": {"VI": "Tìm theo mã BĐS...", "EN": "Search by ID...", "JP": "IDで検索..."}
    }

    @staticmethod
    def save_admin(new_data):
        admin_file = os.path.join(PATH_PHAN_MEM, "admin.json")
        try:
            with open(admin_file, 'w', encoding='utf-8') as f:
                json.dump(new_data, f, ensure_ascii=False, indent=4)
            Config.admin = new_data # Cập nhật lại biến trong bộ nhớ
            return True
        except Exception as e:
            print(f"Lỗi khi lưu admin.json: {e}")
            return False

    @staticmethod
    def save_properties(data):
        properties_file = os.path.join(PATH_PHAN_MEM, "properties.json")
        try:
            with open(properties_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            Config.danh_sach_bds = data # Cập nhật lại biến trong bộ nhớ
            return True
        except Exception as e:
            print(f"Lỗi khi lưu properties.json: {e}")
            return False
