// Assemble the GitHub Pages site in _site/ from the repo sources. Node stdlib only.
//
//   _site/index.html                       README in a plain page
//   _site/index.md, llms.txt, llms-full.txt, openapi.json
//   _site/skills/<name>/...                mirror of skills/ for direct-URL installs
//   _site/.well-known/skills/index.json    v0.1.0 (Stripe shape), read by npx skills and Hermes
//   _site/.well-known/agent-skills/index.json  v0.2.0 with sha256 digests
//
// Usage: node scripts/build-site.mjs
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "_site");
const SKILLS = join(ROOT, "skills");
const AGENT_SKILLS_SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

const read = (path) => readFileSync(join(ROOT, path), "utf8");

function write(path, content) {
  mkdirSync(dirname(join(SITE, path)), { recursive: true });
  writeFileSync(join(SITE, path), content);
}

function filesUnder(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();
}

// The frontmatter fields the indexes need. Both are single-line in every SKILL.md here.
function frontmatter(skillMd) {
  const block = skillMd.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const field = (key) => block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1].trim();
  return { name: field("name"), description: field("description") };
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

rmSync(SITE, { recursive: true, force: true });
mkdirSync(SITE, { recursive: true });

const readme = read("README.md");
write(
  "index.html",
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Iris agent kit</title>
<link rel="alternate" type="text/plain" href="llms.txt" title="llms.txt">
<style>body{margin:0 auto;max-width:52rem;padding:1rem;font:15px/1.5 ui-monospace,Menlo,monospace}pre{white-space:pre-wrap}</style>
</head>
<body>
<p><a href="llms.txt">llms.txt</a> · <a href="llms-full.txt">llms-full.txt</a> · <a href="openapi.json">openapi.json</a> · <a href="skills/iris-api/SKILL.md">SKILL.md</a> · <a href="https://github.com/Dot-Fun/iris-agent-kit">GitHub</a></p>
<pre>${escapeHtml(readme)}</pre>
</body>
</html>
`,
);
write("index.md", read("docs/index.md"));
write("llms.txt", read("docs/llms.txt"));
write("openapi.json", read("openapi/openapi.json"));
cpSync(SKILLS, join(SITE, "skills"), { recursive: true });

const v1 = [];
const v2 = [];
const fullText = [readme, read("docs/index.md")];

for (const name of readdirSync(SKILLS).sort()) {
  const dir = join(SKILLS, name);
  const skillMd = readFileSync(join(dir, "SKILL.md"));
  const meta = frontmatter(skillMd.toString("utf8"));
  if (meta.name !== name) throw new Error(`skills/${name}/SKILL.md names itself "${meta.name}"`);

  const files = filesUnder(dir);
  cpSync(dir, join(SITE, ".well-known", "skills", name), { recursive: true });
  cpSync(dir, join(SITE, ".well-known", "agent-skills", name), { recursive: true });

  // v0.1.0 lists paths relative to the skill folder, SKILL.md first.
  v1.push({ name, description: meta.description, files: ["SKILL.md", ...files.filter((file) => file !== "SKILL.md")] });
  // v0.2.0 resolves a relative url against the index's folder, so the site works under a subpath.
  v2.push({
    name,
    type: "skill-md",
    description: meta.description,
    url: `${name}/SKILL.md`,
    digest: `sha256:${createHash("sha256").update(skillMd).digest("hex")}`,
  });

  for (const file of ["SKILL.md", ...files.filter((file) => file !== "SKILL.md" && file.endsWith(".md"))]) {
    fullText.push(readFileSync(join(dir, file), "utf8"));
  }
}

write(".well-known/skills/index.json", `${JSON.stringify({ skills: v1 }, null, 2)}\n`);
write(".well-known/agent-skills/index.json", `${JSON.stringify({ $schema: AGENT_SKILLS_SCHEMA, skills: v2 }, null, 2)}\n`);
write("llms-full.txt", `${fullText.map((text) => text.trimEnd()).join("\n\n---\n\n")}\n`);

console.log(`Built ${relative(ROOT, SITE)}/ with ${v1.length} skill(s)`);
