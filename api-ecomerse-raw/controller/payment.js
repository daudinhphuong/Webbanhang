import Order from '../models/Order.js';

export const sepayCallback = async (req, res) => {
  try {
    // Lấy API key từ header
    const apiKey = req.headers.authorization?.replace('Apikey ', '');

    // Kiểm tra API key (bạn nên lưu API key trong environment variables)
    const expectedApiKey = process.env.SEPAY_API_KEY || 'YOUR_SEPAY_API_KEY';

    if (!apiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid API key',
      });
    }

    const {
      id,
      gateway,
      transactionDate,
      accountNumber,
      code,
      content,
      transferType,
      transferAmount,
      accumulated,
      subAccount,
      referenceCode,
      description,
    } = req.body;

    // Log thông tin callback để debug
    console.log('SePay Callback received:', {
      id,
      gateway,
      transactionDate,
      accountNumber,
      transferType,
      transferAmount,
      content,
      referenceCode,
    });

    // Chỉ xử lý giao dịch tiền vào
    if (transferType !== 'in') {
      return res.status(200).json({
        success: true,
        message: 'Transaction type not supported',
      });
    }

    // Tìm order dựa vào content hoặc code
    // Giả sử content chứa order ID hoặc có format đặc biệt
    let orderId = null;

    // Cách 1: Nếu code chứa order ID
    if (code) {
      orderId = code;
    }

    // Cách 2: Nếu content chứa order ID (ví dụ: "Thanh toan don hang ORDER_ID")
    if (!orderId && content) {
      console.log('[DEBUG] Parsing order ID from content:', content);

      // Thử tìm với dấu gạch dưới: ORDER_xxx
      let orderIdMatch = content.match(/ORDER[_\s]?([a-zA-Z0-9\-]+)/i);

      // Nếu không tìm thấy, thử tìm ORDER liền kề với ID (ngân hàng có thể xóa dấu _ và -)
      // Ví dụ: ORDER0e778c1e8d3c4bb0a3c0a779468ced60
      if (!orderIdMatch) {
        console.log('[DEBUG] Standard pattern not found, trying bank format...');
        orderIdMatch = content.match(/ORDER([a-zA-Z0-9]{30,})/i);
        if (orderIdMatch) {
          // Thêm lại dấu gạch ngang vào UUID format
          // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
          const rawId = orderIdMatch[1];
          console.log('[DEBUG] Raw ID from bank:', rawId, 'length:', rawId.length);
          if (rawId.length === 32) {
            // Format lại thành UUID chuẩn
            orderId = `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(12, 16)}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
            console.log('[DEBUG] Formatted UUID:', orderId);
          } else {
            orderId = rawId;
          }
        }
      } else {
        orderId = orderIdMatch[1];
        console.log('[DEBUG] Order ID from standard pattern:', orderId);
      }
    }

    if (!orderId) {
      // Lưu log giao dịch không xác định được order
      console.log('Cannot identify order from payment:', { content, code });
      return res.status(200).json({
        success: true,
        message: 'Payment received but cannot identify order',
      });
    }

    // Tìm order trong database
    const order = await Order.findOne({
      _id: orderId,
      deletedAt: null,
    });

    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(200).json({
        success: true,
        message: 'Order not found',
      });
    }

    // Kiểm tra số tiền thanh toán
    if (transferAmount < order.totalAmount) {
      console.log('Payment amount insufficient:', {
        received: transferAmount,
        required: order.totalAmount,
        orderId,
      });

      // Có thể cập nhật trạng thái là "partial_paid" nếu cần
      return res.status(200).json({
        success: true,
        message: 'Payment amount insufficient',
      });
    }

    // Cập nhật trạng thái order thành "paid" hoặc "processing"
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'completed', // hoặc 'paid' tùy theo business logic
        paymentInfo: {
          sepayTransactionId: id,
          gateway,
          transactionDate,
          accountNumber,
          transferAmount,
          referenceCode,
          content,
          paidAt: new Date(),
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    console.log('Order payment processed successfully:', {
      orderId,
      amount: transferAmount,
      transactionId: id,
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        orderId: updatedOrder._id,
        status: updatedOrder.status,
        transactionId: id,
      },
    });
  } catch (error) {
    console.error('Error processing SePay callback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
