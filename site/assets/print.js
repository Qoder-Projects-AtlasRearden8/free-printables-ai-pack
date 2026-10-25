(() => {
  const printButton = document.querySelector("[data-print]");
  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }

  function measurePages() {
    const pages = [...document.querySelectorAll(".page")];
    document.documentElement.dataset.pageCount = String(pages.length);
    const overflowing = [];
    pages.forEach((page, index) => {
      const main = page.querySelector(".page-main");
      const content = page.querySelector(".content");
      if (!main || !content) return;
      const footer = page.querySelector(".page-footer");
      const pageRect = page.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const footerTop = footer ? footer.getBoundingClientRect().top : pageRect.bottom;
      const mainOverflow = main.scrollHeight - main.clientHeight;
      const footerOverlap = contentRect.bottom - footerTop;
      const overflowPx = Math.max(0, Math.ceil(Math.max(mainOverflow, footerOverlap)));
      const sections = [...content.querySelectorAll(":scope > h2")]
        .map((heading) => `${heading.textContent.slice(0, 34)}@${Math.round(heading.getBoundingClientRect().top - contentRect.top)}`)
        .join("|");
      page.dataset.overflow = String(overflowPx > 1);
      page.dataset.metrics = `top:${Math.round(contentRect.top)} bottom:${Math.round(contentRect.bottom)} footer:${Math.round(footerTop)} height:${Math.round(contentRect.height)} main:${main.scrollHeight}/${main.clientHeight}`;
      page.dataset.sections = sections;
      if (overflowPx > 1) overflowing.push(`${index + 1}:${overflowPx}px`);
    });
    document.documentElement.dataset.overflowPages = overflowing.join(",");
  }

  window.addEventListener("load", measurePages);
  if (document.fonts?.ready) document.fonts.ready.then(measurePages);
})();
