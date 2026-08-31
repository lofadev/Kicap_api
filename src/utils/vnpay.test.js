import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildVnpaySignature, sortObject, verifyVnpaySignature } from './vnpay.js';

// VNPay ký trên chuỗi query đã sắp xếp theo thứ tự alphabet của tên tham số.
// Đổi bất kỳ ký tự nào trong chuỗi đó là chữ ký phải khác đi.
const SECRET = 'RAOEXHYVSDDIIENYWSLDIIZTANRUJHFA';

const paramsOf = (overrides = {}) => ({
  vnp_Amount: '10000000',
  vnp_Command: 'pay',
  vnp_CreateDate: '20260831185704',
  vnp_CurrCode: 'VND',
  vnp_OrderInfo: 'Thanh toan hoa don',
  vnp_ResponseCode: '00',
  vnp_TmnCode: 'DEMOV210',
  vnp_TxnRef: 'ORDER1',
  vnp_Version: '2.1.0',
  ...overrides,
});

describe('sortObject', () => {
  it('sorts keys alphabetically', () => {
    assert.deepEqual(Object.keys(sortObject({ b: '2', a: '1', c: '3' })), ['a', 'b', 'c']);
  });

  // VNPay dùng dấu + cho khoảng trắng, không phải %20. Sai chỗ này là sai chữ ký.
  it('encodes spaces as + rather than %20', () => {
    assert.equal(sortObject({ vnp_OrderInfo: 'Thanh toan hoa don' }).vnp_OrderInfo, 'Thanh+toan+hoa+don');
  });
});

describe('buildVnpaySignature', () => {
  it('returns a 128-character SHA512 hex digest', () => {
    const signature = buildVnpaySignature(paramsOf(), SECRET);
    assert.match(signature, /^[0-9a-f]{128}$/);
  });

  it('is stable for the same input', () => {
    assert.equal(buildVnpaySignature(paramsOf(), SECRET), buildVnpaySignature(paramsOf(), SECRET));
  });

  it('ignores the order the keys are supplied in', () => {
    const forwards = paramsOf();
    const backwards = Object.fromEntries(Object.entries(forwards).reverse());
    assert.equal(buildVnpaySignature(forwards, SECRET), buildVnpaySignature(backwards, SECRET));
  });

  it('changes when any value changes', () => {
    assert.notEqual(
      buildVnpaySignature(paramsOf(), SECRET),
      buildVnpaySignature(paramsOf({ vnp_Amount: '10000001' }), SECRET)
    );
  });
});

describe('verifyVnpaySignature', () => {
  const signed = (overrides = {}) => {
    const params = paramsOf(overrides);
    return { ...params, vnp_SecureHash: buildVnpaySignature(params, SECRET) };
  };

  it('accepts a signature it just produced', () => {
    assert.equal(verifyVnpaySignature(signed(), SECRET), true);
  });

  // VNPay gửi kèm vnp_SecureHashType nhưng tham số này không nằm trong chuỗi ký.
  it('accepts a payload carrying vnp_SecureHashType', () => {
    assert.equal(verifyVnpaySignature({ ...signed(), vnp_SecureHashType: 'SHA512' }, SECRET), true);
  });

  it('rejects a payload whose amount was tampered with', () => {
    assert.equal(verifyVnpaySignature({ ...signed(), vnp_Amount: '1' }, SECRET), false);
  });

  it('rejects a payload whose response code was flipped to success', () => {
    assert.equal(verifyVnpaySignature({ ...signed({ vnp_ResponseCode: '24' }), vnp_ResponseCode: '00' }, SECRET), false);
  });

  it('rejects a signature made with a different secret', () => {
    assert.equal(verifyVnpaySignature(signed(), 'ANOTHERSECRETANOTHERSECRET123456'), false);
  });

  it('rejects a payload with no signature at all', () => {
    assert.equal(verifyVnpaySignature(paramsOf(), SECRET), false);
  });

  it('rejects a signature of the wrong length instead of throwing', () => {
    assert.equal(verifyVnpaySignature({ ...paramsOf(), vnp_SecureHash: 'abc' }, SECRET), false);
  });
});
