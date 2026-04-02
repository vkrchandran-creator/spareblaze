const crypto = require('crypto');

function computeSHA512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const key  = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;

  if (!key || !salt) {
    return res.status(503).json({ success: false, message: 'Payment gateway is not configured.' });
  }

  const { firstname, email, phone, amount, productinfo } = req.body;

  if (!firstname || !email || !phone || !amount || !productinfo) {
    return res.status(400).json({ success: false, message: 'Missing required payment fields.' });
  }

  const txnid           = 'SB' + Date.now() + Math.floor(Math.random() * 1000);
  const formattedAmount = parseFloat(amount).toFixed(2);

  const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  const hash       = computeSHA512(hashString);

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host     = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl  = `${protocol}://${host}`;

  const payuEndpoint = process.env.NODE_ENV === 'production'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';

  return res.status(200).json({
    success: true,
    data: {
      payuEndpoint,
      params: {
        key,
        txnid,
        amount:      formattedAmount,
        productinfo,
        firstname,
        email,
        phone,
        surl: `${baseUrl}/api/payments/success`,
        furl: `${baseUrl}/api/payments/failure`,
        hash,
      },
    },
  });
};
