import querystring from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import { sortObject } from '../utils';

const createPaymentUrl = (req, res, next) => {
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURNURL;

  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');
  const orderId = '2222';

  const amount = req.body.amount;
  const bankCode = req.body.bankCode || '';
  const orderInfo = req.body.orderDescription;
  const orderType = req.body.orderType;
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
  vnp_Params['vnp_IpAddr'] = '127.0.0.1';
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

const vnpayIpn = (req, res, next) => {
  var vnp_Params = req.query;
  var secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  var config = require('config');
  var secretKey = config.get('vnp_HashSecret');
  var querystring = require('qs');

  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require('crypto');
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    var orderId = vnp_Params['vnp_TxnRef'];
    var rspCode = vnp_Params['vnp_ResponseCode'];
    //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
    res.status(200).json({ RspCode: '00', Message: 'success' });
  } else {
    res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
  }
};

const CheckoutController = { createPaymentUrl, vnpayIpn, vnpayReturn };

export default CheckoutController;

// http://localhost:5173/thanks?page=1&vnp_Amount=10000000&vnp_BankCode=NCB&vnp_BankTranNo=VNP14411025&vnp_CardType=ATM&vnp_OrderInfo=test&vnp_PayDate=20240512001526&vnp_ResponseCode=00&vnp_SecureHash=1ffac42fdcf60a59c7ce9545b80bd5d71f3799191500caad04910ab32af6b72f97539d19a666a3872d55d6de617a8e50884313694844adeae319dd0755549f05&vnp_TmnCode=YIE9JOMN&vnp_TransactionNo=14411025&vnp_TransactionStatus=00&vnp_TxnRef=2222
