import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FixLab · Swagger UI (Documentación Interactiva)</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2306b6d4' stroke-width='2'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/></svg>">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b1120;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .custom-header {
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .custom-header h1 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .custom-header a {
      color: #38bdf8;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 8px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.2);
      transition: all 0.2s;
    }
    .custom-header a:hover {
      background: rgba(56, 189, 248, 0.2);
    }
    /* Estilos Dark Mode para Swagger UI */
    .swagger-ui {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
      filter: invert(88%) hue-rotate(180deg);
    }
    .swagger-ui .topbar { display: none; }
    .swagger-ui img, .swagger-ui svg {
      filter: invert(100%) hue-rotate(180deg);
    }
  </style>
</head>
<body>
  <header class="custom-header">
    <h1>
      <span>🛠️</span>
      <span>FixLab · Consola Swagger UI</span>
    </h1>
    <div>
      <a href="/dashboard">← Volver al Panel Principal</a>
    </div>
  </header>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/docs",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: -1,
        docExpansion: "list"
      });
    };
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
