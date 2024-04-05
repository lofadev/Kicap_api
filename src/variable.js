const variable = {
  NOT_PERMISSION: {
    status: 'ERROR',
    message: 'Không có quyền truy cập.',
  },
  HAS_ERROR: {
    status: 'ERROR',
    message: 'Có lỗi!',
  },
  NOT_EMPTY: {
    status: 'ERROR',
    message: 'Không được bỏ trống.',
  },
  REQUIRE_ID: {
    status: 'ERROR',
    message: 'ID param là bắt buộc.',
  },
  ID_NOTVALID: {
    status: 'ERROR',
    message: 'ID không hợp lệ.',
  },
  NO_DATA_CHANGE: {
    status: 'ERROR',
    message: 'Dữ liệu không có gì thay đổi.',
  },
  TOKEN_EXPIRED: {
    status: 'ERROR',
    message: 'Token đã hết hạn.',
  },
};

export default variable;
