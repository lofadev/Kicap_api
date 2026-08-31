# Hướng dẫn cấu hình biến môi trường (`.env`)

Hướng dẫn này giúp bạn lấy và điền đầy đủ các biến môi trường cần thiết để chạy server KiCap.

## Bắt đầu nhanh

```bash
cp .env.example .env
```

Sau đó mở file `.env` và điền các giá trị theo hướng dẫn bên dưới.

---

## 1. Cấu hình cơ bản (Bắt buộc)

| Biến          | Mô tả                                                          | Giá trị mặc định                  |
| ------------- | -------------------------------------------------------------- | --------------------------------- |
| `PORT`        | Cổng chạy server                                               | `3000`                            |
| `MONGODB_URL` | Chuỗi kết nối MongoDB                                          | `mongodb://127.0.0.1:27017/kicap` |
| `APP_URL`     | URL frontend (dùng để tạo link xác thực email, reset mật khẩu) | `http://localhost:5173`           |

### MongoDB

**Cách 1 — MongoDB cục bộ (local):**

Cài MongoDB Community Server, khởi động `mongod`, sau đó dùng giá trị mặc định:

```
MONGODB_URL=mongodb://127.0.0.1:27017/kicap
```

**Cách 2 — MongoDB Atlas (cloud miễn phí):**

1. Truy cập [mongodb.com/atlas](https://www.mongodb.com/atlas) và đăng ký tài khoản.
2. Tạo một cluster miễn phí (Free Tier — M0).
3. Vào **Database** → nhấn **Connect** → chọn **Drivers**.
4. Copy chuỗi kết nối và thay `<password>` bằng mật khẩu database user:

```
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/kicap
```

> **Lưu ý:** Nhớ thêm IP hiện tại của bạn vào **Network Access** trên Atlas (hoặc cho phép `0.0.0.0/0` nếu đang phát triển).

---

## 2. Access Token & Refresh Token (Bắt buộc)

Hai chuỗi bí mật dùng để ký JWT (xác thực người dùng). Mỗi token phải là **một chuỗi hex 64 ký tự khác nhau**.

Chạy lệnh sau **2 lần**, mỗi lần lấy 1 giá trị:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

- **Lần 1** → gán cho `ACCESS_TOKEN`
- **Lần 2** → gán cho `REFRESH_TOKEN`

Ví dụ:

```
ACCESS_TOKEN=a1b2c3d4e5f6...  (64 ký tự hex)
REFRESH_TOKEN=f6e5d4c3b2a1... (64 ký tự hex khác)
```

> **Quan trọng:** Không dùng chung một giá trị cho cả hai token, và không để lộ các giá trị này.

---

## 3. Email — Mailer (Tùy chọn)

Dùng để gửi email **xác thực tài khoản** khi đăng ký và **đặt lại mật khẩu**. Nếu để trống, server vẫn chạy bình thường nhưng hai tính năng trên sẽ không hoạt động.

| Biến           | Mô tả                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| `MAILER_EMAIL` | Địa chỉ email dùng để gửi (vd: `yourname@gmail.com`)                   |
| `MAILER_PASS`  | Mật khẩu ứng dụng (App Password), **không phải** mật khẩu Gmail thường |

### Cách tạo App Password cho Gmail

1. Đăng nhập [myaccount.google.com](https://myaccount.google.com).
2. Vào **Security** (Bảo mật) → bật **2-Step Verification** (Xác minh 2 bước) nếu chưa bật.
3. Sau khi bật 2FA, truy cập [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. Chọn **Select app** → "Other (Custom name)" → nhập tên (vd: `kicap`) → nhấn **Generate**.
5. Google sẽ hiển thị mật khẩu 16 ký tự (dạng `xxxx xxxx xxxx xxxx`).
6. Copy mật khẩu đó (bỏ khoảng trắng) và điền vào `MAILER_PASS`.

```
MAILER_EMAIL=yourname@gmail.com
MAILER_PASS=abcdefghijklmnop
```

---

## 4. Firebase (Tùy chọn)

Dùng cho tính năng **upload hình ảnh** trên trang quản trị (admin). Nếu để trống, server vẫn chạy nhưng không thể upload ảnh.

| Biến                         | Tương ứng trong firebaseConfig |
| ---------------------------- | ------------------------------ |
| `FIREBASE_APIKEY`            | `apiKey`                       |
| `FIREBASE_AUTHDOMAIN`        | `authDomain`                   |
| `FIREBASE_DATABASEURL`       | `databaseURL`                  |
| `FIREBASE_PROJECTID`         | `projectId`                    |
| `FIREBASE_STORAGEBUCKET`     | `storageBucket`                |
| `FIREBASE_MESSAGINGSENDERID` | `messagingSenderId`            |
| `FIREBASE_APPID`             | `appId`                        |
| `FIREBASE_MEASUREMENTID`     | `measurementId`                |

### Các bước lấy Firebase config

1. Truy cập [console.firebase.google.com](https://console.firebase.google.com).
2. Nhấn **Add project** → đặt tên (vd: `kicap`) → hoàn tất tạo project.
3. Trong project, vào **⚙️ Project Settings** (Cài đặt dự án).
4. Kéo xuống mục **Your apps** → nhấn biểu tượng Web (`</>`) → đặt tên app → nhấn **Register app**.
5. Firebase sẽ hiển thị đoạn `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSy...', // → FIREBASE_APIKEY
  authDomain: 'kicap.firebaseapp.com', // → FIREBASE_AUTHDOMAIN
  databaseURL: 'https://kicap-default-rtdb.firebaseio.com', // → FIREBASE_DATABASEURL
  projectId: 'kicap', // → FIREBASE_PROJECTID
  storageBucket: 'kicap.appspot.com', // → FIREBASE_STORAGEBUCKET
  messagingSenderId: '123456789', // → FIREBASE_MESSAGINGSENDERID
  appId: '1:123456789:web:abc', // → FIREBASE_APPID
  measurementId: 'G-XXXXXXXXXX', // → FIREBASE_MEASUREMENTID
};
```

6. Copy từng giá trị tương ứng vào file `.env`.

### Bật Firebase Storage (để upload ảnh)

1. Trong Firebase Console, vào **Build** → **Storage**.
2. Nhấn **Get started** → chọn chế độ (test mode khi đang phát triển) → chọn region → **Done**.
3. Đảm bảo **Storage Rules** cho phép đọc/ghi (test mode mặc định cho phép trong 30 ngày).

---

## 5. VNPay (Tùy chọn)

Dùng cho tính năng **thanh toán trực tuyến**. Nếu để trống, server vẫn chạy nhưng không thể thanh toán qua VNPay.

| Biến             | Mô tả                                        |
| ---------------- | -------------------------------------------- |
| `VNP_TMNCODE`    | Mã website (Terminal Code) do VNPay cấp      |
| `VNP_HASHSECRET` | Chuỗi bí mật để tạo checksum, do VNPay cấp   |
| `VNP_URL`        | URL cổng thanh toán VNPay                    |
| `VNP_RETURNURL`  | URL frontend nhận kết quả sau khi thanh toán |

### Cách đăng ký VNPay Sandbox

1. Truy cập [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn/merchantv2/) và đăng ký tài khoản merchant sandbox.
2. Sau khi được duyệt, đăng nhập vào trang quản lý merchant.
3. Vào **Dashboard** hoặc **Thông tin tích hợp** để lấy:
   - **Mã website (TMN Code)** → điền vào `VNP_TMNCODE`
   - **Chuỗi bí mật (Hash Secret)** → điền vào `VNP_HASHSECRET`
4. Các giá trị còn lại giữ mặc định cho môi trường phát triển:

```
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURNURL=http://localhost:5173/vnpay_result
```

> **Lưu ý:** Khi triển khai production, thay `VNP_URL` bằng URL chính thức của VNPay và cập nhật `VNP_RETURNURL` thành domain thực tế.

---

## Tổng kết

| Nhóm                                | Bắt buộc? | Nếu để trống thì sao?                          |
| ----------------------------------- | --------- | ---------------------------------------------- |
| Cơ bản (PORT, MONGODB_URL, APP_URL) | ✅ Có     | Server không chạy được                         |
| Token (ACCESS_TOKEN, REFRESH_TOKEN) | ✅ Có     | Xác thực người dùng không hoạt động            |
| Mailer (MAILER_EMAIL, MAILER_PASS)  | ❌ Không  | Không gửi được email xác thực & reset mật khẩu |
| Firebase (FIREBASE\_\*)             | ❌ Không  | Không upload được ảnh trên trang admin         |
| VNPay (VNP\_\*)                     | ❌ Không  | Không thanh toán trực tuyến được               |

> Để chạy server ở mức cơ bản nhất cho việc phát triển, bạn chỉ cần điền **nhóm 1 (Cơ bản)** và **nhóm 2 (Token)**.
