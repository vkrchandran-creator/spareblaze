module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const frontendUrl = (process.env.FRONTEND_URL || 'https://www.spareblaze.com')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');

  const txnid  = (req.body && req.body.txnid) || '';
  const params = new URLSearchParams({ payment: 'failed', txnid });
  return res.redirect(`${frontendUrl}/?${params.toString()}`);
};
