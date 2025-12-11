import axios from 'axios';

// Test với order #2 vẫn pending
async function testOrder2() {
    try {
        // Order #2 từ check-orders.js
        const orderId = '865f6860-e2ee-487d-b73e-272aaa952a0e';

        // Simulate nội dung từ ngân hàng (không có dấu _ và -)
        const bankContent = 'ORDER865f6860e2ee487db73e272aaa952a0e';

        console.log('🧪 Testing với Order #2 (vẫn pending)...');
        console.log('📦 Order ID:', orderId);
        console.log('📝 Bank Content:', bankContent);
        console.log('💡 Ngân hàng xóa dấu _ và -');
        console.log('');

        const webhookData = {
            id: Math.floor(Math.random() * 100000),
            gateway: 'MBBank',
            transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            accountNumber: 'VQRQAFQTK9276',
            code: null,
            content: bankContent, // Nội dung không có dấu _ và -
            transferType: 'in',
            transferAmount: 10000,
            accumulated: 500000,
            subAccount: null,
            referenceCode: `MBVCB.${Math.floor(Math.random() * 10000000)}`,
            description: 'Test'
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

        console.log('✅ Response:');
        console.log('   Status:', response.status);
        console.log('   Message:', response.data.message);
        if (response.data.data) {
            console.log('   Parsed Order ID:', response.data.data.orderId);
            console.log('   Order Status:', response.data.data.status);
        }
        console.log('');

        if (response.data.message === 'Payment processed successfully') {
            console.log('🎉 SUCCESS! Webhook đã nhận diện order ID từ nội dung ngân hàng!');
            console.log('');
            console.log('✅ Payment controller bây giờ có thể xử lý:');
            console.log('   - ORDER_xxx-xxx-xxx (format chuẩn)');
            console.log('   - ORDERxxxxxxxxxx (ngân hàng xóa dấu)');
        } else {
            console.log('⚠️  Order not found - có thể đã được xử lý trước đó');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testOrder2();
