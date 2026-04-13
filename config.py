# config.py
import os

def edit_path(input):
    return input.replace("\\", "/")


PATH_PHAN_MEM = edit_path(os.path.dirname(os.path.realpath(__file__)))
path_logo = "/static/logo.PNG"
path_hinh_nen = "/static/nen_bat_dong_san.jpg"
path_avatar = "/static/slogan.png"




class Config:
    ngon_ngu_mac_dinh = "EN" # ngôn ngữ mặc định khi mở phần mềm
    thong_tin_tieu_de = {"path_logo": path_logo,
                         "tieu_de_ten_web": {"VI": "Bất Động Sản", "EN": "Real Estate", "JP": "不動産"},
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
    danh_sach_dia_chi_lua_chon = ["SL1", "SL2", "SL3"]
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
    
                    


    
