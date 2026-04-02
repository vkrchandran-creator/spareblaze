const nodemailer = require('nodemailer');
const fs          = require('fs');
const path        = require('path');

// ─── Log file ─────────────────────────────────────────────────────────────────

const LOG_PATH = path.join(__dirname, '..', '..', 'logs', 'email.log');

function appendEmailLog(entry) {
  const line = JSON.stringify(entry) + '\n';
  try {
    fs.appendFileSync(LOG_PATH, line, 'utf8');
  } catch (e) {
    console.error('[email] Could not write to email.log:', e.message);
  }
}

// ─── Transporter ──────────────────────────────────────────────────────────────

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const port   = parseInt(SMTP_PORT || '587', 10);
  const secure = port === 465; // true = TLS from the start; false = STARTTLS on 587

  return nodemailer.createTransport({
    host:   SMTP_HOST,
    port,
    secure,
    requireTLS: !secure, // force STARTTLS upgrade on port 587 (required by Zoho)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: true },
  });
}

// ─── Address helper ───────────────────────────────────────────────────────────

// SMTP_FROM may already be "Name <addr>" or just "addr".
// Never double-wrap it — that produces malformed headers Zoho rejects.
function buildFromAddress() {
  const raw = process.env.SMTP_FROM || process.env.SMTP_USER || '';
  if (raw.includes('<')) return raw;          // already has display name + angle-brackets
  return `"SpareBlaze" <${raw}>`;             // bare address — add display name
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount) {
  return '₹' + parseFloat(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildOrderEmailHtml(order) {
  const {
    txnid,
    mihpayid,
    firstname,
    phone,
    address,
    amount,
    items = [],
    orderDate = new Date(),
  } = order;

  // GST (18%) is inclusive in the price — extract for display only
  const gstRate    = 0.18;
  const gstAmount  = parseFloat(amount) * gstRate / (1 + gstRate);
  const baseAmount = parseFloat(amount) - gstAmount;

  const itemRows = items.length > 0
    ? items.map(item => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;vertical-align:middle">
            ${item.img
              ? `<img src="${item.img}" alt="${item.name}" width="48" height="48"
                      style="border-radius:6px;object-fit:cover;vertical-align:middle;margin-right:10px">`
              : ''}
            <span style="font-weight:500;color:#1a1a2e">${item.name}</span>
            ${item.brand ? `<br><span style="font-size:12px;color:#888">${item.brand}</span>` : ''}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555">${item.quantity}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;color:#555">${fmt(item.price)}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#1a1a2e">${fmt(parseFloat(item.price) * parseInt(item.quantity, 10))}</td>
        </tr>`)
      .join('')
    : `<tr><td colspan="4" style="padding:16px;text-align:center;color:#888">Auto Parts Order</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order Confirmation — SpareBlaze</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;color:#333">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">

        <!-- ── Header ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#e63900 0%,#c73000 100%);padding:32px 40px;text-align:center">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px">
              SpareBlaze
            </div>
            <div style="color:rgba(255,255,255,.85);font-size:13px;margin-top:4px">
              Premium Automotive Parts
            </div>
          </td>
        </tr>

        <!-- ── Success Banner ── -->
        <tr>
          <td style="background:#f0fdf4;padding:24px 40px;text-align:center;border-bottom:1px solid #dcfce7">
            <div style="display:inline-block;background:#22c55e;border-radius:50%;width:52px;height:52px;line-height:52px;text-align:center;font-size:26px;margin-bottom:12px;color:#fff;font-weight:700">&#10003;</div>
            <h1 style="margin:0 0 6px;font-size:22px;color:#15803d;font-weight:700">
              Order Confirmed!
            </h1>
            <p style="margin:0;color:#166534;font-size:14px">
              Your payment was successful and your order is being processed.
            </p>
          </td>
        </tr>

        <!-- ── Greeting ── -->
        <tr>
          <td style="padding:28px 40px 0">
            <p style="margin:0 0 20px;font-size:15px;color:#555">
              Hi <strong style="color:#1a1a2e">${firstname}</strong>,<br>
              Thank you for shopping with SpareBlaze! Here is a summary of your order.
            </p>
          </td>
        </tr>

        <!-- ── Order Meta ── -->
        <tr>
          <td style="padding:0 40px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:12px 20px;border-bottom:1px solid #e5e7eb">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Order ID</span><br>
                  <strong style="color:#1a1a2e;font-size:14px">${txnid}</strong>
                </td>
                <td style="padding:12px 20px;border-bottom:1px solid #e5e7eb;text-align:right">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Order Date</span><br>
                  <strong style="color:#1a1a2e;font-size:14px">${formatDate(orderDate)}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Payment ID (PayU)</span><br>
                  <strong style="color:#1a1a2e;font-size:14px">${mihpayid || '—'}</strong>
                </td>
                <td style="padding:12px 20px;text-align:right">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Payment Status</span><br>
                  <span style="background:#dcfce7;color:#15803d;font-size:12px;font-weight:700;padding:3px 12px;border-radius:999px;display:inline-block">SUCCESS</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Items Table ── -->
        <tr>
          <td style="padding:28px 40px 0">
            <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#1a1a2e;border-left:3px solid #e63900;padding-left:10px">
              Items Ordered
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Product</th>
                  <th style="padding:10px 16px;text-align:center;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Qty</th>
                  <th style="padding:10px 16px;text-align:right;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Unit Price</th>
                  <th style="padding:10px 16px;text-align:right;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- ── Price Summary ── -->
        <tr>
          <td style="padding:16px 40px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="right">
                  <table role="presentation" cellpadding="0" cellspacing="0"
                         style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;min-width:260px">
                    <tr>
                      <td style="padding:10px 20px;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Subtotal (excl. GST)</td>
                      <td style="padding:10px 20px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#555">${fmt(baseAmount)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 20px;border-bottom:1px solid #e5e7eb;color:#555;font-size:14px">GST @ 18% (included)</td>
                      <td style="padding:10px 20px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;color:#555">${fmt(gstAmount)}</td>
                    </tr>
                    <tr style="background:#fff8f5">
                      <td style="padding:14px 20px;font-weight:700;font-size:15px;color:#1a1a2e">Total Paid</td>
                      <td style="padding:14px 20px;text-align:right;font-weight:800;font-size:17px;color:#e63900">${fmt(amount)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Shipping Details ── -->
        <tr>
          <td style="padding:28px 40px 0">
            <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#1a1a2e;border-left:3px solid #e63900;padding-left:10px">
              Shipping Details
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;width:50%">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Name</span><br>
                  <strong style="color:#1a1a2e">${firstname}</strong>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Phone</span><br>
                  <strong style="color:#1a1a2e">${phone || '—'}</strong>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:14px 20px">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Delivery Address</span><br>
                  <strong style="color:#1a1a2e">${address || '—'}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Payment Method ── -->
        <tr>
          <td style="padding:16px 40px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
              <tr>
                <td style="padding:14px 20px">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px">Payment Method</span><br>
                  <strong style="color:#1a1a2e">UPI / Cards / NetBanking / Wallets (via PayU)</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── What Happens Next ── -->
        <tr>
          <td style="padding:28px 40px 0">
            <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#1a1a2e;border-left:3px solid #e63900;padding-left:10px">
              What Happens Next?
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                    <td style="width:36px;vertical-align:top;padding-right:12px">
                      <div style="background:#fff8f5;border:1px solid #fce4d8;border-radius:50%;width:32px;height:32px;line-height:32px;text-align:center;font-weight:700;color:#e63900;font-size:14px">1</div>
                    </td>
                    <td style="vertical-align:top;padding-top:4px">
                      <div style="font-weight:600;color:#1a1a2e;font-size:14px">Order Verification</div>
                      <div style="color:#666;font-size:13px;margin-top:2px">Our team verifies your order and part availability.</div>
                    </td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                    <td style="width:36px;vertical-align:top;padding-right:12px">
                      <div style="background:#fff8f5;border:1px solid #fce4d8;border-radius:50%;width:32px;height:32px;line-height:32px;text-align:center;font-weight:700;color:#e63900;font-size:14px">2</div>
                    </td>
                    <td style="vertical-align:top;padding-top:4px">
                      <div style="font-weight:600;color:#1a1a2e;font-size:14px">Packed &amp; Dispatched</div>
                      <div style="color:#666;font-size:13px;margin-top:2px">Your parts are carefully packed and shipped within 1-2 business days.</div>
                    </td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                    <td style="width:36px;vertical-align:top;padding-right:12px">
                      <div style="background:#fff8f5;border:1px solid #fce4d8;border-radius:50%;width:32px;height:32px;line-height:32px;text-align:center;font-weight:700;color:#e63900;font-size:14px">3</div>
                    </td>
                    <td style="vertical-align:top;padding-top:4px">
                      <div style="font-weight:600;color:#1a1a2e;font-size:14px">Delivery</div>
                      <div style="color:#666;font-size:13px;margin-top:2px">Delivery to your address within 3-5 business days.</div>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Support ── -->
        <tr>
          <td style="padding:28px 40px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fff8f5;border:1px solid #fce4d8;border-radius:8px">
              <tr>
                <td style="padding:16px 20px 8px">
                  <strong style="color:#1a1a2e;font-size:14px">Need Help?</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:0 20px 16px;color:#555;font-size:14px;line-height:2">
                  Email: <a href="mailto:support@spareblaze.com" style="color:#e63900;text-decoration:none">support@spareblaze.com</a><br>
                  Phone: <a href="tel:+919XXXXXXXXX" style="color:#e63900;text-decoration:none">+91 9XXXXXXXXX</a><br>
                  WhatsApp: <a href="https://wa.me/919XXXXXXXXX" style="color:#e63900;text-decoration:none">Chat with us</a><br>
                  Hours: Mon-Sat, 9 AM - 6 PM IST
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="background:#1a1a2e;padding:24px 40px;text-align:center">
            <p style="margin:0 0 6px;color:rgba(255,255,255,.7);font-size:13px">
              SpareBlaze — Premium Automotive Parts for Every Vehicle
            </p>
            <p style="margin:0;color:rgba(255,255,255,.4);font-size:11px">
              This is an automated confirmation email. Please do not reply to this message.<br>
              &copy; ${new Date().getFullYear()} SpareBlaze. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send an order confirmation email to the customer and write a log entry.
 * Never throws — a failed email never breaks the payment success flow.
 */
async function sendOrderConfirmation(orderDetails) {
  const { txnid, email } = orderDetails;
  const logEntry = {
    timestamp: new Date().toISOString(),
    txnid,
    to: email,
    status: '',
    detail: '',
  };

  const transporter = createTransporter();
  if (!transporter) {
    logEntry.status = 'SKIPPED';
    logEntry.detail = 'SMTP not configured';
    appendEmailLog(logEntry);
    console.warn('[email] SMTP not configured — skipping order confirmation email.');
    return;
  }

  const from    = buildFromAddress();
  const subject = `Order Confirmed! #${txnid} — SpareBlaze`;
  const html    = buildOrderEmailHtml(orderDetails);

  try {
    const info = await transporter.sendMail({ from, to: email, subject, html });
    logEntry.status = 'SENT';
    logEntry.detail = info.messageId || 'ok';
    appendEmailLog(logEntry);
    console.log(`[email] Confirmation sent → ${email} | txnid: ${txnid} | msgId: ${info.messageId}`);
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.detail = err.message;
    appendEmailLog(logEntry);
    console.error(`[email] Send failed → ${email} | txnid: ${txnid} | error: ${err.message}`);
  }
}

module.exports = { sendOrderConfirmation };
