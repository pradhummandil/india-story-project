export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>We've Lost This Chapter | India Story Project</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background-color: #FAF7F1;
        color: #111111;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-height: 100vh;
        padding: 2rem 1.5rem;
        position: relative;
        overflow-x: hidden;
      }
      .bg-vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, transparent 40%, rgba(234, 227, 212, 0.7) 100%);
        pointer-events: none;
      }
      .gold-light {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(200, 154, 61, 0.25) 0%, rgba(165, 0, 0, 0.08) 50%, transparent 70%);
        filter: blur(60px);
        pointer-events: none;
      }
      header {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 64rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        text-decoration: none;
        color: #111111;
        font-family: 'Cormorant Garamond', serif;
        font-weight: 700;
        font-size: 1.125rem;
      }
      .brand-badge {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: linear-gradient(135deg, #A50000, #C89A3D);
        padding: 2px;
      }
      .brand-badge-inner {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #FAF7F1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #A50000;
        font-size: 0.75rem;
        font-weight: 700;
      }
      main {
        position: relative;
        z-index: 10;
        margin: auto 0;
        width: 100%;
        max-width: 38rem;
      }
      .card {
        position: relative;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.75);
        border: 1px solid rgba(200, 154, 61, 0.35);
        backdrop-filter: blur(16px);
        padding: 2.5rem 2rem;
        text-align: center;
        box-shadow: 0 20px 40px rgba(17, 17, 17, 0.05);
      }
      .card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, #C89A3D, transparent);
      }
      .illustration {
        width: 7rem;
        height: 7rem;
        margin: 0 auto 1rem;
      }
      h1 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 2.25rem;
        font-weight: 700;
        color: #111111;
        margin-bottom: 0.75rem;
        line-height: 1.2;
      }
      p.subtitle {
        font-size: 0.875rem;
        color: #555555;
        line-height: 1.6;
        max-width: 28rem;
        margin: 0 auto 1.75rem;
      }
      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        background: linear-gradient(90deg, #A50000, #C89A3D, #A50000);
        color: #FFFFFF;
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-decoration: none;
        box-shadow: 0 8px 20px rgba(165, 0, 0, 0.2);
        border: 1px solid rgba(200, 154, 61, 0.4);
      }
      .btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        background: #FAF7F1;
        color: #111111;
        font-weight: 600;
        font-size: 0.75rem;
        text-decoration: none;
        border: 1px solid rgba(200, 154, 61, 0.4);
      }
      footer {
        position: relative;
        z-index: 10;
        text-align: center;
        font-size: 0.75rem;
        color: #777777;
      }
    </style>
  </head>
  <body>
    <div class="bg-vignette"></div>
    <div class="gold-light"></div>

    <header>
      <a href="/" class="brand">
        <div class="brand-badge"><div class="brand-badge-inner">ISP</div></div>
        <span>India Story Project</span>
      </a>
      <span style="font-family: monospace; font-size: 0.7rem; color: #888; letter-spacing: 0.1em;">SYSTEM RECOVERY</span>
    </header>

    <main>
      <div class="card">
        <div class="illustration">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="28" y="28" width="64" height="64" rx="8" fill="#FFFDF9" stroke="#C89A3D" stroke-width="2.5"/>
            <line x1="38" y1="42" x2="72" y2="42" stroke="#C89A3D" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="38" y1="50" x2="65" y2="50" stroke="#C89A3D" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
            <line x1="38" y1="58" x2="78" y2="58" stroke="#C89A3D" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <path d="M 72 28 L 92 28 L 92 48 Z" fill="#EEDEB8" stroke="#C89A3D" stroke-width="1.5"/>
            <circle cx="76" cy="74" r="20" fill="#FFFDF9" stroke="#C89A3D" stroke-width="2.5"/>
            <path d="M 76 60 L 80 74 L 76 88 L 72 74 Z" fill="#A50000" stroke="#C89A3D" stroke-width="1"/>
            <circle cx="76" cy="74" r="3" fill="#C89A3D"/>
          </svg>
        </div>
        <h1>We've lost this chapter</h1>
        <p class="subtitle">Every story has a journey. Unfortunately this page took a different path. Let's help you find your way back.</p>
        <div class="actions">
          <a href="/" class="btn-primary">Continue Exploring</a>
          <a href="/stories" class="btn-secondary">Browse Stories</a>
          <button class="btn-secondary" onclick="location.reload()" style="cursor:pointer;">Try Again</button>
        </div>
      </div>
    </main>

    <footer>
      <p style="font-family: 'Cormorant Garamond', serif; font-style: italic; margin-bottom: 4px;">“Every great journey has unexpected turns.”</p>
      <p>© ${new Date().getFullYear()} India Story Project. All rights reserved.</p>
    </footer>
  </body>
</html>`;
}
