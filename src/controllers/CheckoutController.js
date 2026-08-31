import moment from 'moment';
import qs from 'qs';
import OrderService from '../services/OrderService.js';
import { buildVnpaySignature, sortObject, verifyVnpaySignature } from '../utils/vnpay.js';

const createPaymentUrl = (req, res) => {
  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURNURL;

  const createDate = moment(new Date()).format('YYYYMMDDHHmmss');

  const orderId = req.body.orderID;
  const amount = req.body.amount;
  const bankCode = req.body.bankCode || '';
  const orderInfo = req.body.orderDescription;
  const orderType = req.body.orderType || 'other';
  const locale = req.body.language || 'vn';

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  // VNPay nhận số tiền theo đơn vị nhỏ nhất, tức là VND nhân 100.
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  // buildVnpaySignature tự sắp xếp và mã hoá tham số, nên truyền vào bản thô.
  // Mã hoá trước rồi ký lần nữa sẽ escape hai lần và làm hỏng chữ ký.
  const secureHash = buildVnpaySignature(vnp_Params, secretKey);
  const signedParams = { ...sortObject(vnp_Params), vnp_SecureHash: secureHash };
  vnpUrl += '?' + qs.stringify(signedParams, { encode: false });

  return res.json({ vnp_Params: signedParams, paymentUrl: vnpUrl });
};

// Chuyển trạng thái đơn hàng theo kết quả VNPay trả về. Dùng chung cho cả IPN
// (VNPay gọi) lẫn return URL (trình duyệt gọi) để hai đường không lệch nhau.
// Gọi lại nhiều lần với cùng một đơn là an toàn.
const applyPaymentResult = async (orderId, rspCode) => {
  if (rspCode === '00') {
    const response = await OrderService.updateIsPaid(orderId);
    return response.status;
  }
  await OrderService.deleteOrder(orderId);
  return 'CANCELLED';
};

// VNPay gọi endpoint này server-to-server bằng GET và chờ đúng hai khoá
// RspCode/Message. Mọi nhánh đều phải trả lời, nếu không VNPay sẽ gọi lại liên tục.
const vnpayIpn = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };

    if (!verifyVnpaySignature(vnp_Params, process.env.VNP_HASHSECRET)) {
      return res.json({ RspCode: '97', Message: 'Checksum failed' });
    }

    const outcome = await applyPaymentResult(vnp_Params.vnp_TxnRef, vnp_Params.vnp_ResponseCode);

    if (outcome === 'NOT_FOUND') return res.json({ RspCode: '01', Message: 'Order not found' });
    if (outcome === 'ALREADY_PAID') {
      return res.json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
    }
    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (error) {
    return res.json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// Trình duyệt bị VNPay redirect về VNP_RETURNURL, rồi client POST các tham số đó
// tới đây. Trả về hình dạng { code, message } mà client đang đọc.
//
// Endpoint này cũng cập nhật đơn hàng, không chỉ hiển thị: khi chạy local, VNPay
// không gọi được vào localhost nên IPN không bao giờ tới. Chữ ký được xác minh
// trước, nên người dùng không thể tự bịa kết quả thanh toán thành công.
const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = { ...req.body };

    if (!verifyVnpaySignature(vnp_Params, process.env.VNP_HASHSECRET)) {
      return res.json({ code: '97', message: 'Có lỗi! Bạn không được phép chỉnh sửa thông tin URL.' });
    }

    const rspCode = vnp_Params.vnp_ResponseCode;
    const outcome = await applyPaymentResult(vnp_Params.vnp_TxnRef, rspCode);

    if (rspCode === '00') {
      if (outcome === 'NOT_FOUND') {
        return res.json({ code: '01', message: 'Không tìm thấy đơn hàng tương ứng.' });
      }
      return res.json({ code: '00', message: 'Đặt hàng thành công' });
    }

    if (rspCode === '24') {
      return res.json({ code: '24', message: 'Giao dịch không thành công do: Khách hàng hủy giao dịch' });
    }
    return res.json({ code: rspCode, message: 'Giao dịch không thành công.' });
  } catch (error) {
    return res.json({ code: '99', message: 'Đã có lỗi xảy ra trong quá trình xử lý giao dịch.' });
  }
};

const CheckoutController = { createPaymentUrl, vnpayIpn, vnpayReturn };

export default CheckoutController;
