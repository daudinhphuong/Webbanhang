import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Script kiểm tra order mới nhất sau khi chuyển tiền
async function checkLatestOrder() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        // Lấy 3 orders mới nhất
        const orders = await Order.find({ deletedAt: null })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        if (!orders || orders.length === 0) {
            console.log('❌ Không có order nào trong database');
            return;
        }

        console.log(`📦 Tìm thấy ${orders.length} orders gần đây:\n`);

        orders.forEach((order, index) => {
            console.log(`${index + 1}. Order ID: ${order._id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Amount: ${order.finalAmount || order.totalAmount} VND`);
            console.log(`   Created: ${new Date(order.createdAt).toLocaleString('vi-VN')}`);
            console.log(`   Updated: ${new Date(order.updatedAt).toLocaleString('vi-VN')}`);
            console.log(`   Payment Method: ${order.paymentMethod || 'N/A'}`);

            if (order.paymentInfo && order.paymentInfo.sepayTransactionId) {
                console.log(`   ✅ PaymentInfo:`);
                console.log(`      - Transaction ID: ${order.paymentInfo.sepayTransactionId}`);
                console.log(`      - Gateway: ${order.paymentInfo.gateway}`);
                console.log(`      - Amount: ${order.paymentInfo.transferAmount}`);
                console.log(`      - Paid At: ${new Date(order.paymentInfo.paidAt).toLocaleString('vi-VN')}`);
            } else {
                console.log(`   ⚠️  PaymentInfo: Chưa có (webhook chưa nhận được)`);
            }
            console.log('');
        });

        // Hướng dẫn
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💡 HƯỚNG DẪN:');
        console.log('');
        console.log('Nếu order vẫn là "pending" và không có PaymentInfo:');
        console.log('');
        console.log('1️⃣  Kiểm tra SePay Dashboard:');
        console.log('   - Vào: https://my.sepay.vn');
        console.log('   - Kiểm tra webhook URL đã cấu hình chưa');
        console.log('   - URL phải là: https://apocopic-damien-abruptly.ngrok-free.dev/api/v1/payment/sepay-callback');
        console.log('');
        console.log('2️⃣  Kiểm tra nội dung chuyển khoản:');
        console.log('   - Khi quét QR, nội dung phải có: ORDER_<order_id>');
        console.log('   - Ví dụ: ORDER_' + orders[0]._id);
        console.log('');
        console.log('3️⃣  Kiểm tra backend logs:');
        console.log('   - Xem terminal "npm run dev" (api-ecomerse-raw)');
        console.log('   - Tìm dòng: "SePay Callback received"');
        console.log('   - Nếu không thấy → SePay chưa gửi webhook');
        console.log('');
        console.log('4️⃣  Test webhook thủ công:');
        console.log('   - Chạy: node verify-webhook.js');
        console.log('   - Nếu thành công → Vấn đề ở SePay config');
        console.log('   - Nếu thất bại → Vấn đề ở backend/ngrok');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkLatestOrder();
