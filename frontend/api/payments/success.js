const crypto = require('crypto');

function computeSHA512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const frontendUrl = (process.env.FRONTEND_URL || 'https://www.spareblaze.com')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');

  const key  = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;

  if (!key || !salt) {
    return res.redirect(`${frontendUrl}/?payment=failed`);
  }

  try {
    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
      hash: receivedHash,
      mihpayid = '',
    } = req.body;

    const reverseHashString =
      `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const expectedHash = computeSHA512(reverseHashString);

    const expectedBuf = Buffer.from(expectedHash.padEnd(128, '0'));
    const receivedBuf = Buffer.from((receivedHash || '').padEnd(128, '0'));

    if (!crypto.timingSafeEqual(expectedBuf, receivedBuf) ||
        expectedHash !== (receivedHash || '')) {
      return res.redirect(`${frontendUrl}/?payment=failed`);
    }

    const params = new URLSearchParams({ payment: 'success', txnid, id: mihpayid });
    return res.redirect(`${frontendUrl}/?${params.toString()}`);
  } catch {
    return res.redirect(`${frontendUrl}/?payment=failed`);
  }
};
