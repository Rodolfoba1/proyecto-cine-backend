const QRCode = require('qrcode');

// Generar código QR a partir de datos
exports.generateQR = async (data) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data));
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generando código QR:', error);
    throw error;
  }
};