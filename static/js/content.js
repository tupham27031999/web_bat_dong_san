// Bạn có thể thay đổi các giá trị này để test giao diện
const webContent = {
    "welcome_text": "Chào mừng bạn đến với dự án Bất Động Sản!",
    "sub_text": "Hệ thống đang trong quá trình phát triển giao diện.",
    "color": "blue"
};

// Hàm hiển thị lên web
document.addEventListener("DOMContentLoaded", function() {
    const displayElement = document.getElementById("main-text");
    const subElement = document.getElementById("sub-text");

    if (displayElement) {
        displayElement.innerText = webContent.welcome_text;
        displayElement.style.color = webContent.color;
    }
    if (subElement) {
        subElement.innerText = webContent.sub_text;
    }
});