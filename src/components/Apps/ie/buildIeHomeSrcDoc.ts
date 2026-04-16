import { OWNER, BIO_HTML } from "@/data/portfolio-content";

/** Nostalgic 2004-style “Link Hub” home page for IE `srcDoc`. External links use `target="_blank"` (Brave / strict browsers block scripted popups). */
export function buildIeHomeSrcDoc(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><base target="_self"/>
<style>
  body{margin:0;padding:0;font-family:Tahoma,Arial,sans-serif;font-size:12px;background:#e6eef6;color:#000;}
  .wrap{max-width:640px;margin:0 auto;padding:14px 16px 24px;}
  .topbar{background:linear-gradient(180deg,#1c4aa8 0%,#2a6bdc 45%,#1c4aa8 100%);color:#fff;padding:8px 12px;font-weight:bold;font-size:13px;
    border-bottom:1px solid #0a246a;letter-spacing:0.5px;}
  .subbar{background:#f7fbff;border-bottom:1px solid #9db9e8;padding:6px 12px;font-size:11px;color:#003399;}
  .logo{display:inline-block;font-weight:bold;color:#fff;margin-right:8px;}
  .hub{background:#fff;border:1px solid #7aa1e6;margin-top:12px;padding:12px 14px;box-shadow:1px 1px 0 #fff inset;}
  h1{margin:0 0 8px;font-size:16px;color:#0a246a;}
  .lead{font-size:13px;}
  p{margin:8px 0;line-height:1.45;}
  .muted{color:#555;font-size:11px;}
  .links{margin-top:14px;padding-top:10px;border-top:1px dashed #b8c8e8;}
  .links h2{margin:0 0 6px;font-size:12px;color:#0a246a;}
  ul{margin:6px 0 0;padding-left:18px;}
  li{margin:4px 0;}
  a{color:#0033cc;}
  a:visited{color:#551a8b;}
  .foot{margin-top:16px;padding-top:8px;border-top:1px solid #d4e4f7;font-size:10px;color:#666;text-align:center;}
  .blink{animation:blink 1.2s step-end infinite;}
  @keyframes blink{50%{opacity:0.4;}}
</style>
<script>
(function(){
  document.addEventListener("click", function(e) {
    var el = e.target;
    while (el && el.tagName !== "A") el = el.parentElement;
    if (!el || el.tagName !== "A") return;
    var href = el.getAttribute("href");
    if (href === "about:blog") {
      e.preventDefault();
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "xp-ie-nav", url: "about:blog" }, "*");
      }
    }
  });
})();
</script></head><body>
<div class="topbar"><span class="logo">Link Hub</span> Welcome — ${escapeHtml(OWNER.displayName)}</div>
<div class="subbar">You are connected · ${String(new Date().getFullYear())} · Best with 1024×768 or larger · 
<span class="blink">●</span> Live</div>
<div class="wrap">
  <div class="hub">
    <h1>About this desktop</h1>
    ${BIO_HTML}
    <div class="links">
      <h2>Quick shortcuts (also in the bar above the page)</h2>
      <ul>
        <li><a href="${escapeAttr(OWNER.github)}" target="_blank" rel="noopener noreferrer">GitHub profile</a></li>
        <li><a href="${escapeAttr(OWNER.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        <li><a href="${escapeAttr(`mailto:${OWNER.email}`)}">Email ${escapeAttr(OWNER.email)}</a></li>
        <li><a href="about:blog">Blog</a></li>
      </ul>
    </div>
  </div>
  <p class="foot">Link Hub™ — a nostalgic hub layout · Not affiliated with MSN, Yahoo!, or Google · Portfolio demo</p>
</div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
