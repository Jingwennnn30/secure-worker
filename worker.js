export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // =========================
    // Identity headers from Cloudflare Zero Trust
    // =========================
    const email =
      request.headers.get("Cf-Access-Authenticated-User-Email") ||
      "unknown@user";

    const country =
      request.headers.get("Cf-IPCountry") || "UNKNOWN";

    const timestamp = new Date().toISOString();

    // =========================
    // /secure → HTML response
    // =========================
    if (path === "/secure" || path === "/secure/") {
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Secure Application Portal</title>

  <style>
    body {
      margin: 0;
      font-family: "Segoe UI", Roboto, Arial, sans-serif;
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card {
      background: #ffffff;
      width: 520px;
      border-radius: 16px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
      padding: 45px 50px;
      text-align: center;
    }

    .logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      color: #1f3c5b;
    }

    .subtitle {
      margin-top: 8px;
      color: #6b7280;
      font-size: 15px;
    }

    .panel {
      margin-top: 35px;
      background: #f7fafc;
      border-radius: 12px;
      padding: 25px;
      text-align: left;
    }

    .row {
      margin-bottom: 18px;
    }

    .label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
      display: block;
    }

    .value {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      word-break: break-all;
    }

    .country-link {
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
    }

    .country-link:hover {
      text-decoration: underline;
    }

    .status {
      margin-top: 28px;
      background: #ecfdf5;
      color: #065f46;
      padding: 14px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
    }

    .footer {
      margin-top: 35px;
      font-size: 13px;
      color: #9ca3af;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>

<body>
  <div class="card">

    <!-- Lock Icon -->
    <svg class="logo" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>

    <h1>Secure Application Portal</h1>
    <div class="subtitle">
      Protected by Cloudflare Zero Trust Access
    </div>

    <div class="panel">
      <div class="row">
        <span class="label">Authenticated User</span>
        <span class="value">${email}</span>
      </div>

      <div class="row">
        <span class="label">Authentication Time</span>
        <span class="value">${timestamp}</span>
      </div>

      <div class="row">
        <span class="label">Client Location</span>
        <a class="country-link" href="/secure/${country}">
          ${country}
        </a>
      </div>
    </div>

    <div class="status">
      ✔ Authentication successful — Authorized session active
    </div>

    <div class="footer">
      Secured by Cloudflare Tunnel & Zero Trust<br>
      © 2026 Jing Wen Cloud Lab
    </div>

  </div>
</body>
</html>
      `;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // =========================
    // /secure/{COUNTRY} → Flag from private R2
    // =========================
    const parts = path.split("/").filter(Boolean);

    if (parts.length === 2 && parts[0] === "secure") {
      const selectedCountry = parts[1].toUpperCase();
      const filename = `${selectedCountry.toLowerCase()}.png`;

      try {
        const object = await env.FLAGS_BUCKET.get(filename);

        if (!object) {
          return new Response(
            `No flag available for country: ${selectedCountry}`,
            { status: 404 }
          );
        }

        return new Response(object.body, {
          headers: {
            "Content-Type": "image/png",
          },
        });
      } catch (err) {
        return new Response(
          "Error retrieving flag from R2 storage",
          { status: 500 }
        );
      }
    }

    // =========================
    // Default
    // =========================
    return new Response("Not Found", { status: 404 });
  },
};
