# config.py
import os
import json
import numpy as np
import cv2
import math
import socket

def edit_path(input):
    return input.replace("\\", "/")


PATH_PHAN_MEM = edit_path(os.path.dirname(os.path.realpath(__file__)))
path_logo = os.path.join(PATH_PHAN_MEM, "static", "logo.png")



class Config:
    ngon_ngu_mac_dinh = "JP" # ngôn ngữ mặc định khi mở phần mềm
    thong_tin_tieu_de = {"path_logo": path_logo,
                         "tieu_de_ten_web": {"VI": "bất động sản 1", "EN": "real estate 1", "JP": "不動産 1"},
                         "thue": {"VI": "Thuê", "EN": "Rent", "JP": "アルバイト"},
                         "mua": {"VI": "Mua", "EN": "Buy", "JP": "販売"},
                         "blog": {"VI": "Tin tức", "EN": "Blog", "JP": "ブログ"},
                         "about": {"VI": "Giới thiệu", "EN": "About", "JP": "紹介"},
                         "contact": {"VI": "Liên hệ", "EN": "Contact", "JP": "お問い合わせ"},
                         "admin": {"VI": "Quản trị", "EN": "Admin", "JP": "管理"}}
    
    # 2 lựa chọn khi nhấn vào quản trị/admin
    lua_chon_admin = {"dang_nhap": {"VI": "Đăng nhập", "EN": "Login", "JP": "ログイン"},
                      "doi_mat_khau": {"VI": "Đổi mật khẩu", "EN": "Change password", "JP": "パスワードを変更"}}