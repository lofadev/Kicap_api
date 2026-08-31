import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// Phải gán trước khi import controller, vì controller đọc process.env ngay khi chạy.
process.env.VNP_TMNCODE = 'TESTTMN1';
process.env.VNP_HASHSECRET = 'RAOEXHYVSDDIIENYWSLDIIZTANRUJHFA';
process.env.VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
process.env.VNP_RETURNURL = 'http://localhost:5173/vnpay_result';

const { default: CheckoutController } = await import('./CheckoutController.js');
const { default: CheckoutRouter } = await import('../routes/CheckoutRouter.js');
const { buildVnpaySignature, verifyVnpaySignature } = await import('../utils/vnpay.js');

// Test chạy không có MongoDB. Mặc định mongoose đệm lệnh 10 giây rồi mới báo lỗi;
// rút ngắn để nhánh "đã qua kiểm tra chữ ký" thất bại nhanh thay vì treo test.
const { default: mongoose } = await import('mongoose');
mongoose.set('bufferTimeoutMS', 200);

const routeMethods = (path) => {
  const layer = CheckoutRouter.stack.find((l) => l.route?.path === path);
  return layer ? Object.keys(layer.route.methods).sort() : [];
};

const mockRes = () => {
  const res = { body: undefined, statusCode: 200 };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

const paymentRequest = (body = {}) => ({
  headers: { 'x-forwarded-for': '13.160.92.202' },
  connection: { remoteAddress: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } },
  socket: { remoteAddress: '127.0.0.1' },
  body: { orderID: 'ORDER1', amount: 100000, orderDescription: 'Thanh toan hoa don', ...body },
});

describe('CheckoutRouter', () => {
  // VNPay gọi IPN bằng GET (tài liệu: "Phương thức: GET"). Đăng ký POST thì
  // callback rơi vào 404 và đơn hàng không bao giờ được đánh dấu đã trả tiền.
  it('exposes the IPN callback over GET, the method VNPay actually uses', () => {
    assert.deepEqual(routeMethods('/vnpay_ipn'), ['get']);
  });

  // client/src/pages/transaction_result/TransactionResult.jsx POST tới đây
  // với query params VNPay trả về trên URL redirect.
  it('exposes a separate return endpoint over POST for the browser redirect', () => {
    assert.deepEqual(routeMethods('/vnpay_return'), ['post']);
  });

  it('still exposes payment URL creation over POST', () => {
    assert.deepEqual(routeMethods('/create_payment_url'), ['post']);
  });
});

describe('createPaymentUrl', () => {
  it('builds a URL carrying every parameter VNPay requires', () => {
    const res = mockRes();
    CheckoutController.createPaymentUrl(paymentRequest(), res);
    const url = new URL(res.body.paymentUrl);
    for (const required of [
      'vnp_Version', 'vnp_Command', 'vnp_TmnCode', 'vnp_Amount', 'vnp_CurrCode',
      'vnp_TxnRef', 'vnp_OrderInfo', 'vnp_OrderType', 'vnp_Locale',
      'vnp_ReturnUrl', 'vnp_IpAddr', 'vnp_CreateDate', 'vnp_SecureHash',
    ]) {
      assert.ok(url.searchParams.has(required), `thiếu tham số ${required}`);
    }
  });

  // VNPay nhận số tiền theo đơn vị nhỏ nhất, tức là VND nhân 100.
  it('multiplies the amount by 100', () => {
    const res = mockRes();
    CheckoutController.createPaymentUrl(paymentRequest({ amount: 100000 }), res);
    assert.equal(res.body.vnp_Params.vnp_Amount, '10000000');
  });

  // Ký trên tham số đã mã hoá sẵn sẽ escape hai lần (dấu + thành %2B) và VNPay
  // trả về mã 97. Chữ ký phải verify được bằng chính các tham số đi kèm nó.
  it('produces a signature that verifies against the parameters it ships with', () => {
    const res = mockRes();
    CheckoutController.createPaymentUrl(paymentRequest(), res);
    const url = new URL(res.body.paymentUrl);
    const fromUrl = Object.fromEntries(url.searchParams.entries());
    assert.equal(verifyVnpaySignature(fromUrl, process.env.VNP_HASHSECRET), true);
  });

  it('signs the URL with a 128-character SHA512 digest', () => {
    const res = mockRes();
    CheckoutController.createPaymentUrl(paymentRequest(), res);
    assert.match(res.body.vnp_Params.vnp_SecureHash, /^[0-9a-f]{128}$/);
  });

  it('omits vnp_BankCode when the caller did not choose a bank', () => {
    const res = mockRes();
    CheckoutController.createPaymentUrl(paymentRequest(), res);
    assert.equal(res.body.vnp_Params.vnp_BankCode, undefined);
  });

  it('includes vnp_BankCode when the caller chose one', () => {
    const res = mockRes();
    CheckoutController.createPaymentUrl(paymentRequest({ bankCode: 'NCB' }), res);
    assert.equal(res.body.vnp_Params.vnp_BankCode, 'NCB');
  });
});

describe('vnpayIpn', () => {
  // VNPay chờ đúng hai khoá RspCode/Message. Trả sai khoá thì VNPay coi như
  // chưa nhận được và gọi lại nhiều lần.
  it('answers a tampered payload with checksum failure in VNPay format', async () => {
    const res = mockRes();
    await CheckoutController.vnpayIpn({ query: { vnp_TxnRef: 'ORDER1', vnp_SecureHash: 'deadbeef' } }, res);
    assert.deepEqual(res.body, { RspCode: '97', Message: 'Checksum failed' });
  });

  it('answers a payload with no signature rather than hanging', async () => {
    const res = mockRes();
    await CheckoutController.vnpayIpn({ query: { vnp_TxnRef: 'ORDER1' } }, res);
    assert.equal(res.body.RspCode, '97');
  });

  it('reads parameters from the query string, not the body', async () => {
    const res = mockRes();
    const params = { vnp_TxnRef: 'ORDER1', vnp_ResponseCode: '00' };
    const query = { ...params, vnp_SecureHash: buildVnpaySignature(params, process.env.VNP_HASHSECRET) };
    // Chữ ký hợp lệ nên không được rơi vào nhánh 97; đơn không tồn tại trong DB
    // nên phải là 01, và tuyệt đối không được treo.
    await CheckoutController.vnpayIpn({ query, body: {} }, res);
    assert.notEqual(res.body.RspCode, '97');
  });
});

describe('vnpayReturn', () => {
  // Contract này client đang dựa vào: TransactionResult.jsx đọc result.code và
  // result.message. Đổi tên khoá là trang kết quả giao dịch hỏng.
  it('answers a tampered payload in the shape the client reads', async () => {
    const res = mockRes();
    await CheckoutController.vnpayReturn({ body: { vnp_TxnRef: 'ORDER1', vnp_SecureHash: 'deadbeef' } }, res);
    assert.equal(res.body.code, '97');
    assert.equal(typeof res.body.message, 'string');
  });

  it('never reports success for an unsigned payload claiming vnp_ResponseCode 00', async () => {
    const res = mockRes();
    await CheckoutController.vnpayReturn({ body: { vnp_TxnRef: 'ORDER1', vnp_ResponseCode: '00' } }, res);
    assert.notEqual(res.body.code, '00');
  });
});
