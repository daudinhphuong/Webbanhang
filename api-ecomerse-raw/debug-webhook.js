import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Script debug webhook với order thật từ database
async function debugWebhookWithRealOrder() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Lấy order mới nhất từ database
        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        const latestOrder = await Order.findOne({ deletedAt: null })
            .sort({ createdAt: -1 })
            .lean();

        if (!latestOrder) {
            console.error('❌ Không tìm thấy order nào trong database!');
            console.log('\n💡 Hãy tạo đơn hàng trước:');
            console.log('   1. Mở http://localhost:5173');
            console.log('   2. Thêm sản phẩm vào giỏ hàng');
            console.log('   3. Checkout và đặt hàng');
            console.log('   4. Chạy lại script này');
            process.exit(1);
        }

        console.log('📦 Tìm thấy order:');
        console.log('   Order ID:', latestOrder._id.toString());
        console.log('   Status:', latestOrder.status);
        console.log('   Total Amount:', latestOrder.totalAmount || latestOrder.finalAmount);
        console.log('   Created:', latestOrder.createdAt);
        console.log('');

        // Tạo webhook data
        const orderId = latestOrder._id.toString();
        const amount = Math.round(latestOrder.finalAmount || latestOrder.totalAmount || 100000);

        const webhookData = {
            id: Math.floor(Math.random() * 100000) + 10000,
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
            description: 'Test webhook payment'
        };

        console.log('🚀 Sending webhook to backend...');
        console.log('📍 URL: http://localhost:3000/api/v1/payment/sepay-callback');
        console.log('💰 Amount:', amount, 'VND');
        console.log('');

        const response = await axios.post(
            'http://localhost:3000/api/v1/payment/sepay-callback',
            webhookData,
            {
                headers: {
                    'Authorization': 'Apikey spsk_live_N2b1WtqgwRuL2BAQsoMYR5UP9KLRGpm',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('✅ Webhook response:');
        console.log('   Status:', response.status);
        console.log('   Response:', JSON.stringify(response.data, null, 2));
        console.log('');

        // Kiểm tra lại order trong database
        console.log('🔍 Checking order status in database...');
        const updatedOrder = await Order.findById(orderId).lean();

        console.log('📊 Order status after webhook:');
        console.log('   Status:', updatedOrder.status);
        console.log('   Payment Info:', updatedOrder.paymentInfo ? '✅ Có' : '❌ Không có');

        if (updatedOrder.paymentInfo) {
            console.log('   Transaction ID:', updatedOrder.paymentInfo.sepayTransactionId);
            console.log('   Gateway:', updatedOrder.paymentInfo.gateway);
            console.log('   Amount:', updatedOrder.paymentInfo.transferAmount);
            console.log('   Paid At:', updatedOrder.paymentInfo.paidAt);
        }
        console.log('');

        if (updatedOrder.status === 'completed') {
            console.log('🎉 SUCCESS! Order status đã được cập nhật thành "completed"!');
        } else {
            console.log('⚠️  WARNING: Order status vẫn là "' + updatedOrder.status + '"');
            console.log('');
            console.log('💡 Có thể do:');
            console.log('   1. Số tiền không khớp (required: ' + (latestOrder.finalAmount || latestOrder.totalAmount) + ', sent: ' + amount + ')');
            console.log('   2. Backend có lỗi (check console log backend)');
            console.log('   3. Order ID không match');
        }

    } catch (error) {
        console.error('\n❌ Error occurred!');

        if (error.response) {
            console.error('HTTP Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
            console.error('');

            if (error.response.status === 401) {
                console.error('💡 API Key không đúng!');
                console.error('   Check file .env có SEPAY_API_KEY chưa?');
            } else if (error.response.status === 404) {
                console.error('💡 Endpoint không tồn tại!');
                console.error('   Backend có đang chạy không?');
            } else if (error.response.status === 500) {
                console.error('💡 Backend error!');
                console.error('   Check console log của backend');
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Error:', error.message);
            console.error('');
            console.error('💡 Backend không chạy!');
            console.error('   Chạy: cd api-ecomerse-raw && npm run dev');
        } else {
            console.error('Error:', error.message);
            console.error(error.stack);
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

debugWebhookWithRealOrder();
