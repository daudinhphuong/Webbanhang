import axios from 'axios';

// Test webhook với order ID thật từ database
async function testWithRealOrderId() {
    try {
        // Thay ORDER_ID này bằng order ID mới nhất
        const orderId = '0e778c1e-8d3c-4bb0-a3c0-a779468ced60'; // Order #1 từ check-orders.js

        console.log('🧪 Testing webhook với order thật...');
        console.log('📦 Order ID:', orderId);
        console.log('');

        const webhookData = {
            id: Math.floor(Math.random() * 100000),
            gateway: 'MBBank',
            transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            accountNumber: 'VQRQAFQTK9276',
            code: null,
            content: `ORDER_${orderId}`, // Nội dung giống như khi quét QR
            transferType: 'in',
            transferAmount: 10000, // Đúng số tiền order
            accumulated: 500000,
            subAccount: null,
            referenceCode: `MBVCB.${Math.floor(Math.random() * 10000000)}`,
            description: 'Test webhook with real order'
        };

        console.log('📤 Sending webhook data:');
        console.log('   Content:', webhookData.content);
        console.log('   Amount:', webhookData.transferAmount, 'VND');
        console.log('');

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

        console.log('✅ Response:');
        console.log('   Status:', response.status);
        console.log('   Message:', response.data.message);
        if (response.data.data) {
            console.log('   Order Status:', response.data.data.status);
        }
        console.log('');
        console.log('🔍 Bây giờ chạy: node check-orders.js');
        console.log('   Order #1 phải chuyển thành "completed"!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testWithRealOrderId();
