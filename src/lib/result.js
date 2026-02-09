export const ok = (data) => ({ ok: true, data });

export const err = (errorCode, message) => ({
  ok: false,
  errorCode,
  message
});
