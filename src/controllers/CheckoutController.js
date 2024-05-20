import crypto from 'crypto';
import moment from 'moment';
import querystring from 'qs';
import { sortObject } from '../utils/index.js';
import OrderService from '../services/OrderService.js';

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

  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');

  const orderId = req.body.orderID;
  const amount = req.body.amount;
  const bankCode = req.body.bankCode || '';
  const orderInfo = req.body.orderDescription;
  const orderType = req.body.orderType || 'other';
  let locale = req.body.language;
  if (!locale) locale = 'vn';

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac('sha512', secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  return res.json({ vnp_Params, paymentUrl: vnpUrl });
};

const vnpayIpn = async (req, res) => {
  let vnp_Params = req.body;
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  const secretKey = process.env.VNP_HASHSECRET;

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    if (rspCode === '00') {
      const response = await OrderService.updateIsPaid(orderId);
      if (response.status === 'OK') {
        res.status(200).json({ code: rspCode, message: 'Đặt hàng thành công' });
      }
    } else {
      await OrderService.deleteOrder(orderId);
      if (rspCode === '24') {
        res.status(200).json({
          code: rspCode,
          message: 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
        });
      }
    }
    //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
  } else {
    res
      .status(200)
      .json({ code: '97', message: 'Có lỗi! Bạn không được phép chỉnh sửa thông tin URL.' });
  }
};

const CheckoutController = { createPaymentUrl, vnpayIpn };

export default CheckoutController;
