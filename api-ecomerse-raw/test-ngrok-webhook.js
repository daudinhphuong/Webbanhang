import axios from 'axios';

// Script để test webhook qua ngrok
async function testNgrokWebhook() {
    try {
        const ngrokUrl = 'https://apocopic-damien-abruptly.ngrok-free.dev';

        console.log('🔍 Testing webhook endpoint...');
        console.log('📍 Ngrok URL:', ngrokUrl);
        console.log('🎯 Endpoint:', `${ngrokUrl}/api/v1/payment/sepay-callback`);
        console.log('');

        // Test data giống như SePay sẽ gửi
        const webhookData = {
            id: 99999,
            gateway: 'MBBank',
            transactionDate: '2025-12-09 20:30:00',
            accountNumber: 'VQRQAFQTK9276',
            code: null,
            content: 'ORDER_test123456', // Fake order ID để test
            transferType: 'in',
            transferAmount: 100000,
            accumulated: 500000,
            subAccount: null,
            referenceCode: 'MBVCB.TEST123',
            description: 'Test webhook'
        };

        console.log('📦 Sending test webhook data:');
        console.log(JSON.stringify(webhookData, null, 2));
        console.log('');

        const response = await axios.post(
            `${ngrokUrl}/api/v1/payment/sepay-callback`,
            webhookData,
            {
                headers: {
                    'Authorization': 'Apikey spsk_live_N2b1WtqgwRuL2BAQsoMYR5UP9KLRGpm',
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true' // Skip ngrok warning page
                },
                timeout: 10000 // 10 second timeout
            }
        );

        console.log('✅ SUCCESS! Webhook responded:');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('');
        console.log('🎉 Webhook is working correctly!');

    } catch (error) {
        console.error('❌ FAILED! Webhook test failed:');
        console.error('');

        if (error.response) {
            // Server responded with error
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
            console.error('');

            if (error.response.status === 401) {
                console.error('💡 Lỗi 401 - API Key không đúng!');
                console.error('   Kiểm tra:');
                console.error('   1. File .env có SEPAY_API_KEY đúng không?');
                console.error('   2. Backend đã restart sau khi thêm API key chưa?');
            } else if (error.response.status === 404) {
                console.error('💡 Lỗi 404 - Endpoint không tồn tại!');
                console.error('   Kiểm tra:');
                console.error('   1. Route /api/v1/payment/sepay-callback đã được đăng ký chưa?');
                console.error('   2. PaymentRouter đã được import trong index.js chưa?');
            } else if (error.response.status === 500) {
                console.error('💡 Lỗi 500 - Backend error!');
                console.error('   Kiểm tra console log của backend để xem lỗi gì');
            }
        } else if (error.request) {
            // Request was made but no response
            console.error('Error:', error.message);
            console.error('');
            console.error('💡 Không nhận được response từ server!');
            console.error('   Kiểm tra:');
            console.error('   1. Backend có đang chạy không? (npm run dev)');
            console.error('   2. Ngrok có đang chạy không? (ngrok http 3000)');
            console.error('   3. Ngrok URL có đúng không?');
            console.error('   4. Firewall có block không?');
        } else {
            console.error('Error:', error.message);
        }

        console.error('');
        console.error('📋 Checklist troubleshooting:');
        console.error('   □ Backend đang chạy ở port 3000');
        console.error('   □ Ngrok đang chạy: ngrok http 3000');
        console.error('   □ Ngrok URL đúng');
        console.error('   □ File .env có SEPAY_API_KEY');
        console.error('   □ Backend đã restart sau khi thêm .env');
    }
}

testNgrokWebhook();
