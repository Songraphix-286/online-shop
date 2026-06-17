# Online Shop - Web Bán Hàng

Một website bán hàng đơn giản nhưng hoàn chỉnh, dễ sử dụng cho người mới bắt đầu.

## Tính năng

✅ Danh sách sản phẩm  
✅ Giỏ hàng  
✅ Thanh toán  
✅ Quản lý đơn hàng  
✅ Tìm kiếm sản phẩm  
✅ Responsive (dùng được trên điện thoại)

## Cài đặt

### 1. Cài đặt Node.js
- Tải từ: https://nodejs.org/ (chọn phiên bản LTS)
- Cài đặt bình thường

### 2. Tải code về
```bash
git clone https://github.com/Songraphix-286/online-shop.git
cd online-shop
```

### 3. Cài đặt thư viện
```bash
npm install
```

### 4. Chạy website
```bash
npm start
```

### 5. Mở trình duyệt
- Vào: http://localhost:3000

## Cấu trúc thư mục

```
online-shop/
├── public/           # File HTML, CSS, JS cho frontend
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── admin.html
├── server.js         # Backend Node.js
├── database.db       # Database SQLite
└── package.json
```

## Sử dụng

### Khách hàng
1. Xem sản phẩm ở trang chủ
2. Thêm sản phẩm vào giỏ
3. Thanh toán
4. Xem lịch sử đơn hàng

### Quản lý (Admin)
- Vào: http://localhost:3000/admin.html
- Thêm/Sửa/Xóa sản phẩm
- Xem đơn hàng

## Mật khẩu Admin
- Username: `admin`
- Password: `123456`

---

Chúc bạn thành công! 🎉