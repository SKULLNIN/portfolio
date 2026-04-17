/**
 * Runs before Next/React client code (`beforeInteractive`) so `preventDefault()` applies to
 * benign Web Locks / orientation failures from js-dos emulators (Emscripten asyncify), and to
 * normal DOS shutdown (`ExitStatus` / exit(0)).
 */
(function () {
  var K = "__portfolioLockRejectionSilencer";
  if (typeof window === "undefined" || window[K]) return;
  window[K] = true;

  function txt(r, d) {
    if (d == null) d = 0;
    if (d > 8 || r == null) return "";
    try {
      if (typeof r === "string") return r;
      if (typeof r === "number" || typeof r === "boolean") return String(r);
      if (typeof r === "object") {
        var o = r;
        var parts = [];
        if (typeof o.name === "string") parts.push(o.name);
        if (typeof o.message === "string") parts.push(o.message);
        if (typeof o.description === "string") parts.push(o.description);
        if (typeof o.stack === "string") parts.push(o.stack);
        if (typeof o.status === "number" || typeof o.status === "string")
          parts.push("status:" + o.status);
        if (typeof o.toString === "function") {
          try {
            parts.push(String(o.toString.call(r)));
          } catch (e) {}
        }
        if (o.cause != null) parts.push(txt(o.cause, d + 1));
        if (Array.isArray(o.errors))
          for (var i = 0; i < o.errors.length; i++) parts.push(txt(o.errors[i], d + 1));
        return parts.join("\n");
      }
      return String(r);
    } catch (e) {
      return String(r);
    }
  }

  function ok(r) {
    if (r != null && typeof r === "object") {
      var o = r;
      if (o.name === "ExitStatus" && (o.status === 0 || o.status === "0")) return true;
    }
    var s = txt(r, 0).toLowerCase();
    if (/program terminated with exit\s*\(\s*0\s*\)/i.test(s)) return true;
    if (s.indexOf("exitstatus") >= 0 && s.indexOf("exit(0)") >= 0) return true;
    if (
      s.indexOf("could not be registered") >= 0 ||
      s.indexOf("only allowed when in fullscreen") >= 0 ||
      s.indexOf("lock() request") >= 0 ||
      (/invalidstateerror/.test(s) && s.indexOf("lock") >= 0)
    ) {
      return true;
    }
    /* On close, asyncify sometimes reports lock failures with stack only in emulators.js. */
    if (
      s.indexOf("emulators.js") >= 0 &&
      (/invalidstateerror/.test(s) || s.indexOf("lock") >= 0)
    ) {
      return true;
    }
    return false;
  }

  function h(ev) {
    if (ok(ev.reason)) {
      ev.preventDefault();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
    }
  }

  function hErr(ev) {
    try {
      if (ok(ev.error)) {
        ev.preventDefault();
        if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
      }
    } catch (e) {}
  }

  window.addEventListener("unhandledrejection", h, true);
  window.addEventListener("unhandledrejection", h, false);
  window.addEventListener("error", hErr, true);
})();
