(() => {
  const buttons = [...document.querySelectorAll("[data-filter]")];
  const grid = document.querySelector("[data-pack-grid]");
  if (!buttons.length || !grid) return;

  const cards = [...grid.querySelectorAll("[data-track]")];
  const status = document.querySelector("[data-filter-status]");
  const labels = { ai: "AI guides", life: "life-admin printables" };

  function applyFilter(filter) {
    let visible = 0;

    cards.forEach((card) => {
      const matches = filter === "all" || card.dataset.track === filter;
      card.hidden = !matches;
      if (matches) visible += 1;
    });

    buttons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (status) {
      status.textContent = filter === "all"
        ? `Showing all ${visible} printables.`
        : `Showing ${visible} ${labels[filter] ?? "printables"}.`;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });

  const requested = new URLSearchParams(window.location.search).get("filter");
  const initial = buttons.some((button) => button.dataset.filter === requested) ? requested : "all";
  applyFilter(initial);
})();
