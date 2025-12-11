# Troubleshooting: Webhook không hoạt động với giao dịch thật

## Các bước kiểm tra

### 1. Kiểm tra Backend Logs
Xem terminal backend (api-ecomerse-raw) có nhận được request từ SePay không.

**Nếu KHÔNG thấy log webhook:**
- SePay chưa gửi webhook đến server
- Webhook URL chưa được cấu hình đúng trên SePay
- Ngrok đã bị restart (URL thay đổi)

**Nếu CÓ log webhook:**
- Kiểm tra response status (200, 401, 500?)
- Kiểm tra error message

### 2. Kiểm tra Webhook URL trên SePay

Đăng nhập https://my.sepay.vn và verify:
- Webhook URL: `https://apocopic-damien-abruptly.ngrok-free.dev/api/v1/payment/sepay-callback`
- Status: Active/Enabled
- Test webhook từ SePay dashboard (nếu có tính năng)

### 3. Kiểm tra Ngrok

```bash
# Xem ngrok có đang chạy không
# Nếu restart ngrok, URL sẽ thay đổi!
```

**Lưu ý:** Ngrok free URL thay đổi mỗi lần restart. Nếu bạn restart ngrok, phải:
1. Copy URL mới
2. Cập nhật lại trên SePay dashboard

### 4. Kiểm tra Order ID trong nội dung chuyển khoản

Khi quét QR và chuyển tiền, nội dung phải có format:
```
ORDER_<order_id>
```

Ví dụ: `ORDER_f7387146-7e8b-431d-a4d1-fcedc0dac48c`

### 5. Kiểm tra số tiền

Số tiền chuyển phải >= số tiền order. Nếu thiếu, webhook sẽ nhận nhưng KHÔNG cập nhật order.

### 6. Test thủ công

Chạy script để verify webhook endpoint vẫn hoạt động:

```bash
cd d:\webbanhang\web\ecom\ecom\api-ecomerse-raw
node test-ngrok-webhook.js
```

Nếu script này fail → Vấn đề ở ngrok/backend
Nếu script này pass → Vấn đề ở SePay configuration

## Debug Script

Chạy script này để lấy order ID mới nhất và kiểm tra:

```bash
node verify-webhook.js
```

## Checklist Debug

- [ ] Backend đang chạy (npm run dev)
- [ ] Ngrok đang chạy (ngrok http 3000)
- [ ] Webhook URL đã cấu hình trên SePay
- [ ] Webhook URL đúng (không bị thay đổi do restart ngrok)
- [ ] Đã chuyển tiền thật qua QR
- [ ] Nội dung chuyển khoản có ORDER_ID
- [ ] Số tiền chuyển >= số tiền order
- [ ] Backend logs có nhận webhook request
