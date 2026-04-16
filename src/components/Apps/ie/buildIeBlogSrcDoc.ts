import {
  IE_BLOG_COMING_SOON,
  IE_BLOG_HEADING,
} from "@/data/ie-blog-content";
import { OWNER } from "@/data/portfolio-content";

/** Windows XP / IE6–era placeholder: framed “coming soon” panel on dialog gray. */
export function buildIeBlogSrcDoc(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><base target="_self"/>
<title>${escapeHtml(IE_BLOG_HEADING)} — ${escapeHtml(OWNER.displayName)}</title>
<style>
  body{margin:0;padding:0;font-family:Tahoma,"MS Sans Serif",Arial,sans-serif;font-size:12px;background:#ece9d8;color:#000;}
  .chrome-top{
    background:linear-gradient(180deg,#153d99 0%,#2a6bdc 38%,#1c54c4 100%);
    color:#fff;padding:6px 10px 8px;font-weight:bold;font-size:13px;
    border-bottom:1px solid #0a246a;
    text-shadow:1px 1px 0 #0a246a;
  }
  .chrome-sub{
    background:linear-gradient(180deg,#eef4ff 0%,#d8e4fc 100%);
    border-bottom:1px solid #7aa1e6;padding:5px 10px;font-size:11px;color:#003399;
  }
  .wrap{max-width:560px;margin:0 auto;padding:24px 16px 32px;}
  .frame{
    background:#fff;
    border:1px solid;
    border-color:#fff #aca899 #aca899 #fff;
    box-shadow:1px 1px 0 rgba(0,0,0,0.06);
  }
  .frame-hd{
    background:linear-gradient(180deg,#faf9f4 0%,#ece9d8 100%);
    border-bottom:1px solid #aca899;padding:6px 10px;font-weight:bold;font-size:11px;color:#000;
  }
  .frame-bd{
    min-height:160px;
    padding:28px 20px 32px;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    background:linear-gradient(180deg,#fafaf8 0%,#f5f4f0 100%);
    border:1px solid #e0ddd4;
    margin:10px;
  }
  .soon{
    margin:0;
    font-size:15px;
    font-weight:bold;
    color:#4a4a4a;
    letter-spacing:0.3px;
  }
  .e-icon{font-family:"Times New Roman",serif;font-weight:bold;color:#316ac5;}
</style></head><body>
<div class="chrome-top"><span class="e-icon">e</span> ${escapeHtml(IE_BLOG_HEADING)}</div>
<div class="chrome-sub">${escapeHtml(OWNER.displayName)} · ${String(new Date().getFullYear())}</div>
<div class="wrap">
  <div class="frame">
    <div class="frame-hd">${escapeHtml(IE_BLOG_HEADING)}</div>
    <div class="frame-bd">
      <p class="soon">${escapeHtml(IE_BLOG_COMING_SOON)}</p>
    </div>
  </div>
</div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
