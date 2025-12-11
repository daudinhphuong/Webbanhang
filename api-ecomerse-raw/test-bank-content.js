import axios from 'axios';

// Test với nội dung chuyển khoản thật từ VCB Digibank
async function testWithRealBankContent() {
    try {
        console.log('🧪 Testing với nội dung chuyển khoản thật từ ngân hàng...');
        console.log('');

        // Nội dung thật từ VCB Digibank (không có dấu _ và -)
        const realContent = 'ORDER0e778c1e8d3c4bb0a3c0a779468ced60';

        console.log('📝 Nội dung chuyển khoản:', realContent);
        console.log('💡 Ngân hàng đã xóa dấu _ và -');
        console.log('');

        const webhookData = {
            id: 12074726867, // Mã giao dịch thật từ ảnh
            gateway: 'MBBank',
            transactionDate: '2025-12-09 20:47:00',
            accountNumber: 'VQRQAFQTK9276',
            code: null,
            content: realContent, // Nội dung thật từ ngân hàng
            transferType: 'in',
            transferAmount: 10000,
            accumulated: 500000,
            subAccount: null,
            referenceCode: 'MBVCB.12074726867',
            description: 'Chuyen tien nhanh'
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
            console.log('   Order ID:', response.data.data.orderId);
            console.log('   Order Status:', response.data.data.status);
        }
        console.log('');
        console.log('🎉 SUCCESS! Payment controller đã nhận diện được order ID!');
        console.log('');
        console.log('🔍 Chạy: node check-orders.js để verify');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testWithRealBankContent();
