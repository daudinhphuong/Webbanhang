# Hướng Dẫn Cấu Hình Webhook Trên SePay Dashboard

## Vấn Đề Hiện Tại

Bạn đã chuyển tiền thật nhưng order vẫn ở trạng thái `pending`. Điều này có nghĩa **SePay chưa gửi webhook** đến server của bạn.

## Nguyên Nhân Có Thể

1. ❌ **Webhook URL chưa được cấu hình trên SePay**
2. ❌ **Nội dung chuyển khoản không có Order ID**
3. ❌ **Ngrok URL đã thay đổi** (nếu bạn restart ngrok)

## Giải Pháp: Cấu Hình Webhook Trên SePay

### Bước 1: Đăng Nhập SePay Dashboard

1. Truy cập: **https://my.sepay.vn**
2. Đăng nhập với tài khoản của bạn

### Bước 2: Tìm Phần Cấu Hình Webhook

Tùy theo giao diện SePay, webhook có thể ở:
- **Cài đặt** → **Webhook**
- **Tài khoản** → **API & Webhook**
- **Cấu hình** → **Thông báo**
- **Settings** → **Webhook Configuration**

### Bước 3: Nhập Webhook URL

**Webhook URL của bạn:**
```
https://apocopic-damien-abruptly.ngrok-free.dev/api/v1/payment/sepay-callback
```

**Lưu ý quan trọng:**
- ✅ Phải có `https://` ở đầu
- ✅ Phải có `/api/v1/payment/sepay-callback` ở cuối
- ✅ Không có dấu `/` ở cuối URL
- ⚠️ Nếu bạn restart ngrok, URL này sẽ THAY ĐỔI!

### Bước 4: Lưu Cấu Hình

1. Click **Lưu** / **Save** / **Cập nhật**
2. SePay có thể test webhook URL (đợi vài giây)
3. Nếu thành công, status sẽ hiển thị "Active" hoặc "Enabled"

### Bước 5: Kiểm Tra Webhook Logs (Nếu Có)

Một số dashboard SePay có tính năng xem webhook logs:
- Kiểm tra xem SePay đã gửi webhook chưa
- Xem response status (200 = thành công)
- Xem error message nếu có

## Kiểm Tra Nội Dung Chuyển Khoản

### ❌ SAI - Thiếu Order ID
```
Thanh toan don hang
```

### ✅ ĐÚNG - Có Order ID
```
ORDER_0e778c1e-8d3c-4bb0-a3c0-a779468ced60
```

**Lưu ý:** 
- QR code đã tự động thêm Order ID vào nội dung
- NHƯNG một số ngân hàng có thể cho phép user sửa nội dung
- Nếu bạn sửa nội dung và xóa Order ID → Webhook sẽ không nhận diện được order

## Test Sau Khi Cấu Hình

### Test 1: Tạo Đơn Hàng Mới

1. Mở: http://localhost:5173
2. Thêm sản phẩm vào giỏ hàng
3. Checkout → Chọn "QR CODE"
4. Click "PLACE ORDER"
5. **LƯU LẠI ORDER ID** hiển thị trong QR modal

### Test 2: Chuyển Tiền Nhỏ

1. Quét QR code
2. **KHÔNG SỬA** nội dung chuyển khoản
3. Chuyển đúng số tiền (hoặc nhiều hơn)
4. Xác nhận giao dịch

### Test 3: Kiểm Tra Kết Quả

Sau 5-30 giây (tùy ngân hàng), chạy:

```bash
cd d:\webbanhang\web\ecom\ecom\api-ecomerse-raw
node check-orders.js
```

**Kết quả mong đợi:**
```
1. Order ID: xxx
   Status: completed  ✅
   PaymentInfo: ✅
      - Transaction ID: xxx
      - Gateway: MBBank
      - Amount: xxx
```

## Troubleshooting

### Vấn Đề 1: Webhook URL Không Hợp Lệ

**Triệu chứng:** SePay báo lỗi khi lưu webhook URL

**Giải pháp:**
1. Kiểm tra ngrok có đang chạy không:
   ```bash
   # Xem processes
   tasklist | findstr ngrok
   ```
2. Nếu không chạy, start ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy URL mới và cập nhật lại trên SePay

### Vấn Đề 2: Order Vẫn Pending Sau Khi Chuyển Tiền

**Kiểm tra:**

1. **Backend có nhận webhook không?**
   - Xem terminal "npm run dev" (api-ecomerse-raw)
   - Tìm dòng: `SePay Callback received`
   - Nếu KHÔNG thấy → SePay chưa gửi webhook

2. **Nội dung chuyển khoản có đúng không?**
   - Phải có format: `ORDER_<order_id>`
   - Kiểm tra trong app ngân hàng

3. **Số tiền có đủ không?**
   - Số tiền chuyển phải >= số tiền order
   - Nếu thiếu, webhook nhận nhưng không cập nhật

### Vấn Đề 3: Ngrok URL Thay Đổi

**Triệu chứng:** Webhook hoạt động trước đó, giờ không hoạt động

**Nguyên nhân:** Bạn đã restart ngrok → URL mới

**Giải pháp:**
1. Kiểm tra ngrok URL hiện tại:
   - Mở http://localhost:4040 (ngrok web interface)
   - Hoặc xem terminal ngrok
2. Copy URL mới
3. Cập nhật lại trên SePay dashboard

**Tip:** Để tránh URL thay đổi, sử dụng ngrok paid plan hoặc deploy lên server production.

## Ngrok Web Interface

Ngrok có web interface để xem requests:

1. Mở: **http://localhost:4040**
2. Xem tab "Requests"
3. Kiểm tra xem SePay có gửi request đến webhook URL không
4. Xem request body và response

Nếu KHÔNG thấy request từ SePay → Webhook URL chưa được cấu hình đúng.

## Liên Hệ Hỗ Trợ SePay

Nếu vẫn không hoạt động sau khi cấu hình:

1. **Email:** support@sepay.vn (kiểm tra trên website)
2. **Hotline:** (Tìm trên https://sepay.vn)
3. **Live Chat:** Trên dashboard SePay (nếu có)

**Thông tin cần cung cấp:**
- Merchant ID: `SP-LIVE-DDB47656`
- Webhook URL: `https://apocopic-damien-abruptly.ngrok-free.dev/api/v1/payment/sepay-callback`
- Mô tả vấn đề: "Webhook không nhận được callback sau khi chuyển tiền"

## Checklist Hoàn Chỉnh

- [ ] Đã đăng nhập SePay dashboard
- [ ] Đã tìm thấy phần cấu hình webhook
- [ ] Đã nhập webhook URL đúng
- [ ] Đã lưu cấu hình
- [ ] Webhook status hiển thị "Active"
- [ ] Đã tạo đơn hàng mới để test
- [ ] Đã quét QR và chuyển tiền
- [ ] Đã kiểm tra backend logs
- [ ] Đã chạy `node check-orders.js` để verify
- [ ] Order status đã chuyển thành "completed"

## Kết Luận

Webhook code của bạn **hoạt động hoàn hảo** (đã test thành công).

Vấn đề hiện tại là **SePay chưa gửi webhook** đến server.

👉 **Hành động tiếp theo:** Cấu hình webhook URL trên SePay dashboard theo hướng dẫn trên.
