import axios from 'axios';

async function testWebhook() {
    try {
        // BƯỚC 1: Thay YOUR_ORDER_ID bằng ID đơn hàng thật từ database
        // Cách lấy: 
        // 1. Mở frontend: http://localhost:5173
        // 2. Thêm sản phẩm vào giỏ hàng và đặt hàng
        // 3. Mở MongoDB Compass hoặc check console log để lấy Order ID
        // 4. Copy Order ID và paste vào dưới đây
        const orderId = 'YOUR_ORDER_ID'; // Ví dụ: '674d8e9f1234567890abcdef'

        const webhookData = {
            id: 92704,
            gateway: 'MBBank',
            transactionDate: '2025-12-09 18:30:00',
            accountNumber: 'VQRQAFQTK9276',
            code: null,
            content: `ORDER_${orderId}`, // Quan trọng: phải có ORDER_ID
            transferType: 'in',
            transferAmount: 1000000, // 1 triệu VND
            accumulated: 5000000,
            subAccount: null,
            referenceCode: 'MBVCB.3278907687',
            description: 'Thanh toan don hang'
        };

        console.log('🚀 Sending webhook test...');
        console.log('📦 Order ID:', orderId);
        console.log('💰 Amount:', webhookData.transferAmount, 'VND');

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

        console.log('\n✅ Webhook test successful!');
        console.log('📄 Response:', JSON.stringify(response.data, null, 2));
        console.log('\n💡 Bây giờ kiểm tra database xem order đã chuyển status thành "completed" chưa');
    } catch (error) {
        console.error('\n❌ Webhook test failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        console.log('\n💡 Kiểm tra:');
        console.log('   1. Backend có đang chạy ở port 3000 không?');
        console.log('   2. Order ID có đúng không?');
        console.log('   3. API Key có đúng không?');
    }
}

testWebhook();
