export function notFound(req, _res, next) {
  next(Object.assign(new Error(`Không tìm thấy API: ${req.method} ${req.originalUrl}`), { status: 404 }));
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || (error.code === 11000 ? 409 : error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({
    message: status >= 500 ? 'Đã xảy ra lỗi máy chủ' : error.code === 11000 ? 'Dữ liệu đã tồn tại' : error.message,
    ...(error.name === 'ValidationError' ? { details: Object.values(error.errors).map((item) => item.message) } : {})
  });
}
