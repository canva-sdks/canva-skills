#!/usr/bin/env node
/**
 * Repository validation for Canva skills.
 *
 * Zero dependencies — run locally with `node scripts/validate-skills.mjs`.
 *
 * Checks:
 *  1. Every SKILL.md has YAML frontmatter with a spec-compliant `name`
 *     and a non-empty `description`.
 *  2. Active skill directories match the registry in the Claude plugin
 *     manifest (plugins/canva/.claude-plugin/plugin.json).
 *  3. Skill `name` values are unique across the repository.
 *  4. Every JSON file parses.
 *  5. The Cursor project skill symlinks exist and resolve.
 */

import { lstatSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ACTIVE_SKILLS_DIR = join(ROOT, "plugins", "canva", "skills");
const CLAUDE_PLUGIN_MANIFEST = join(ROOT, "plugins", "canva", ".claude-plugin", "plugin.json");
const SKILL_SYMLINKS = [".cursor/skills", "plugins/canva/.cursor/skills"];

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NAME_MAX = 64;
const DESCRIPTION_MAX = 1024;

const errors = [];
const rel = (path) => relative(ROOT, path).split(sep).join("/");
const fail = (message) => errors.push(message);

/** Recursively collect files matching `predicate`, skipping VCS/dependency folders and symlinks. */
function walk(dir, predicate, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (lstatSync(full).isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(full, predicate, found);
    else if (predicate(full)) found.push(full);
  }
  return found;
}

/** Extract the raw YAML frontmatter block, or null if the file doesn't start with one. */
function frontmatterBlock(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  return match ? match[1] : null;
}

/** Read a top-level scalar from a frontmatter block, handling block scalars and quoted values. */
function frontmatterScalar(block, key) {
  const lines = block.split(/\r?\n/);
  const index = lines.findIndex((line) => new RegExp(`^${key}\\s*:`).test(line));
  if (index === -1) return undefined;

  const header = lines[index].replace(new RegExp(`^${key}\\s*:`), "").trim();
  if (/^[|>][-+]?$/.test(header)) {
    const parts = [];
    for (let i = index + 1; i < lines.length; i++) {
      if (lines[i].trim() !== "" && /^\S/.test(lines[i])) break;
      parts.push(lines[i].trim());
    }
    return parts.join(" ").trim();
  }
  return header.replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
}

function validateSkill(file) {
  const text = readFileSync(file, "utf8");
  const block = frontmatterBlock(text);
  if (block === null) {
    fail(`${rel(file)}: missing YAML frontmatter (file must start with "---")`);
    return null;
  }

  const name = frontmatterScalar(block, "name");
  const description = frontmatterScalar(block, "description");

  if (!name) {
    fail(`${rel(file)}: frontmatter is missing a non-empty "name"`);
  } else {
    if (!NAME_PATTERN.test(name)) {
      fail(`${rel(file)}: "name" must be lowercase alphanumeric words separated by hyphens (got "${name}")`);
    }
    if (name.length > NAME_MAX) {
      fail(`${rel(file)}: "name" exceeds ${NAME_MAX} characters (got ${name.length})`);
    }
  }

  if (!description) {
    fail(`${rel(file)}: frontmatter is missing a non-empty "description"`);
  } else if (description.length > DESCRIPTION_MAX) {
    fail(`${rel(file)}: "description" exceeds ${DESCRIPTION_MAX} characters (got ${description.length})`);
  }

  return name || null;
}

function validateRegistry(activeSkillDirs) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(CLAUDE_PLUGIN_MANIFEST, "utf8"));
  } catch (error) {
    fail(`${rel(CLAUDE_PLUGIN_MANIFEST)}: could not be read or parsed (${error.message})`);
    return;
  }

  const registered = (manifest.skills ?? []).map((entry) =>
    entry.replace(/^\.\/skills\//, "").replace(/\/+$/, "")
  );

  for (const dir of activeSkillDirs) {
    if (!registered.includes(dir)) {
      fail(`${rel(CLAUDE_PLUGIN_MANIFEST)}: active skill "${dir}" is not registered`);
    }
  }
  for (const entry of registered) {
    if (!activeSkillDirs.includes(entry)) {
      fail(`${rel(CLAUDE_PLUGIN_MANIFEST)}: registers "${entry}", but plugins/canva/skills/${entry} does not exist`);
    }
  }
}

function validateJson() {
  for (const file of walk(ROOT, (path) => path.endsWith(".json"))) {
    try {
      JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      fail(`${rel(file)}: invalid JSON (${error.message})`);
    }
  }
}

function validateSymlinks() {
  for (const link of SKILL_SYMLINKS) {
    const full = join(ROOT, link);
    let stats;
    try {
      stats = lstatSync(full);
    } catch {
      fail(`${link}: expected a symlink to the active skills directory, but it does not exist`);
      continue;
    }
    if (!stats.isSymbolicLink()) {
      fail(`${link}: expected a symlink, found a regular file or directory`);
      continue;
    }
    try {
      if (!lstatSync(realpathSync(full)).isDirectory()) fail(`${link}: does not resolve to a directory`);
    } catch {
      fail(`${link}: broken symlink`);
    }
  }
}

// --- run -------------------------------------------------------------------

const activeSkillDirs = readdirSync(ACTIVE_SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const dir of activeSkillDirs) {
  try {
    lstatSync(join(ACTIVE_SKILLS_DIR, dir, "SKILL.md"));
  } catch {
    fail(`plugins/canva/skills/${dir}: missing SKILL.md`);
  }
}

validateRegistry(activeSkillDirs);
validateJson();
validateSymlinks();

const skillFiles = walk(ROOT, (path) => path.endsWith(`${sep}SKILL.md`));
const seenNames = new Map();
for (const file of skillFiles) {
  const name = validateSkill(file);
  if (!name) continue;
  if (seenNames.has(name)) {
    fail(`${rel(file)}: duplicate skill name "${name}" (also used by ${seenNames.get(name)})`);
  } else {
    seenNames.set(name, rel(file));
  }
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} validation error(s):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ Validated ${skillFiles.length} skill file(s): frontmatter, registry, JSON and symlinks are all consistent.`
);
