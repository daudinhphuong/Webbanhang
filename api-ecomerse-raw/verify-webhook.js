import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Script verify webhook đã cập nhật order thành công
async function verifyWebhookWorking() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Lấy order mới nhất
        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        const latestOrder = await Order.findOne({ deletedAt: null })
            .sort({ createdAt: -1 })
            .lean();

        if (!latestOrder) {
            console.error('❌ Không tìm thấy order nào!');
            console.log('Hãy tạo đơn hàng trước tại: http://localhost:5173');
            process.exit(1);
        }

        const orderId = latestOrder._id.toString();
        const amount = Math.round(latestOrder.finalAmount || latestOrder.totalAmount || 100000);

        console.log('📦 Order hiện tại:');
        console.log('   ID:', orderId);
        console.log('   Status TRƯỚC khi test:', latestOrder.status);
        console.log('   Amount:', amount, 'VND');
        console.log('   PaymentInfo:', latestOrder.paymentInfo ? 'Có' : 'Chưa có');
        console.log('');

        // Test webhook
        const webhookData = {
            id: Math.floor(Math.random() * 100000),
            gateway: 'MBBank',
            transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            accountNumber: 'VQRQAFQTK9276',
            code: null,
            content: `ORDER_${orderId}`,
            transferType: 'in',
            transferAmount: amount,
            accumulated: 5000000,
            subAccount: null,
            referenceCode: `MBVCB.${Math.floor(Math.random() * 10000000)}`,
            description: 'Test webhook'
        };

        console.log('🚀 Sending webhook...');
        const response = await axios.post(
            'http://localhost:3000/api/v1/payment/sepay-callback',
            webhookData,
            {
                headers: {
                    'Authorization': 'Apikey spsk_live_N2b1WtqgwRuL2BAQsoMYR5UP9KLRGpm',
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Webhook Response:');
        console.log('   Status:', response.status);
        console.log('   Message:', response.data.message);
        if (response.data.data) {
            console.log('   Order Status:', response.data.data.status);
            console.log('   Transaction ID:', response.data.data.transactionId);
        }
        console.log('');

        // Query lại order để verify
        console.log('🔍 Checking database...');
        const updatedOrder = await Order.findOne({ _id: orderId }).lean();

        console.log('📊 Order SAU khi webhook:');
        console.log('   Status:', updatedOrder.status);
        console.log('   PaymentInfo:', updatedOrder.paymentInfo ? '✅ Có' : '❌ Không');

        if (updatedOrder.paymentInfo) {
            console.log('   - Transaction ID:', updatedOrder.paymentInfo.sepayTransactionId);
            console.log('   - Gateway:', updatedOrder.paymentInfo.gateway);
            console.log('   - Amount:', updatedOrder.paymentInfo.transferAmount);
            console.log('   - Paid At:', updatedOrder.paymentInfo.paidAt);
        }
        console.log('');

        // Kết luận
        if (updatedOrder.status === 'completed' && updatedOrder.paymentInfo) {
            console.log('🎉 SUCCESS! Webhook hoạt động hoàn hảo!');
            console.log('');
            console.log('✅ Order đã được cập nhật:');
            console.log('   - Status: pending → completed');
            console.log('   - PaymentInfo: đã lưu thông tin giao dịch');
            console.log('');
            console.log('🚀 Bước tiếp theo:');
            console.log('   1. Cấu hình webhook URL trên SePay dashboard');
            console.log('   2. URL: https://apocopic-damien-abruptly.ngrok-free.dev/api/v1/payment/sepay-callback');
            console.log('   3. Test với giao dịch thật (quét QR và chuyển tiền)');
        } else {
            console.log('⚠️  Có vấn đề!');
            console.log('   Status:', latestOrder.status, '→', updatedOrder.status);
            console.log('   PaymentInfo:', updatedOrder.paymentInfo ? 'Có' : 'Không');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    } finally {
        await mongoose.disconnect();
    }
}

verifyWebhookWorking();
