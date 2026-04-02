const nodemailer = require('nodemailer');

// ─── Transporter ──────────────────────────────────────────────────────────────

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   parseInt(SMTP_PORT || '587', 10),
    secure: parseInt(SMTP_PORT || '587', 10) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
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
    email,
    phone,
    address,
    amount,
    items = [],
    orderDate = new Date(),
  } = order;

  const subtotal   = items.reduce((s, i) => s + (parseFloat(i.price) * parseInt(i.quantity, 10)), 0);
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
              🔥 SpareBlaze
            </div>
            <div style="color:rgba(255,255,255,.85);font-size:13px;margin-top:4px">
              Premium Automotive Parts
            </div>
          </td>
        </tr>

        <!-- ── Success Banner ── -->
        <tr>
          <td style="background:#f0fdf4;padding:24px 40px;text-align:center;border-bottom:1px solid #dcfce7">
            <div style="display:inline-block;background:#22c55e;border-radius:50%;width:52px;height:52px;line-height:52px;text-align:center;font-size:26px;margin-bottom:12px">✓</div>
            <h1 style="margin:0 0 6px;font-size:22px;color:#15803d;font-weight:700">
              Order Confirmed!
            </h1>
            <p style="margin:0;color:#166534;font-size:14px">
              Your payment was successful and your order is being processed.
            </p>
          </td>
        </tr>

        <!-- ── Order Meta ── -->
        <tr>
          <td style="padding:28px 40px 0">
            <p style="margin:0 0 20px;font-size:15px;color:#555">
              Hi <strong style="color:#1a1a2e">${firstname}</strong>,<br>
              Thank you for shopping with SpareBlaze! Here's a summary of your order.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:12px 20px;border-bottom:1px solid #e5e7eb">
                  <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px">Order ID</span><br>
                  <strong style="color:#1a1a2e;font-size:15px">${txnid}</strong>
                </td>
                <td style="padding:12px 20px;border-bottom:1px solid #e5e7eb;text-align:right">
                  <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px">Order Date</span><br>
                  <strong style="color:#1a1a2e;font-size:15px">${formatDate(orderDate)}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px">
                  <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px">Payment ID</span><br>
                  <strong style="color:#1a1a2e;font-size:15px">${mihpayid || '—'}</strong>
                </td>
                <td style="padding:12px 20px;text-align:right">
                  <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px">Payment Status</span><br>
                  <span style="background:#dcfce7;color:#15803d;font-size:13px;font-weight:600;padding:2px 10px;border-radius:999px">SUCCESS</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Items Table ── -->
        <tr>
          <td style="padding:28px 40px 0">
            <h2 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#1a1a2e;border-left:3px solid #e63900;padding-left:10px">
              Items Ordered
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:10px 16px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Product</th>
                  <th style="padding:10px 16px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Qty</th>
                  <th style="padding:10px 16px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Unit Price</th>
                  <th style="padding:10px 16px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Total</th>
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
          <td style="padding:20px 40px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="right">
                  <table role="presentation" cellpadding="0" cellspacing="0"
                         style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;min-width:280px">
                    <tr>
                      <td style="padding:10px 20px;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Subtotal (excl. GST)</td>
                      <td style="padding:10px 20px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#555">${fmt(baseAmount)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 20px;border-bottom:1px solid #e5e7eb;color:#555;font-size:14px">GST (18% incl.)</td>
                      <td style="padding:10px 20px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;color:#555">${fmt(gstAmount)}</td>
                    </tr>
                    <tr style="background:#fff8f5">
                      <td style="padding:14px 20px;font-weight:700;font-size:16px;color:#1a1a2e">Total Paid</td>
                      <td style="padding:14px 20px;text-align:right;font-weight:800;font-size:18px;color:#e63900">${fmt(amount)}</td>
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
            <h2 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#1a1a2e;border-left:3px solid #e63900;padding-left:10px">
              Shipping Details
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb">
                  <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px">Name</span><br>
                  <strong style="color:#1a1a2e">${firstname}</strong>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb">
                  <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px">Phone</span><br>
                  <strong style="color:#1a1a2e">${phone || '—'}</strong>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:14px 20px">
                  <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px">Delivery Address</span><br>
                  <strong style="color:#1a1a2e">${address || '—'}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Payment Method ── -->
        <tr>
          <td style="padding:20px 40px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
              <tr>
                <td style="padding:14px 20px">
                  <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px">Payment Method</span><br>
                  <strong style="color:#1a1a2e">UPI / Cards / NetBanking / Wallets (via PayU)</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── What Happens Next ── -->
        <tr>
          <td style="padding:28px 40px 0">
            <h2 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#1a1a2e;border-left:3px solid #e63900;padding-left:10px">
              What Happens Next?
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['🔍 Order Verification', 'Our team verifies your order and part availability.'],
                ['📦 Packed & Dispatched', 'Your parts are carefully packed and shipped within 1–2 business days.'],
                ['🚚 Delivery', 'Delivery to your address within 3–5 business days.'],
              ].map(([title, desc], i) => `
              <tr>
                <td style="padding:10px 0;display:flex;align-items:flex-start">
                  <div style="background:#fff8f5;border:1px solid #fce4d8;border-radius:50%;width:32px;height:32px;line-height:32px;text-align:center;font-size:16px;margin-right:14px;flex-shrink:0">${i + 1}</div>
                  <div>
                    <div style="font-weight:600;color:#1a1a2e;font-size:14px">${title}</div>
                    <div style="color:#666;font-size:13px;margin-top:2px">${desc}</div>
                  </div>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        <!-- ── Support ── -->
        <tr>
          <td style="padding:28px 40px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fff8f5;border:1px solid #fce4d8;border-radius:8px;padding:20px">
              <tr>
                <td style="padding:0 0 10px">
                  <strong style="color:#1a1a2e;font-size:15px">Need Help?</strong>
                </td>
              </tr>
              <tr>
                <td style="color:#555;font-size:14px;line-height:1.8">
                  📧 <a href="mailto:support@spareblaze.com" style="color:#e63900;text-decoration:none">support@spareblaze.com</a><br>
                  📞 <a href="tel:+919XXXXXXXXX" style="color:#e63900;text-decoration:none">+91 9XXXXXXXXX</a><br>
                  💬 <a href="https://wa.me/919XXXXXXXXX" style="color:#e63900;text-decoration:none">WhatsApp Us</a><br>
                  🕘 Mon–Sat, 9 AM – 6 PM IST
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
              This is an automated email. Please do not reply to this message.<br>
              © ${new Date().getFullYear()} SpareBlaze. All rights reserved.
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
 * Send an order confirmation email to the customer.
 * Silently skips (logs warning) if SMTP is not configured — never throws,
 * so a missing email config does NOT break the payment success flow.
 */
async function sendOrderConfirmation(orderDetails) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping order confirmation email.');
    return;
  }

  const from    = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = `Order Confirmed! #${orderDetails.txnid} — SpareBlaze`;
  const html    = buildOrderEmailHtml(orderDetails);

  try {
    await transporter.sendMail({
      from:    `"SpareBlaze" <${from}>`,
      to:      orderDetails.email,
      subject,
      html,
    });
    console.log(`[email] Order confirmation sent to ${orderDetails.email} (txnid: ${orderDetails.txnid})`);
  } catch (err) {
    // Log but never crash — payment was already successful
    console.error('[email] Failed to send order confirmation:', err.message);
  }
}

module.exports = { sendOrderConfirmation };
