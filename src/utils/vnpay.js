import crypto from 'crypto';
import qs from 'qs';

// VNPay ký trên chuỗi query đã sắp xếp theo tên tham số, với khoảng trắng mã hoá
// thành dấu + chứ không phải %20. Giữ nguyên cách mã hoá này, lệch một ký tự là
// checksum không khớp và cổng trả về mã 97.
const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
};

const buildVnpaySignature = (params, secretKey) => {
  const signData = qs.stringify(sortObject(params), { encode: false });
  return crypto.createHmac('sha512', secretKey).update(Buffer.from(signData, 'utf-8')).digest('hex');
};

// Trả về true chỉ khi chữ ký đi kèm khớp với chữ ký tính lại từ chính các tham số
// còn lại. Mọi đầu vào hỏng đều cho false thay vì ném lỗi, để handler gọi nó luôn
// trả lời được VNPay.
const verifyVnpaySignature = (params, secretKey) => {
  const received = params?.vnp_SecureHash;
  if (typeof received !== 'string' || !received) return false;

  const signedParams = { ...params };
  delete signedParams.vnp_SecureHash;
  delete signedParams.vnp_SecureHashType;

  const expected = Buffer.from(buildVnpaySignature(signedParams, secretKey), 'utf-8');
  const actual = Buffer.from(received.toLowerCase(), 'utf-8');

  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
};

export { buildVnpaySignature, sortObject, verifyVnpaySignature };
