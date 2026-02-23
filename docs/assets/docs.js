(() => {
  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.src = src;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  const initMermaid = async () => {
    const diagrams = document.querySelectorAll(".mermaid");
    if (diagrams.length === 0) {
      return;
    }

    try {
      await loadScript("https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js");
      if (!window.mermaid) {
        return;
      }

      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "base"
      });
      await window.mermaid.run({ nodes: diagrams });
    } catch (_error) {
    }
  };

  const bindPdfButton = () => {
    const buttons = document.querySelectorAll(".pdf-button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => window.print());
    });
  };

  const injectHomeButton = () => {
    // index.html에서는 표시하지 않음
    const path = window.location.pathname;
    if (path.endsWith("index.html") || path.endsWith("/docs/") || path.endsWith("/docs")) {
      return;
    }

    const btn = document.createElement("a");
    btn.href = "../index.html";
    btn.className = "floating-home";
    btn.title = "메인으로 이동";
    btn.textContent = "메인으로";
    document.body.appendChild(btn);
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindPdfButton();
    injectHomeButton();
    void initMermaid();
  });
})();
