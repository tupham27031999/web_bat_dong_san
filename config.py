# config.py
import os
import json
import sys

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError as e:
    sys.stderr.write(f"CRITICAL ERROR: Missing library! {e}\n")
    sys.stderr.flush()
    supabase = None

def edit_path(input):
    return input.replace("\\", "/")

PATH_PHAN_MEM = edit_path(os.path.dirname(os.path.realpath(__file__)))
env_path = os.path.join(PATH_PHAN_MEM, ".env")

if os.path.exists(env_path):
    load_dotenv(env_path)
    # Flush ngay lập tức để không bị kẹt trong buffer của PythonAnywhere
    sys.stderr.write(f"--- INFO: Loaded .env from {env_path} ---\n")
    sys.stderr.flush()
else:
    sys.stderr.write(f"--- WARNING: .env file NOT FOUND at {env_path}. Using environment variables. ---\n")
    sys.stderr.flush()

# Cấu hình Supabase (Thay thế bằng thông tin thực tế của bạn)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    error_msg = f"WARNING: SUPABASE_URL or SUPABASE_KEY is missing! Check .env at: {env_path}\n"
    sys.stderr.write(error_msg)
    sys.stderr.flush()

# Khởi tạo client, nếu thiếu key thì biến supabase sẽ lỗi khi gọi hàm
if 'create_client' in globals() and SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    if 'supabase' not in globals():
        supabase = None


path_logo = "/static/logo.PNG"
path_hinh_nen = "/static/nen_bat_dong_san.jpg"
path_hinh_nen_blog = "/static/nen_bat_dong_san.jpg"
path_hinh_nen_gioi_thieu = "/static/nen_bat_dong_san.jpg"
path_avatar_thue = "/static/slogan_rent.png" # Đường dẫn ảnh avatar cho phần thuê
path_avatar_mua = "/static/slogan_buy.png"  # Đường dẫn ảnh avatar cho phần bán
path_thong_tin_thanh_vien = os.path.join(PATH_PHAN_MEM, "static", "thong_tin_thanh_vien.json")

def load_admin_credentials():
    try:
        if supabase:
            response = supabase.table('admin').select("*").limit(1).execute()
            if response.data:
                return response.data[0]
    except Exception as e:
        sys.stderr.write(f"Lỗi khi đọc admin từ Supabase: {e}\n")
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
    try:
        response = supabase.table('properties').select("*").execute()
        return response.data
    except Exception as e:
        print(f"Lỗi khi đọc properties từ Supabase: {e}")
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
                         "trang_chu": {"VI": "Trang chủ", "EN": "Home", "JP": "ホーム"},
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
                       "EN": "Your Trusted Partner in Tokyo Real Estate",
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

    # Cấu hình giao diện Blog đa ngôn ngữ
    blog_ui = {
        "hero_title": {"VI": "Blog & Kiến thức", "EN": "Blog & Knowledge", "JP": "ブログと知識"},
        "hero_sub": {"VI": "Chia sẻ kinh nghiệm sống và thuê nhà tại Nhật Bản", "EN": "Sharing life experiences and renting in Japan", "JP": "日本での生活や賃貸の経験を共有する"},
        "all_categories_label": {"VI": "Tất cả", "EN": "All", "JP": "すべて"}
    }

    # Danh mục Blog
    blog_categories = {
        "thue_nha": {"VI": "Thuê nhà ở Nhật Bản", "EN": "Rentals in Japan", "JP": "日本での賃貸"},
        "cuoc_song": {"VI": "Cuộc sống", "EN": "Life", "JP": "生活"},
        "xa_hoi_van_hoa": {"VI": "Xã hội và văn hóa", "EN": "Society & Culture", "JP": "社会と文化"},
        "nha_o": {"VI": "Nhà ở", "EN": "Housing", "JP": "住宅"},
        "van_hoa_nhat": {"VI": "Văn hóa Nhật Bản", "EN": "Japanese Culture", "JP": "日本文化"},
        "gia_dinh": {"VI": "Gia đình", "EN": "Family", "JP": "家族"},
        "noi_sinh_song": {"VI": "Nơi sinh sống", "EN": "Living Area", "JP": "居住エリア"},
        "quy_trinh_ung_tuyen": {"VI": "Quy trình ứng tuyển", "EN": "Application Process", "JP": "応募プロセス"},
        "tai_chinh": {"VI": "Tài chính", "EN": "Finance", "JP": "金融"},
        "theo_mua": {"VI": "Theo mùa", "EN": "Seasonal", "JP": "季節"}
    }

    # Dữ liệu Blog mẫu
    blog_posts = [
        {
            "id": 1,
            "category_key": "thue_nha",
            "image": "https://images.unsplash.com/photo-1522444195799-478538b28823",
            "title": {"VI": "Cách tìm nhà tại Tokyo", "EN": "How to find house in Tokyo", "JP": "東京での家探し"},
            "desc": {
                "VI": "Hướng dẫn chi tiết quy trình tìm kiếm căn hộ phù hợp ngân sách.",
                "EN": "Detailed guide to finding an apartment on a budget.",
                "JP": "予算に合ったアパート探しの詳細ガイド。"
            }
        }
    ]

    # Biến cấu trúc cho form nhập liệu Blog
    thong_tin_blog_form = {
        "category_key": {
            "label": {"VI": "Chuyên mục", "EN": "Category", "JP": "カテゴリー"},
            "options": blog_categories
        },
        "title": {
            "VI": "Tiêu đề bài viết", "EN": "Blog Title", "JP": "ブログのタイトル"
        },
        "image_url": {
            "label": {"VI": "Ảnh bìa bài viết", "EN": "Cover Image", "JP": "カバー画像"}
        },
        "desc": {
            "VI": "Mô tả ngắn gọn", "EN": "Short Summary", "JP": "短い要約"
        },
        "content": {
            "VI": "Nội dung chi tiết (HTML/Text)", "EN": "Detailed Content", "JP": "詳細内容"
        }
    }

    # Các lựa chọn lọc riêng cho phần thuê
    cac_lua_chon_thue = {
        "tim_kiem_tat_ca": {"VI": "Tìm kiếm tất cả", "EN": "Search all", "JP": "すべて検索する"},
        "phong_don": {"VI": "Phòng đơn", "EN": "Single room", "JP": "シングルルーム"},
        "phong_gia_dinh": {"VI": "Phòng gia đình", "EN": "Family room", "JP": "ファミリールーム"},
        "nha_rieng": {"VI": "Nhà riêng/Biệt lập", "EN": "Private house/Apartment", "JP": "プライベートハウス/アパートメント"},
    }
    # Các lựa chọn lọc riêng cho phần bán
    cac_lua_chon_mua = {
        "tim_kiem_tat_ca": {"VI": "Tìm kiếm tất cả", "EN": "Search all", "JP": "すべて検索する"},
        "phong_don": {"VI": "Phòng đơn", "EN": "Single room", "JP": "シングルルーム"},
        "phong_gia_dinh": {"VI": "Phòng gia đình", "EN": "Family room", "JP": "ファミリールーム"},
        "nha_rieng": {"VI": "Nhà riêng/Biệt lập", "EN": "Private house/Apartment", "JP": "プライベートハウス/アパートメント"},
    }
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
            "them_blog": {"VI": "Viết Blog", "EN": "Write Blog", "JP": "ブログを書く"},
            "danh_sach_blog": {"VI": "Danh sách Blog", "EN": "Blog List", "JP": "ブログ一覧"},
            "danh_sach": {"VI": "Danh sách tin đăng", "EN": "Property List", "JP": "物件一覧"},
            "quay_lai": {"VI": "Quay lại trang chủ", "EN": "Back to Home", "JP": "ホームに戻る"}
        },
        "header": {
            "tieu_de_dang_tin": {"VI": "Đăng tin BĐS mới", "EN": "Post New Property", "JP": "新規物件投稿"},
            "tieu_de_danh_sach": {"VI": "Danh sách bất động sản", "EN": "Property List", "JP": "物件一覧"},
            "tieu_de_chinh_sua": {"VI": "Chỉnh sửa BĐS", "EN": "Edit Property", "JP": "物件の編集"},
            "tieu_de_blog": {"VI": "Viết Blog mới", "EN": "Write New Blog", "JP": "新しいブログを書く"},
            "tieu_de_ds_blog": {"VI": "Danh sách bài viết", "EN": "Blog Post List", "JP": "ブログ記事一覧"},
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
    
    tab_gioi_thieu = {
        "tieu_de": {"VI": "Đối tác bất động sản đáng tin cậy của bạn tại Tokyo", "EN": "Your trusted real estate partner in Tokyo", "JP": "東京における信頼できる不動産パートナー"},
        "tieu_de_noi_dung": {"VI": "Thị trường bất động sản Nhật Bản đầy tiềm năng nhưng lại phức tạp nếu tự mình tìm hiểu.", 
                             "EN": "Japan’s real estate market is rewarding , but complex to navigate alone.",
                             "JP": "日本の不動産市場は魅力的な投資先だが、一人で乗り切るには複雑だ。"},
        "noi_dung": {"VI": """Rào cản ngôn ngữ, yêu cầu giấy tờ khắt khe và thị trường xa lạ với hầu hết người nước ngoài khiến việc thuê, mua và đầu tư bất động sản tại Nhật Bản trở nên vô cùng khó khăn. 
                            Chúng tôi sẽ giúp bạn vượt qua những khó khăn đó bằng cách đóng vai trò là cố vấn, phiên dịch viên và đại diện tận tâm của bạn từ khâu tư vấn ban đầu đến khi hoàn tất giao dịch.
                            Bạn không nói được tiếng Nhật? Đó chính là lý do chúng tôi có mặt ở đây.""", 
                    "EN": """Language barriers, strict documentation requirements, and a market unfamiliar to most foreigners make renting, purchasing, and investing in Japan uniquely challenging. 
                            We bridge that gap acting as your dedicated advisor, translator, and representative from first inquiry through final transaction.
                            Don’t speak Japanese? That’s exactly why we’re here.""",
                    "JP": """言語の壁、厳格な書類手続き、そして外国人にとって馴染みのない市場環境など、日本での賃貸、購入、投資は、非常に困難なものとなっています。
                            私たちは、最初のお問い合わせから最終的な取引完了まで、専任のアドバイザー、通訳、代理人として、お客様のあらゆるニーズにお応えします。

                            日本語が話せない？まさにそれが、私たちがいる理由です。"""},
        "thong_tin_1": {"VI": "Hỗ trợ tìm kiếm và ký kết hợp đồng thuê nhà", "EN": "Rental Placement & Lease Support", "JP": "賃貸物件の紹介とリース契約のサポート"},
        "thong_tin_2": {"VI": "Mua bán bất động sản dành cho người mua nước ngoài", "EN": "Property Acquisition for Foreign Buyers", "JP": "外国人購入者向け不動産取得"},
        "thong_tin_3": {"VI": "Tư vấn đầu tư bất động sản", "EN": " Real Estate Investment Advisory", "JP": "不動産投資アドバイザリー"},
        "thong_tin_4": {"VI": "Hướng dẫn đầy đủ về hồ sơ và hợp đồng", "EN": "Full Documentation & Contract Guidance", "JP": "完全な文書化と契約に関するガイダンス"},
        "thong_tin_5": {"VI": "Hỗ trợ trọn gói từ khâu chuyển nhà đến lắp đặt", "EN": "End-to-End Move-In & Setup Support", "JP": "入居からセットアップまで、エンドツーエンドのサポートを提供します。"},
        "noi_dung_thong_tin_1": {"VI": "Chúng tôi giúp bạn tìm bất động sản phù hợp, quản lý hồ sơ ứng tuyển và duy trì là đầu mối liên hệ với chủ nhà trong suốt thời hạn thuê.",
                                 "EN": "We match you with the right property, manage your application, and remain your point of contact with landlords for the full duration of your lease.",
                                 "JP": "お客様に最適な物件をご案内し、入居申し込みの管理、そして賃貸期間中はずっと大家様との連絡窓口としてサポートいたします。"},
        "noi_dung_thong_tin_2": {"VI": "Từ khâu chọn lọc đến khi hoàn tất giao dịch, chúng tôi hướng dẫn bạn quy trình mua bất động sản tại Nhật Bản — thay mặt bạn xử lý đàm phán, hồ sơ pháp lý và điều phối đại lý.",
                                 "EN": "From shortlisting to closing, we guide you through purchasing property in Japan — handling negotiations, legal documentation, and agent coordination on your behalf.",
                                 "JP": "物件の選定から成約まで、日本での不動産購入をガイドします。交渉、法的書類の作成、エージェントとの調整をお客様に代わって行います。"},
        "noi_dung_thong_tin_3": {"VI": "Chúng tôi giúp bạn xác định các cơ hội sinh lời cao tại thị trường Tokyo, đánh giá rủi ro và xây dựng cấu trúc đầu tư cho dù bạn là người mua lần đầu hay đang mở rộng danh mục đầu tư.",
                                 "EN": "We help you identify high-yield opportunities in Tokyo’s market, assess risk, and structure your investment  whether you’re a first-time buyer or growing a portfolio.",
                                 "JP": "東京市場における高利回りの機会を特定し、リスク評価や投資構造の構築をサポートします。初めての購入者からポートフォリオを拡大中の方まで対応いたします。"},
        "noi_dung_thong_tin_4": {"VI": "Mọi hợp đồng, điều khoản và yêu cầu pháp lý đều được giải thích rõ ràng bằng ngôn ngữ của bạn. Không mơ hồ, không bất ngờ ngoài dự kiến.",
                                 "EN": "Every contract, clause, and legal requirement explained clearly in your language. No ambiguity, no surprises.",
                                 "JP": "すべての契約、条項、法的要件をお客様の言語で明確に説明します。曖昧さや予期せぬ事態はありません。"},
        "noi_dung_thong_tin_5": {"VI": "Sau khi giao dịch hoàn tất, chúng tôi điều phối dịch vụ chuyển nhà, điện nước và mọi thứ cần thiết để bạn ổn định cuộc sống ngay từ ngày đầu tiên.",
                                 "EN": "Once the deal is done, we coordinate movers, utilities, and everything needed to get you settled from day one.",
                                 "JP": "取引完了後、引越し業者や公共サービスの手配など、入居初日から快適に過ごせるよう必要なすべての準備を調整いたします。"},
        
        "team": {"VI": "Nhóm", "EN": "Our team", "JP": "チーム"},
        "thong_tin_chung_team": {"VI": "Đội ngũ chuyên nghiệp về bất động sản Tokyo của bạn", "EN": "Your Dedicated Tokyo Real Estate Team", "JP": "東京の不動産専門チーム"}

    }

    # thong_tin_thanh_vien = {"thanh_vien_1": {"ten": {"VI": "person1", "EN": "person1", "JP": "person1"}, "chuc_vu": {"VI": "leader", "EN": "leader", "JP": "leader"}, "link_anh": "/static/anh_thanh_vien/thanh_vien_1.jpeg"},
    #                         "thanh_vien_2": {"ten": {"VI": "person2", "EN": "person2", "JP": "person2"}, "chuc_vu": {"VI": "deputy leader", "EN": "deputy leader", "JP": "deputy leader", "link_anh": "/static/anh_thanh_vien/thanh_vien_2.jpeg"}}}
    # đọc từ file bằng đường link path_thong_tin_thanh_vien dạng json
    thong_tin_thanh_vien = {}
    try:
        if os.path.exists(path_thong_tin_thanh_vien):
            with open(path_thong_tin_thanh_vien, 'r', encoding='utf-8') as f:
                thong_tin_thanh_vien = json.load(f)
    except Exception as e:
        print(f"Lỗi khi đọc file thong_tin_thanh_vien.json: {e}")
    print("thong_tin_thanh_vien", thong_tin_thanh_vien)
    

    @staticmethod
    def save_admin(new_data):
        admin_file = os.path.join(PATH_PHAN_MEM, "admin.json")
        try:
            # Cập nhật mật khẩu dựa trên tài khoản
            supabase.table('admin').update({"mat_khau": new_data['mat_khau']}).eq("tai_khoan", new_data['tai_khoan']).execute()
            Config.admin = new_data
        except Exception as e:
            print(f"Lỗi khi lưu admin lên Supabase: {e}")
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
        # Lưu ý: Với DB, thường ta sẽ insert/update từng bản ghi thay vì lưu cả list.
        # Hàm này được giữ lại để đồng bộ biến global Config.danh_sach_bds
        try:
            with open(properties_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            Config.danh_sach_bds = data # Cập nhật lại biến trong bộ nhớ
            return True
        except Exception as e:
            print(f"Lỗi khi lưu properties.json: {e}")
            return False
