function normalizePhone(phone) {
  if (typeof phone !== 'string') return null;

  const normalized = phone.trim().replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(normalized) ? normalized : null;
}

module.exports = { normalizePhone };
