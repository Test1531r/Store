export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};
