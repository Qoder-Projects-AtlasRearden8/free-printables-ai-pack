#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const SITE = path.join(ROOT, "site");
const PRINT = path.join(SITE, "print");
const DOWNLOADS = path.join(SITE, "downloads");

const GUIDE_FILES = [
  "ai-prompt-cheat-sheets.md",
  "beginner-ai-glossary.md",
  "ai-privacy-checklist.md",
  "ai-for-job-search.md",
  "ai-for-budgeting.md",
  "7-day-ai-learning-challenge.md",
  "low-energy-weekly-reset.md",
  "paper-pile-triage-kit.md",
  "bills-renewals-subscriptions.md",
  "appointment-companion.md",
  "low-energy-meal-plan.md",
  "household-command-center.md",
];

const BRAND = {
  name: "Asdale Dynamics",
  legal: "ASDALE DYNAMICS, LLC",
  url: "dylanasdale.github.io",
  tagline: "Practical help, explained like a friend would.",
  year: "2026",
  packName: "The Practical Life Pack",
  archiveBase: "asdale-practical-life-pack",
};

const GROUPS = {
  ai: {
    label: "AI guides",
    shortLabel: "AI",
    title: "AI, made useful",
    description: "Plain-English prompts, privacy, learning, and practical workbooks for using AI without the hype.",
    closingHeading: "More AI printables",
    rule: "Use AI like a useful first draft — not a final authority. Keep your judgment, check the facts, and protect private information.",
  },
  life: {
    label: "Life admin",
    shortLabel: "Life admin",
    title: "Life admin, made lighter",
    description: "Low-energy systems for paperwork, appointments, bills, meals, and the household details that usually live in one tired person’s head.",
    closingHeading: "More life-admin printables",
    rule: "A system should fit your real energy, not the other way around. Keep what helps, drop what becomes another chore, and let the next small step be enough.",
  },
};

fs.mkdirSync(PRINT, { recursive: true });
fs.mkdirSync(DOWNLOADS, { recursive: true });

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(url = "") {
  const value = url.trim();
  if (/^(https?:\/\/|mailto:|\/|#|\.{1,2}\/)/i.test(value)) {
    return escapeHtml(value);
  }
  return "#";
}

function inlineMarkdown(input = "") {
  const code = [];
  let text = String(input).replace(/`([^`]+)`/g, (_, content) => {
    code.push(`<code>${escapeHtml(content)}</code>`);
    return `\u0000CODE${code.length - 1}\u0000`;
  });
  text = escapeHtml(text);
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = safeUrl(url.replaceAll("&amp;", "&"));
    return `<a href="${href}">${label}</a>`;
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
  text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, index) => code[Number(index)]);
  return text;
}

function parseFrontmatter(raw, file) {
  const normalized = raw.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing frontmatter`);
  const meta = {};
  let currentList = null;
  for (const line of match[1].split("\n")) {
    if (!line.trim()) continue;
    if (/^\s{2}-\s+/.test(line) && currentList) {
      meta[currentList].push(line.replace(/^\s{2}-\s+/, "").replace(/^"|"$/g, ""));
      continue;
    }
    const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!keyMatch) throw new Error(`${file}: cannot parse frontmatter line: ${line}`);
    const [, key, rest] = keyMatch;
    if (!rest.trim()) {
      meta[key] = [];
      currentList = key;
    } else {
      meta[key] = rest.replace(/^['"]|['"]$/g, "");
      currentList = null;
    }
  }
  for (const key of ["title", "shortTitle", "number", "group", "category", "subtitle", "description", "coverLine", "nextAction", "accent"]) {
    if (!meta[key]) throw new Error(`${file}: missing required metadata "${key}"`);
  }
  if (!GROUPS[meta.group]) throw new Error(`${file}: unknown group "${meta.group}" (use "ai" or "life")`);
  if (!Array.isArray(meta.inside) || meta.inside.length < 3) {
    throw new Error(`${file}: add at least three "inside" list items`);
  }
  meta.slug = path.basename(file, ".md");
  meta.source = `docs/${file}`;
  meta.filename = `${meta.number}-${meta.slug}.pdf`;
  meta.body = match[2].trim();
  return meta;
}

function takeBlocks(lines, options = {}) {
  const html = [];
  let i = 0;
  let ledeAvailable = Boolean(options.lede);

  const flushParagraph = (paragraphLines, extraClass = "") => {
    const content = paragraphLines.map((line) => line.trim()).join(" ");
    if (!content) return;
    const classes = [];
    if (ledeAvailable) {
      classes.push("lede");
      ledeAvailable = false;
    }
    if (extraClass) classes.push(extraClass);
    const classAttr = classes.length ? ` class="${classes.join(" ")}"` : "";
    html.push(`<p${classAttr}>${inlineMarkdown(content)}</p>`);
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    if (line.trim() === "---") {
      html.push('<hr class="rule">');
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      ledeAvailable = false;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const info = line.slice(3).trim();
      const language = info.split(/\s+/)[0] || "text";
      const label = info.slice(language.length).trim();
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        body.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) throw new Error("Unclosed code fence");
      i += 1;
      if (language === "prompt") {
        const headingLabel = label || "Copy, fill, and adjust";
        html.push(`<div class="prompt-card">
  <div class="prompt-head"><span>Prompt recipe</span><span>${escapeHtml(headingLabel)}</span></div>
  <pre class="prompt-text">${escapeHtml(body.join("\n").trim())}</pre>
</div>`);
      } else {
        html.push(`<pre><code>${escapeHtml(body.join("\n"))}</code></pre>`);
      }
      continue;
    }

    if (line.startsWith(":::")) {
      const directive = line.slice(3).trim();
      ledeAvailable = false;
      if (directive.startsWith("lines ")) {
        const count = Math.max(1, Math.min(20, Number.parseInt(directive.split(/\s+/)[1], 10) || 3));
        html.push(`<div class="write-lines" data-lines="${count}" aria-label="${count} blank writing lines">${Array.from({ length: count }, () => '<span class="write-line"></span>').join("")}</div>`);
        i += 1;
        if (lines[i]?.trim() === ":::") i += 1;
        continue;
      }
      const openClasses = directive.split(/\s+/).filter((token) => /^[a-z0-9-]+$/.test(token));
      if (!openClasses.length) throw new Error(`Invalid directive: ${line}`);
      const inner = [];
      i += 1;
      let closed = false;
      while (i < lines.length) {
        if (lines[i].trim() === ":::") {
          closed = true;
          i += 1;
          break;
        }
        inner.push(lines[i]);
        i += 1;
      }
      if (!closed) throw new Error(`Unclosed directive: ${line}`);
      let innerHtml = takeBlocks(inner);
      const isGrid = openClasses.some((name) => ["grid-2", "grid-3", "term-grid"].includes(name));
      if (isGrid && innerHtml.includes("<h3>")) {
        const chunks = innerHtml.split(/(?=<h3>)/).map((chunk) => chunk.trim()).filter(Boolean);
        innerHtml = chunks.map((chunk) => `<div class="grid-item">${chunk}</div>`).join("\n");
      }
      html.push(`<div class="${escapeHtml(openClasses.join(" "))}">${innerHtml}</div>`);
      continue;
    }

    if (line.startsWith(">")) {
      ledeAvailable = false;
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      const calloutMatch = quoteLines[0]?.match(/^\[!(TIP|NOTE|WARNING)\]\s*(.*)$/i);
      if (calloutMatch) {
        const type = calloutMatch[1].toLowerCase();
        const title = calloutMatch[2].trim();
        const rest = quoteLines.slice(1).join(" ").trim();
        const labels = { tip: "Try this", note: "Good to know", warning: "Watch out" };
        html.push(`<aside class="callout callout--${type}">
  <p class="callout-label">${labels[type]}</p>
  ${title ? `<p class="callout-title">${inlineMarkdown(title)}</p>` : ""}
  ${rest ? `<p>${inlineMarkdown(rest)}</p>` : ""}
</aside>`);
      } else {
        html.push(`<blockquote><p>${inlineMarkdown(quoteLines.join(" "))}</p></blockquote>`);
      }
      continue;
    }

    if (line.includes("|") && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] || "")) {
      ledeAvailable = false;
      const parseRow = (row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
      const headers = parseRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(parseRow(lines[i]));
        i += 1;
      }
      const cell = (value) => {
        if (/^\[\s\]$/.test(value)) return '<span class="cell-check" aria-hidden="true"></span>';
        if (!value) return "";
        return inlineMarkdown(value);
      };
      html.push(`<div class="table-wrap"><table>
  <thead><tr>${headers.map((header) => `<th scope="col">${inlineMarkdown(header)}</th>`).join("")}</tr></thead>
  <tbody>${rows.map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${cell(row[cellIndex] || "")}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      const checkbox = /^\s*[-*]\s+\[([ xX])\]\s*(.*)$/;
      const bullet = /^\s*[-*]\s+(.*)$/;
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const check = lines[i].match(checkbox);
        const plain = lines[i].match(bullet);
        if (check) {
          items.push(`<li class="check-item"><span class="check-box" aria-hidden="true"></span><span>${inlineMarkdown(check[2])}</span></li>`);
        } else {
          items.push(`<li>${inlineMarkdown(plain[1])}</li>`);
        }
        i += 1;
      }
      const isChecklist = items.some((item) => item.includes("check-item"));
      ledeAvailable = false;
      html.push(`<ul${isChecklist ? ' class="checklist"' : ""}>${items.join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      ledeAvailable = false;
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inlineMarkdown(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`);
        i += 1;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const paragraph = [line];
    i += 1;
    while (i < lines.length && lines[i].trim()) {
      const next = lines[i];
      if (/^(#{2,3}\s|```|:::)/.test(next) || next.startsWith(">") || /^\s*[-*]\s+/.test(next) || /^\s*\d+\.\s+/.test(next)) break;
      if (next.includes("|") && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] || "")) break;
      paragraph.push(next);
      i += 1;
    }
    flushParagraph(paragraph);
    i += 0;
  }
  return html.join("\n");
}

function splitContentPages(body, file) {
  const chunks = body.split(/<!--\s*page\s*-->/).map((chunk) => chunk.trim()).filter(Boolean);
  if (!chunks.length) throw new Error(`${file}: no content pages found`);
  return chunks.map((chunk) => {
    const lines = chunk.split("\n");
    const titleIndex = lines.findIndex((line) => /^#\s+/.test(line));
    if (titleIndex !== 0) throw new Error(`${file}: every content page must begin with a single # page title`);
    const title = lines[0].replace(/^#\s+/, "").trim();
    const contentLines = lines.slice(1);
    return { title, html: takeBlocks(contentLines, { lede: true }) };
  });
}

function logoSvg() {
  return `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <path d="M20 3v34M3 20h34M8 8l24 24M32 8 8 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="5.2" fill="currentColor"/>
</svg>`;
}

function coverPage(resource) {
  const list = resource.inside.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<section class="page page--cover" id="cover" aria-label="Cover">
  <div class="cover-orbit orbit-one" aria-hidden="true"></div>
  <div class="cover-orbit orbit-two" aria-hidden="true"></div>
  <div class="cover-grid" aria-hidden="true"></div>
  <span class="cover-ghost-number" aria-hidden="true">${escapeHtml(resource.number)}</span>
  <header class="cover-top">
    <div class="brandlock">
      ${logoSvg()}
      <span class="brandlock-text"><strong>ASDALE DYNAMICS</strong><span>AI + LIFE ADMIN STUDIO</span></span>
    </div>
    <span class="cover-edition">FREE PRINTABLE · ${escapeHtml(resource.number)}</span>
  </header>
  <div class="cover-main">
    <p class="cover-kicker"><span></span>${escapeHtml(resource.category)}</p>
    <h1>${escapeHtml(resource.title)}</h1>
    <p class="cover-subtitle">${escapeHtml(resource.subtitle)}</p>
    <p class="cover-lede">${escapeHtml(resource.coverLine)}</p>
  </div>
  <div class="cover-bottom">
    <div class="inside-card">
      <p class="inside-label">Inside this guide</p>
      <ol>${list}</ol>
    </div>
    <div class="cover-aside">
      <div class="cover-seal" aria-hidden="true">
        <span>PLAIN</span><span>ENGLISH</span><span>ON PURPOSE</span>
      </div>
      <p class="cover-note">Print it. Write on it.<br>Make it yours.</p>
    </div>
  </div>
  <footer class="cover-footer">
    <span>${escapeHtml(BRAND.legal)}</span>
    <span class="cover-tagline">${escapeHtml(BRAND.tagline)}</span>
    <span>${escapeHtml(BRAND.url)}</span>
  </footer>
</section>`;
}

function interiorPage(resource, page, index, totalPages) {
  return `<section class="page page--interior" id="page-${index + 2}" aria-label="Page ${index + 2}: ${escapeHtml(page.title)}">
  <header class="page-runner">
    <span>ASDALE DYNAMICS <span class="runner-dot" aria-hidden="true"></span> ${escapeHtml(resource.category.toUpperCase())}</span>
    <span>${escapeHtml(resource.number)} / ${escapeHtml(resource.shortTitle.toUpperCase())}</span>
  </header>
  <main class="page-main">
    <div class="page-heading">
      <p class="page-kicker">Plain-English field guide · ${escapeHtml(resource.number)}</p>
      <h1>${inlineMarkdown(page.title)}</h1>
    </div>
    <div class="content">
${page.html}
    </div>
  </main>
  <footer class="page-footer">
    <span>${escapeHtml(BRAND.url)} <span class="footer-slash">/</span> ${escapeHtml(BRAND.tagline)}</span>
    <span>${index + 2} <span class="page-total">/ ${totalPages}</span></span>
  </footer>
</section>`;
}

function closingPage(resource, allResources, pageNumber, totalPages) {
  const group = GROUPS[resource.group];
  const others = allResources.filter((item) => item.slug !== resource.slug && item.group === resource.group);
  const otherLinks = others.map((item) => `<li><span>${escapeHtml(item.number)}</span><a href="${escapeHtml(item.slug)}.html">${escapeHtml(item.title)}</a></li>`).join("");
  return `<section class="page page--interior page--closing" id="closing" aria-label="Closing page">
  <header class="page-runner">
    <span>ASDALE DYNAMICS <span class="runner-dot" aria-hidden="true"></span> ${escapeHtml(resource.category.toUpperCase())}</span>
    <span>${escapeHtml(resource.number)} / ${escapeHtml(resource.shortTitle.toUpperCase())}</span>
  </header>
  <main class="page-main">
    <div class="page-heading closing-heading">
      <p class="page-kicker">One last thing · ${escapeHtml(resource.number)}</p>
      <h1>Use one thing.<br>Then keep it.</h1>
    </div>
    <div class="content">
      <p class="lede">${escapeHtml(resource.nextAction)}</p>
      <div class="next-step-box">
        <p class="next-step-label">My next small step</p>
        <div class="write-lines">${'<span class="write-line"></span>'.repeat(2)}</div>
      </div>
      <div class="closing-banner">
        <span class="closing-banner-label">The rule for this half of the pack</span>
        <p>${escapeHtml(group.rule)}</p>
      </div>
      <div class="closing-columns">
        <div>
          <h2>${escapeHtml(group.closingHeading)}</h2>
          <ul class="pack-links">${otherLinks}</ul>
        </div>
        <div class="closing-small-print">
          <h2>Free to use</h2>
          <p>Print these for yourself, your classroom, or a client. Please keep the credit and don’t resell the files.</p>
          <p class="closing-url">${escapeHtml(BRAND.url)}</p>
        </div>
      </div>
      <p class="closing-signoff">Made with care in Indiana by ${escapeHtml(BRAND.legal)}.</p>
      <p class="closing-endmark">Keep the useful part. Leave the rest.</p>
    </div>
  </main>
  <footer class="page-footer">
    <span>${escapeHtml(BRAND.url)} <span class="footer-slash">/</span> ${escapeHtml(BRAND.tagline)}</span>
    <span>${pageNumber} <span class="page-total">/ ${totalPages}</span></span>
  </footer>
</section>`;
}

function documentHtml(resource, allResources, combined = false) {
  const contentPages = splitContentPages(resource.body, resource.source);
  resource.contentPages = contentPages;
  const totalPages = contentPages.length + 2;
  resource.totalPages = totalPages;
  const pages = [coverPage(resource)];
  contentPages.forEach((page, index) => pages.push(interiorPage(resource, page, index, totalPages)));
  pages.push(closingPage(resource, allResources, totalPages, totalPages));
  const body = pages.join("\n");
  const toolbar = `<div class="screen-bar" data-print-bar>
  <a class="screen-back" href="../index.html">← All printables</a>
  <span class="screen-title">${escapeHtml(resource.number)} · ${escapeHtml(resource.shortTitle)}</span>
  <button class="print-button" type="button" data-print>Print / save PDF</button>
</div>
<p class="screen-tip">Print tip: US Letter, 100% scale, background graphics on. This page can also stay on screen.</p>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#163b32">
  <meta name="description" content="${escapeHtml(resource.description)}">
  <title>${escapeHtml(resource.title)} — free printable | ${escapeHtml(BRAND.name)}</title>
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/print.css">
  <script src="../assets/print.js" defer></script>
</head>
<body${combined ? ' class="combined-body"' : ""}>
${combined ? "" : toolbar}
<div class="document" data-document data-slug="${escapeHtml(resource.slug)}">
${body}
</div>
</body>
</html>
`;
}

function combinedHtml(resources) {
  const allPages = resources.map((resource) => {
    const totalPages = resource.contentPages.length + 2;
    const sections = [coverPage(resource)];
    resource.contentPages.forEach((page, index) => sections.push(interiorPage(resource, page, index, totalPages)));
    sections.push(closingPage(resource, resources, totalPages, totalPages));
    return sections.join("\n");
  }).join("\n");
  const pageTotal = resources.reduce((sum, item) => sum + item.totalPages, 0);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#163b32">
  <meta name="description" content="The complete free Practical Life Pack from Asdale Dynamics: twelve print-ready guides for AI and life admin, including ADHD-friendly planners and checklists.">
  <title>The Complete Practical Life Pack — free printables | ${escapeHtml(BRAND.name)}</title>
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/print.css">
  <script src="../assets/print.js" defer></script>
</head>
<body class="combined-body">
<div class="screen-bar" data-print-bar>
  <a class="screen-back" href="../index.html">← All printables</a>
  <span class="screen-title">The complete pack · ${pageTotal} pages</span>
  <button class="print-button" type="button" data-print>Print / save PDF</button>
</div>
<p class="screen-tip">Print tip: this is a large file. To save paper, download the individual guides separately instead.</p>
<div class="document" data-document>
${allPages}
</div>
</body>
</html>
`;
}

function siteHtml(resources) {
  const pageTotal = resources.reduce((sum, item) => sum + item.totalPages, 0);
  const groups = Object.entries(GROUPS).map(([key, group]) => ({
    key,
    ...group,
    count: resources.filter((resource) => resource.group === key).length,
    pages: resources.filter((resource) => resource.group === key).reduce((sum, resource) => sum + resource.totalPages, 0),
  }));
  const aiGroup = groups.find((group) => group.key === "ai");
  const lifeGroup = groups.find((group) => group.key === "life");
  const cards = resources.map((resource) => {
    const group = GROUPS[resource.group];
    return `<article class="resource-card" id="resource-${escapeHtml(resource.number)}" data-track="${escapeHtml(resource.group)}" style="--accent:${escapeHtml(resource.accent)}">
  <div class="card-top">
    <span class="card-number">${escapeHtml(resource.number)}</span>
    <span class="card-tag">${escapeHtml(group.label)} · ${escapeHtml(resource.category)}</span>
  </div>
  <h3>${escapeHtml(resource.title)}</h3>
  <p>${escapeHtml(resource.description)}</p>
  <div class="card-meta">${resource.totalPages} pages <span>·</span> PDF + print-ready HTML</div>
  <div class="card-actions">
    <a class="button button--card" href="downloads/${escapeHtml(resource.filename)}">Download PDF <span aria-hidden="true">↘</span></a>
    <a class="text-link" href="print/${escapeHtml(resource.slug)}.html">Open HTML</a>
  </div>
</article>`;
  }).join("\n");
  const crossList = resources.map((resource) => `<a href="#resource-${escapeHtml(resource.number)}"><span>${escapeHtml(resource.number)}</span>${escapeHtml(resource.shortTitle)}</a>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#163b32">
  <meta name="description" content="Twelve free, print-ready printables for AI and life admin: prompt cheat sheets, a privacy checklist, an ADHD-friendly weekly reset, paperwork triage, bills, appointments, meals, and a household hub.">
  <meta property="og:title" content="The Practical Life Pack — Asdale Dynamics">
  <meta property="og:description" content="Twelve plain-English printables. Six for using AI well, six for getting life admin out from underfoot. No sign-up. No paywall. Free to print and share.">
  <meta property="og:type" content="website">
  <title>The Practical Life Pack — AI + life admin printables</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/site.css">
  <script src="assets/site.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="index.html" aria-label="Asdale Dynamics home">
    <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3v34M3 20h34M8 8l24 24M32 8 8 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="20" cy="20" r="5.2" fill="currentColor"/></svg>
    <span><strong>ASDALE DYNAMICS</strong><small>AI + LIFE ADMIN STUDIO</small></span>
  </a>
  <nav class="site-nav" aria-label="Main navigation">
    <a href="#pack">The pack</a>
    <a href="#how">How to use it</a>
    <a href="#about">About</a>
    <a class="nav-download" href="#download">Get all ${resources.length} <span aria-hidden="true">↓</span></a>
  </nav>
</header>

<main id="main">
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>Free · No sign-up · Local-first</p>
      <h1>The practical pack<br>for <em>actual people.</em></h1>
      <p class="hero-lede">Twelve plain-English printables: six for using AI well, six for getting life admin out from underfoot. Low-energy friendly. No jargon. No hype.</p>
      <div class="hero-actions">
        <a class="button button--primary" href="#pack">Browse all ${resources.length} <span aria-hidden="true">↓</span></a>
        <a class="text-link text-link--large" href="downloads/${escapeHtml(BRAND.archiveBase)}.zip">Download the pack <span class="download-size">${resources.length} PDFs</span></a>
      </div>
      <div class="hero-footnote">
        <div class="avatar-stack" aria-hidden="true"><span>AI</span><span>AD</span></div>
        <p>Made by <strong>Asdale Dynamics</strong>, an Indiana AI + life-admin studio. Free to print, keep, and share.</p>
      </div>
    </div>
    <div class="hero-visual" aria-label="A preview of the free printable stack">
      <div class="visual-note">Twelve printables · 50/50</div>
      <div class="paper-stack" aria-hidden="true">
        <div class="paper paper-back">
          <span>10</span><strong>The<br>Appointment<br>Companion</strong><small>HEALTH ADMIN</small>
        </div>
        <div class="paper paper-middle">
          <span>07</span><strong>Low-Energy<br>Weekly Reset</strong><small>UNDATED PLANNER</small>
        </div>
        <div class="paper paper-front">
          <div class="mini-brand">ASDALE DYNAMICS</div>
          <span class="mini-number">01</span>
          <strong>AI Prompt<br>Cheat Sheets</strong>
          <div class="mini-rule"></div>
          <small>PLAIN-ENGLISH FIELD GUIDE</small>
          <div class="mini-mark">*</div>
        </div>
      </div>
      <div class="stamp" aria-hidden="true"><span>${resources.length} GUIDES</span><strong>0</strong><span>DOLLARS</span></div>
      <div class="visual-caption"><span>${pageTotal} pages</span><span>${aiGroup.count} AI + ${lifeGroup.count} life admin</span><span>Print at home</span></div>
    </div>
  </section>

  <section class="ticker" aria-label="Pack highlights">
    <span>PLAIN ENGLISH, ALWAYS</span><span class="ticker-star" aria-hidden="true"></span>
    <span>ADHD-FRIENDLY BY DESIGN</span><span class="ticker-star" aria-hidden="true"></span>
    <span>NO ACCOUNT REQUIRED</span><span class="ticker-star" aria-hidden="true"></span>
    <span>NO TRACKERS</span><span class="ticker-star" aria-hidden="true"></span>
    <span>WORKS ON PAPER</span><span class="ticker-star" aria-hidden="true"></span>
    <span>FREE TO SHARE</span><span class="ticker-star" aria-hidden="true"></span>
  </section>

  <section class="pack-section" id="pack">
    <div class="section-heading">
      <div>
        <p class="eyebrow">The free printable pack</p>
        <h2>Pick the page<br>you need today.</h2>
      </div>
      <p class="section-intro">Half the pack is for your AI life. Half is for the paperwork, appointments, bills, meals, and household details that pile up. Start anywhere. There is no required order.</p>
    </div>
    <div class="pack-balance" aria-label="Pack contents">
      <span><strong>${aiGroup.count}</strong> AI guides</span>
      <span><strong>${lifeGroup.count}</strong> life-admin tools</span>
      <span><strong>${pageTotal}</strong> printable pages</span>
      <span><strong>0</strong> dollars</span>
    </div>
    <div class="pack-toolbar">
      <div class="filter-bar" role="group" aria-label="Filter printables">
        <button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true" aria-controls="printable-grid">All <span>${resources.length}</span></button>
        <button class="filter-button" type="button" data-filter="ai" aria-pressed="false" aria-controls="printable-grid">AI guides <span>${aiGroup.count}</span></button>
        <button class="filter-button" type="button" data-filter="life" aria-pressed="false" aria-controls="printable-grid">Life admin <span>${lifeGroup.count}</span></button>
      </div>
      <p class="filter-status" data-filter-status aria-live="polite">Showing all ${resources.length} printables.</p>
    </div>
    <div class="resource-grid" id="printable-grid" data-pack-grid>
${cards}
    </div>
  </section>

  <section class="download-section" id="download">
    <div class="download-card">
      <div class="download-icon" aria-hidden="true">
        <svg viewBox="0 0 56 56"><path d="M28 7v29m0 0 11-11M28 36 17 25M10 43v5h36v-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="download-copy">
        <p class="eyebrow">The whole stack</p>
        <h2>Take all ${resources.length} printables.</h2>
        <p>One combined PDF for easy reading, or a ZIP with all ${resources.length} individual PDFs. Every guide also has a print-ready HTML edition.</p>
      </div>
      <div class="download-actions">
        <a class="button button--cream" href="downloads/${escapeHtml(BRAND.archiveBase)}-complete.pdf">Complete PDF <span>${pageTotal} pages</span></a>
        <a class="button button--outline-light" href="downloads/${escapeHtml(BRAND.archiveBase)}.zip">Individual PDFs <span>ZIP</span></a>
        <a class="download-text" href="print/complete-pack.html">Print the whole pack from HTML →</a>
      </div>
    </div>
  </section>

  <section class="how-section" id="how">
    <div class="section-heading section-heading--compact">
      <div>
        <p class="eyebrow">Low effort, on purpose</p>
        <h2>Useful beats<br>impressive.</h2>
      </div>
      <p class="section-intro">No course to finish. No streak to protect. No perfect prompt to memorize. Use one page the way you would a good sticky note.</p>
    </div>
    <div class="steps-grid">
      <article class="step">
        <span class="step-number">01</span>
        <h3>Choose one</h3>
        <p>Find the situation that feels most like your week. Start there, not at the beginning of the pack.</p>
      </article>
      <article class="step">
        <span class="step-number">02</span>
        <h3>Print less</h3>
        <p>Print one guide or a single page. Open the HTML on screen, use it as a fillable reference, or print the whole pack only when you actually want it.</p>
      </article>
      <article class="step">
        <span class="step-number">03</span>
        <h3>Shrink the step</h3>
        <p>Change the brackets to fit your real life, then make the first action smaller than feels impressive. A five-minute version that happens beats a perfect plan that waits.</p>
      </article>
    </div>
    <div class="use-note">
      <span class="use-note-mark" aria-hidden="true">*</span>
      <p><strong>The rule for the whole pack:</strong> keep your judgment in the room. AI is a first draft, not an authority; a planner is a guess, not a promise. Check facts, protect private information, and let the next small step be enough.</p>
    </div>
  </section>

  <section class="about-section" id="about">
    <div class="about-mark" aria-hidden="true">
      <svg class="brand-mark" viewBox="0 0 40 40"><path d="M20 3v34M3 20h34M8 8l24 24M32 8 8 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="20" cy="20" r="5.2" fill="currentColor"/></svg>
    </div>
    <div class="about-copy">
      <p class="eyebrow">From Asdale Dynamics</p>
      <h2>Practical help, like a friend would.</h2>
      <p>Asdale Dynamics is Dylan Asdale’s Indiana-based education studio. Dylan is a registered nurse turned AI author — the person behind <em>The Massive AI Manual</em> and <a href="https://dylanasdale.github.io">dylanasdale.github.io</a>.</p>
      <p>This pack is deliberately 50/50: six beginner-first AI guides and six low-energy life-admin tools. The goal is the same on both sides — plain language, honest limits, and something you can use today without buying a new system.</p>
      <div class="about-facts">
        <div><strong>01</strong><span>Beginner-first<br>by design</span></div>
        <div><strong>02</strong><span>ADHD-friendly<br>low-effort layouts</span></div>
        <div><strong>03</strong><span>Free to print<br>and share</span></div>
      </div>
    </div>
  </section>

  <section class="faq-section" aria-labelledby="faq-title">
    <div class="faq-heading">
      <p class="eyebrow">Before you print</p>
      <h2 id="faq-title">Small print,<br>plain English.</h2>
    </div>
    <div class="faq-list">
      <details>
        <summary>Is this really free?</summary>
        <p>Yes. No sign-up, paywall, email capture, or checkout. The files are static and this page has no analytics.</p>
      </details>
      <details>
        <summary>Can I share these with my class or clients?</summary>
        <p>Yes — print and share them for personal, classroom, or client use with the Asdale Dynamics credit intact. Please don’t resell or repackage the files as your own product.</p>
      </details>
      <details>
        <summary>Are these actually ADHD-friendly?</summary>
        <p>They are designed with low effort in mind: no streaks, no required order, short entry points, generous writing space, and explicit “stop” points. They are not a clinical treatment, assessment, or substitute for care from a qualified professional.</p>
      </details>
      <details>
        <summary>Will these work with my tools?</summary>
        <p>The AI principles work across assistants, though labels and features change. Check your own app’s current menu where a guide mentions a setting. The life-admin pages work on paper, in a notes app, or printed one page at a time.</p>
      </details>
      <details>
        <summary>Is this medical, legal, or financial advice?</summary>
        <p>No. These guides are educational. For medical care, talk to a qualified clinician. For legal, tax, benefits, or financial decisions, use an appropriate professional or official source. In an emergency, contact your local emergency service.</p>
      </details>
      <details>
        <summary>How should I print them?</summary>
        <p>The PDFs are US Letter, designed for 100% scale. On A4 paper, choose “fit to page.” Turn on background graphics for the intended look; the text and writing space still work without them. The gallery has one combined PDF and every guide separately.</p>
      </details>
    </div>
  </section>

  <section class="closing-section">
    <p class="closing-kicker">Ready when you are.</p>
    <h2>Take one page.<br>Make one thing easier.</h2>
    <div class="closing-actions">
      <a class="button button--primary" href="#pack">Choose a printable <span aria-hidden="true">↑</span></a>
      <a class="text-link text-link--large" href="downloads/${escapeHtml(BRAND.archiveBase)}-complete.pdf">Read the whole pack</a>
    </div>
    <p class="closing-note">${pageTotal} pages · ${resources.length} printables · 50/50 AI + life admin · no account, no catch.</p>
  </section>
</main>

<footer class="site-footer">
  <div class="footer-top">
    <div class="footer-brand">
      <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3v34M3 20h34M8 8l24 24M32 8 8 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="20" cy="20" r="5.2" fill="currentColor"/></svg>
      <div><strong>ASDALE DYNAMICS, LLC</strong><span>${escapeHtml(BRAND.tagline)}</span></div>
    </div>
    <nav class="footer-links" aria-label="Footer navigation">
${crossList}
    </nav>
  </div>
  <div class="footer-bottom">
    <span>Copyright © ${BRAND.year} Asdale Dynamics, LLC. Free for personal, classroom, and client use with credit. Not for resale.</span>
    <span>No sign-up. No trackers. Made in Indiana.</span>
  </div>
</footer>
</body>
</html>
`;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function pdfPageCount(file) {
  try {
    const output = execFileSync("pdfinfo", [file], { encoding: "utf8" });
    const match = output.match(/^Pages:\s+(\d+)$/m);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

function renderPdf(chrome, htmlPath, pdfPath) {
  fs.rmSync(pdfPath, { force: true });
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    "--virtual-time-budget=5000",
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ];
  const result = spawnSync(chrome, args, { encoding: "utf8", timeout: 120000 });
  if (result.status !== 0 || !fs.existsSync(pdfPath)) {
    throw new Error(`Chrome PDF render failed for ${path.basename(htmlPath)}\n${result.stderr || result.stdout}`);
  }
  return pdfPageCount(pdfPath);
}

function buildZip(files, zipPath) {
  const python = spawnSync("python3", ["-m", "zipfile", "-c", zipPath, ...files], {
    cwd: DOWNLOADS,
    encoding: "utf8",
  });
  return python.status === 0 && fs.existsSync(zipPath);
}

function humanSize(file) {
  const bytes = fs.statSync(file).size;
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function main() {
  const resources = GUIDE_FILES.map((file) => parseFrontmatter(fs.readFileSync(path.join(DOCS, file), "utf8"), file));
  if (new Set(resources.map((resource) => resource.number)).size !== resources.length) {
    throw new Error("Resource numbers must be unique");
  }

  for (const resource of resources) {
    const html = documentHtml(resource, resources);
    fs.writeFileSync(path.join(PRINT, `${resource.slug}.html`), html);
    process.stdout.write(`Built HTML  ${resource.number} · ${resource.title} (${resource.totalPages} pages)\n`);
  }

  const combined = combinedHtml(resources);
  fs.writeFileSync(path.join(PRINT, "complete-pack.html"), combined);
  const pageTotal = resources.reduce((sum, resource) => sum + resource.totalPages, 0);
  process.stdout.write(`Built HTML  Complete pack (${pageTotal} pages)\n`);

  const chrome = findChrome();
  if (!chrome) {
    process.stdout.write("Chrome was not found — print-ready HTML was generated, PDFs were not.\n");
  } else {
    const pdfFiles = [];
    for (const resource of resources) {
      const htmlPath = path.join(PRINT, `${resource.slug}.html`);
      const pdfPath = path.join(DOWNLOADS, resource.filename);
      const actual = renderPdf(chrome, htmlPath, pdfPath);
      const expected = resource.totalPages;
      if (actual !== null && actual !== expected) {
        process.stdout.write(`WARNING: ${resource.filename} rendered ${actual} pages; HTML declares ${expected}. Check for overflow.\n`);
      }
      process.stdout.write(`Built PDF   ${resource.filename} — ${actual ?? "?"} pages, ${humanSize(pdfPath)}\n`);
      pdfFiles.push(pdfPath);
    }
    const combinedName = `${BRAND.archiveBase}-complete.pdf`;
    const combinedPdf = path.join(DOWNLOADS, combinedName);
    const actualCombined = renderPdf(chrome, path.join(PRINT, "complete-pack.html"), combinedPdf);
    if (actualCombined !== null && actualCombined !== pageTotal) {
      process.stdout.write(`WARNING: complete pack rendered ${actualCombined} pages; expected ${pageTotal}.\n`);
    }
    process.stdout.write(`Built PDF   ${combinedName} — ${actualCombined ?? "?"} pages, ${humanSize(combinedPdf)}\n`);

    const zipName = `${BRAND.archiveBase}.zip`;
    fs.rmSync(path.join(DOWNLOADS, zipName), { force: true });
    const zipPath = path.join(DOWNLOADS, zipName);
    const zipOk = buildZip(pdfFiles.map((file) => path.basename(file)), zipPath);
    if (zipOk) process.stdout.write(`Built ZIP   ${zipName} — ${humanSize(zipPath)}\n`);
    else process.stdout.write("ZIP build skipped (python3 or zip support unavailable).\n");
  }

  fs.writeFileSync(path.join(SITE, "index.html"), siteHtml(resources));
  process.stdout.write("Built site  index.html\n");
  fs.writeFileSync(
    path.join(ROOT, ".build-manifest.json"),
    JSON.stringify(resources.map((resource) => ({
      slug: resource.slug,
      title: resource.title,
      number: resource.number,
      group: resource.group,
      pdf: resource.filename,
      html: `print/${resource.slug}.html`,
      pages: resource.totalPages,
    })), null, 2) + "\n",
  );
  process.stdout.write(`Done. ${resources.length} guides · ${pageTotal} total pages.\n`);
}

main();
