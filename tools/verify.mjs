#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const SITE = path.join(ROOT, "site");
const PRINT = path.join(SITE, "print");
const DOWNLOADS = path.join(SITE, "downloads");
const MANIFEST = path.join(ROOT, ".build-manifest.json");
const summaryOnly = process.argv.includes("--summary");

let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];

function section(name) {
  if (!summaryOnly) process.stdout.write(`\n${name}\n`);
}

function check(name, fn) {
  try {
    const detail = fn();
    passed += 1;
    if (!summaryOnly) process.stdout.write(`  PASS  ${name}${detail ? ` — ${detail}` : ""}\n`);
  } catch (error) {
    failed += 1;
    failures.push(`${name}: ${error.message}`);
    process.stdout.write(`  FAIL  ${name} — ${error.message}\n`);
  }
}

function skip(name, reason) {
  skipped += 1;
  process.stdout.write(`  SKIP  ${name} — ${reason}\n`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function listMarkdown() {
  return fs.readdirSync(DOCS).filter((file) => file.endsWith(".md")).sort();
}

function frontmatterValue(raw, key) {
  const match = raw.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : "";
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

function chromeDump(chrome, href, budget = 5000) {
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--window-size=1440,1000",
    `--virtual-time-budget=${budget}`,
    "--dump-dom",
    href,
  ], { encoding: "utf8", timeout: 180000, maxBuffer: 128 * 1024 * 1024 });
  assert(result.status === 0, `Chrome exited with ${result.status ?? "timeout"}`);
  assert(result.stdout && result.stdout.length > 500, "Chrome returned no rendered DOM");
  return result.stdout;
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

const docs = listMarkdown();
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(read(MANIFEST)) : [];
const chrome = findChrome();

section("Sources and 50/50 balance");
check("twelve printable sources", () => {
  assert(docs.length === 12, `found ${docs.length} Markdown sources, expected 12`);
  return `${docs.length} files`;
});

const docMeta = docs.map((file) => {
  const raw = read(path.join(DOCS, file));
  return {
    file,
    slug: file.replace(/\.md$/, ""),
    title: frontmatterValue(raw, "title"),
    number: frontmatterValue(raw, "number"),
    group: frontmatterValue(raw, "group"),
  };
});

check("every source has title, number, and group", () => {
  for (const doc of docMeta) {
    assert(doc.title, `${doc.file} has no title`);
    assert(/^\d{2}$/.test(doc.number), `${doc.file} has invalid number "${doc.number}"`);
    assert(["ai", "life"].includes(doc.group), `${doc.file} has invalid group "${doc.group}"`);
  }
  return "metadata complete";
});

check("source numbers are sequential", () => {
  const numbers = docMeta.map((doc) => doc.number).sort();
  const expected = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
  assert(numbers.join(",") === expected.join(","), `numbers are ${numbers.join(", ")}`);
  return "01–12";
});

check("six AI guides and six life-admin guides", () => {
  const ai = docMeta.filter((doc) => doc.group === "ai").length;
  const life = docMeta.filter((doc) => doc.group === "life").length;
  assert(ai === 6, `found ${ai} AI guides, expected 6`);
  assert(life === 6, `found ${life} life-admin guides, expected 6`);
  return `${ai} AI + ${life} life admin`;
});

check("titles and slugs are unique", () => {
  assert(new Set(docMeta.map((doc) => doc.title)).size === docMeta.length, "duplicate title");
  assert(new Set(docMeta.map((doc) => doc.slug)).size === docMeta.length, "duplicate slug");
  return "no duplicates";
});

section("Build manifest");
check("manifest exists and lists twelve guides", () => {
  assert(fs.existsSync(MANIFEST), "run npm run build first");
  assert(Array.isArray(manifest) && manifest.length === 12, `manifest has ${manifest?.length ?? 0} entries`);
  return `${manifest.length} entries`;
});

check("manifest matches sources and keeps the 50/50 split", () => {
  const ai = manifest.filter((item) => item.group === "ai").length;
  const life = manifest.filter((item) => item.group === "life").length;
  assert(ai === 6 && life === 6, `manifest split is ${ai} AI / ${life} life admin`);
  for (const item of manifest) {
    const source = docMeta.find((doc) => doc.slug === item.slug);
    assert(source, `${item.slug} has no source`);
    assert(item.number === source.number, `${item.slug} number mismatch`);
    assert(item.group === source.group, `${item.slug} group mismatch`);
    assert(item.title === source.title, `${item.slug} title mismatch`);
    assert(Number.isInteger(item.pages) && item.pages > 2, `${item.slug} has invalid page count`);
  }
  return `${ai} AI + ${life} life admin`;
});

check("every manifest export exists with the right page count", () => {
  let total = 0;
  for (const item of manifest) {
    const html = path.join(SITE, item.html);
    const pdf = path.join(DOWNLOADS, item.pdf);
    assert(fs.existsSync(html), `missing ${item.html}`);
    assert(fs.existsSync(pdf), `missing ${item.pdf}`);
    const pages = count(read(html), /<section class="page\b/g);
    assert(pages === item.pages, `${item.html} has ${pages} pages, manifest says ${item.pages}`);
    total += pages;
  }
  return `${total} printable pages`;
});

section("PDFs and ZIP");
check("pdfinfo is available", () => {
  const result = spawnSync("pdfinfo", ["-v"], { encoding: "utf8" });
  assert(result.status === 0 || /pdfinfo version/i.test(`${result.stderr}${result.stdout}`), "pdfinfo not found");
  return "available";
});

let pdfTotal = 0;
check("individual PDFs have matching counts and US Letter pages", () => {
  for (const item of manifest) {
    const file = path.join(DOWNLOADS, item.pdf);
    const info = execFileSync("pdfinfo", [file], { encoding: "utf8" });
    const pages = Number(info.match(/^Pages:\s+(\d+)$/m)?.[1]);
    assert(pages === item.pages, `${item.pdf} has ${pages} pages, expected ${item.pages}`);
    const size = info.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m);
    assert(size, `${item.pdf} has no page-size metadata`);
    const width = Number(size[1]);
    const height = Number(size[2]);
    assert(Math.abs(width - 612) < 1 && Math.abs(height - 792) < 1, `${item.pdf} is ${width}x${height} pt, not letter`);
    pdfTotal += pages;
  }
  return `${manifest.length} PDFs · ${pdfTotal} letter pages`;
});

check("combined PDF is complete", () => {
  const file = path.join(DOWNLOADS, "asdale-practical-life-pack-complete.pdf");
  assert(fs.existsSync(file), "missing combined PDF");
  const info = execFileSync("pdfinfo", [file], { encoding: "utf8" });
  const pages = Number(info.match(/^Pages:\s+(\d+)$/m)?.[1]);
  assert(pages === pdfTotal, `combined PDF has ${pages} pages, expected ${pdfTotal}`);
  return `${pages} pages`;
});

check("complete HTML pack matches the combined PDF", () => {
  const html = path.join(PRINT, "complete-pack.html");
  assert(fs.existsSync(html), "missing complete-pack.html");
  const pages = count(read(html), /<section class="page\b/g);
  assert(pages === pdfTotal, `complete-pack.html has ${pages} pages, expected ${pdfTotal}`);
  return `${pages} pages`;
});

check("ZIP contains exactly the twelve current PDFs", () => {
  const zip = path.join(DOWNLOADS, "asdale-practical-life-pack.zip");
  assert(fs.existsSync(zip), "missing ZIP");
  const script = "import json,sys,zipfile; print(json.dumps(zipfile.ZipFile(sys.argv[1]).namelist()))";
  const result = spawnSync("python3", ["-c", script, zip], { encoding: "utf8" });
  assert(result.status === 0, result.stderr.trim() || "could not read ZIP");
  const names = JSON.parse(result.stdout).filter((name) => name.endsWith(".pdf")).sort();
  const expected = manifest.map((item) => item.pdf).sort();
  assert(names.join("|") === expected.join("|"), `ZIP PDFs do not match manifest: ${names.join(", ")}`);
  return `${names.length} PDFs`;
});

section("Gallery");
const indexPath = path.join(SITE, "index.html");
check("gallery has twelve cards with a 6/6 split", () => {
  const html = read(indexPath);
  const cards = [...html.matchAll(/<article class="resource-card" id="resource-(\d{2})" data-track="(ai|life)"/g)];
  assert(cards.length === 12, `found ${cards.length} cards`);
  assert(cards.filter((card) => card[2] === "ai").length === 6, "AI card count is not 6");
  assert(cards.filter((card) => card[2] === "life").length === 6, "life-admin card count is not 6");
  return "12 cards · 6 AI / 6 life admin";
});

check("filter controls expose counts and accessible state", () => {
  const html = read(indexPath);
  assert(/data-filter="all"[^>]*aria-pressed="true"[^>]*aria-controls="printable-grid"[^>]*>All <span>12<\/span>/.test(html), "All filter is missing or not pressed");
  assert(/data-filter="ai"[^>]*aria-pressed="false"[^>]*aria-controls="printable-grid"[^>]*>AI guides <span>6<\/span>/.test(html), "AI filter is missing");
  assert(/data-filter="life"[^>]*aria-pressed="false"[^>]*aria-controls="printable-grid"[^>]*>Life admin <span>6<\/span>/.test(html), "Life filter is missing");
  assert(/data-filter-status[^>]*aria-live="polite"/.test(html), "live filter status is missing");
  return "All 12 / AI 6 / Life admin 6";
});

check("gallery uses local styles, scripts, and fonts only", () => {
  const html = read(indexPath);
  assert(/<script src="assets\/site\.js" defer><\/script>/.test(html), "site.js is not loaded locally");
  assert(!/<script[^>]+src="https?:/i.test(html), "gallery loads a remote script");
  assert(!/<link[^>]+href="https?:\/\//i.test(html), "gallery loads a remote stylesheet");
  const css = read(path.join(SITE, "assets", "site.css"));
  assert(!/@import\s+url\(["']?https?:/i.test(css), "site.css imports a remote stylesheet");
  assert(!/fonts\.googleapis|fonts\.gstatic|google-analytics|googletagmanager|plausible|umami|hotjar/i.test(`${html}\n${css}`), "tracking or remote-font reference found");
  return "no remote dependencies";
});

check("download links point at the current pack", () => {
  const html = read(indexPath);
  assert(html.includes('href="downloads/asdale-practical-life-pack.zip"'), "current ZIP link missing");
  assert(html.includes('href="downloads/asdale-practical-life-pack-complete.pdf"'), "current combined PDF link missing");
  assert(!html.includes("asdale-ai-starter-pack"), "stale starter-pack link found");
  return "current ZIP and PDF linked";
});

section("Local links and assets");
const htmlFiles = [indexPath, ...fs.readdirSync(PRINT).filter((file) => file.endsWith(".html")).map((file) => path.join(PRINT, file))];
check("all local HTML links and assets resolve", () => {
  let checked = 0;
  for (const file of htmlFiles) {
    const base = path.dirname(file);
    const html = read(file);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(target)) continue;
      const clean = target.split("#")[0].split("?")[0];
      if (!clean) continue;
      const resolved = path.resolve(base, clean);
      assert(fs.existsSync(resolved), `${path.relative(ROOT, file)} links to missing ${target}`);
      checked += 1;
    }
  }
  return `${checked} references`;
});

check("stylesheet assets and font files resolve", () => {
  const assets = path.join(SITE, "assets");
  let checked = 0;
  for (const entry of fs.readdirSync(assets).filter((name) => name.endsWith(".css"))) {
    const css = read(path.join(assets, entry));
    for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
      const target = match[1].trim().replace(/^['"]|['"]$/g, "");
      if (/^(?:data:|https?:|#)/i.test(target)) continue;
      const clean = target.split("#")[0].split("?")[0];
      assert(fs.existsSync(path.resolve(assets, clean)), `assets/${entry} references missing ${target}`);
      checked += 1;
    }
  }
  return `${checked} asset references`;
});

check("each print document is self-contained HTML", () => {
  for (const item of manifest) {
    const html = read(path.join(SITE, item.html));
    assert(/^<!doctype html>/i.test(html), `${item.html} has no doctype`);
    assert(/<html lang="en">/.test(html), `${item.html} has no lang`);
    assert(/<meta name="viewport"/.test(html), `${item.html} has no viewport`);
    assert(html.includes("../assets/print.css"), `${item.html} does not load print.css`);
    assert(!/<script[^>]+src="https?:/i.test(html), `${item.html} loads a remote script`);
    assert(!/<link[^>]+href="https?:\/\//i.test(html), `${item.html} loads a remote stylesheet`);
  }
  return `${manifest.length} documents`;
});

section("Page overflow");
if (!chrome) {
  skip("desktop overflow measurement", "Chrome not found");
} else {
  check("every printable page fits without clipping at 1440px", () => {
    const files = [...manifest.map((item) => item.html), "print/complete-pack.html"];
    const problems = [];
    for (const relative of files) {
      const href = pathToFileURL(path.join(SITE, relative)).href;
      const dom = chromeDump(chrome, href);
      const overflow = dom.match(/data-overflow-pages="([^"]*)"/)?.[1];
      assert(overflow !== undefined, `${relative} did not run its overflow check`);
      if (overflow) problems.push(`${relative}: ${overflow}`);
    }
    assert(problems.length === 0, problems.join("; "));
    return `${files.length} documents · 0 clipped pages`;
  });

  check("the written page count matches the rendered page count", () => {
    for (const item of manifest) {
      const href = pathToFileURL(path.join(SITE, item.html)).href;
      const dom = chromeDump(chrome, href);
      const rendered = Number(dom.match(/data-page-count="(\d+)"/)?.[1]);
      assert(rendered === item.pages, `${item.html} rendered ${rendered} pages, expected ${item.pages}`);
    }
    return "all 12 guides match";
  });
}

section("Gallery behaviour");
if (!chrome) {
  skip("filter deep links", "Chrome not found");
} else {
  for (const [filter, expectedStatus, hiddenTrack] of [
    ["ai", "Showing 6 AI guides.", "life"],
    ["life", "Showing 6 life-admin printables.", "ai"],
  ]) {
    check(`?filter=${filter} shows the right six cards`, () => {
      const href = `${pathToFileURL(indexPath).href}?filter=${filter}`;
      const dom = chromeDump(chrome, href, 3000);
      const cards = [...dom.matchAll(/<article class="resource-card"[^>]*>/g)].map((match) => match[0]);
      assert(cards.length === 12, `found ${cards.length} cards in the rendered DOM`);
      const hidden = cards.filter((card) => /\shidden(?:="")?[\s>]/.test(card));
      assert(hidden.length === 6, `${hidden.length} cards hidden, expected 6`);
      assert(hidden.every((card) => card.includes(`data-track="${hiddenTrack}"`)), `wrong cards hidden for ${filter}`);
      assert(dom.includes(expectedStatus), `status did not read "${expectedStatus}"`);
      return expectedStatus;
    });
  }
}

section("Scripts, privacy, and licence");
check("JavaScript files parse", () => {
  const files = ["tools/build.mjs", "tools/verify.mjs", "site/assets/site.js", "site/assets/print.js"];
  for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", path.join(ROOT, file)], { encoding: "utf8" });
    assert(result.status === 0, `${file}: ${result.stderr.trim()}`);
  }
  return `${files.length} files`;
});

check("site code makes no network requests", () => {
  const code = read(path.join(SITE, "assets", "site.js")) + read(path.join(SITE, "assets", "print.js"));
  assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|navigator\.sendBeacon/.test(code), "network API found in site code");
  return "no fetch, sockets, or beacons";
});

check("no secrets or credential-shaped strings are checked in", () => {
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bsk-[A-Za-z0-9]{20,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bghp_[A-Za-z0-9]{36}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
    /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
    /\bAIza[0-9A-Za-z_-]{35}\b/,
    /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"'\s]{8,}["']/i,
  ];
  const roots = ["docs", "tools", "site/assets", "site/print"];
  const files = ["README.md", "LICENSE", "STATUS.md", "package.json"];
  for (const root of roots) {
    const start = path.join(ROOT, root);
    if (!fs.existsSync(start)) continue;
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules") continue;
          walk(full);
        } else if (/\.(?:md|mjs|js|css|html|json|svg|txt|ya?ml)$/i.test(entry.name)) {
          files.push(path.relative(ROOT, full));
        }
      }
    };
    walk(start);
  }
  const unique = [...new Set(files)].filter((file) => fs.existsSync(path.join(ROOT, file)));
  for (const file of unique) {
    const text = read(path.join(ROOT, file));
    for (const pattern of patterns) {
      assert(!pattern.test(text), `possible secret in ${file}`);
    }
  }
  assert(!fs.existsSync(path.join(ROOT, ".env")), ".env file present");
  return `${unique.length} text files scanned`;
});

check("LICENSE carries the exact Asdale Dynamics copyright", () => {
  const file = path.join(ROOT, "LICENSE");
  assert(fs.existsSync(file), "LICENSE is missing");
  const text = read(file);
  assert(text.includes("Copyright (c) 2026 Asdale Dynamics, LLC"), "exact copyright line missing");
  return "present";
});

check("README credits Asdale Dynamics, LLC", () => {
  const file = path.join(ROOT, "README.md");
  assert(fs.existsSync(file), "README.md is missing");
  const text = read(file);
  assert(/Asdale Dynamics, LLC/.test(text), "README does not credit Asdale Dynamics, LLC");
  assert(text.includes("Copyright (c) 2026 Asdale Dynamics, LLC"), "README lacks the copyright line");
  return "credited";
});

check("STATUS.md documents the build and checks", () => {
  const file = path.join(ROOT, "STATUS.md");
  assert(fs.existsSync(file), "STATUS.md is missing");
  const text = read(file);
  assert(/npm run build/.test(text), "STATUS.md does not explain the build");
  assert(/npm test|npm run verify/.test(text), "STATUS.md does not explain verification");
  assert(/Known gaps|known gaps/.test(text), "STATUS.md has no known-gaps section");
  return "present";
});

check("package metadata matches the twelve-guide pack", () => {
  const pkg = JSON.parse(read(path.join(ROOT, "package.json")));
  assert(pkg.name === "asdale-practical-life-pack", `unexpected package name ${pkg.name}`);
  assert(/twelve|12/i.test(pkg.description), "description does not mention twelve items");
  assert(/life[- ]admin/i.test(pkg.description), "description does not mention life admin");
  assert(pkg.scripts?.test, "no test script");
  assert(pkg.license === "SEE LICENSE IN LICENSE", "license field is not set");
  return pkg.name;
});

section("Summary");
process.stdout.write(`${passed} passed, ${failed} failed, ${skipped} skipped\n`);
if (failed) {
  process.stdout.write("\nFailures:\n");
  for (const failure of failures) process.stdout.write(`- ${failure}\n`);
  process.exit(1);
}
if (skipped && !summaryOnly) process.stdout.write("Some browser checks were skipped; install Chrome to run them.\n");
