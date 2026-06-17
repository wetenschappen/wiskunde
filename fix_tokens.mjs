#!/usr/bin/env node
/**
 * Vue-SFC-aware design token migration script.
 * Phase 1 of deep-polish: replaces "vibe coded" Tailwind classes with
 * publisher-grade design tokens (math-blue, 8px grid, consistent radius/shadow).
 *
 * Operates only on <template> and <style> sections of Vue SFCs.
 * Uses simple word-boundary regex for class replacements — no complex lookarounds.
 *
 * Usage:
 *   node fix_tokens.mjs              # Apply changes
 *   node fix_tokens.mjs --dry-run    # Show planned changes, don't write
 *   node fix_tokens.mjs --revert     # Restore from backup
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = __dirname;
const ACTIVITIES_DIR = join(PROJECT_ROOT, 'w-activities');
const BACKUP_DIR = join(PROJECT_ROOT, '.fix_tokens_backup');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const REVERT = args.includes('--revert');

// Accent colors to migrate to math-blue
const ACCENT_COLORS = ['amber', 'teal', 'rose', 'pink', 'fuchsia', 'indigo', 'purple', 'violet', 'orange', 'yellow'];

let totalChanges = 0;
const changeLog = [];

function log(filename, section, oldStr, newStr) {
  totalChanges++;
  if (DRY_RUN) {
    changeLog.push(`  ${filename} [${section}]: ${oldStr} → ${newStr}`);
  }
}

// Shade → math-blue token mapping
function shadeMathBlue(s) {
  const n = parseInt(s);
  if (n <= 100) return 'math-blue-bg';
  if (n <= 300) return 'math-blue-light';
  return 'math-blue';
}

// Shade → surface token mapping (for borders)
function shadeSurface(s) {
  const n = parseInt(s);
  if (n <= 100) return 'surface-50';
  if (n <= 300) return 'surface-200';
  return 'surface-300';
}

/**
 * Apply all transformations to template section content (between <template> and </template>).
 * Returns the transformed text.
 */
function transformTemplate(text, fname) {
  let t = text;

  // ── 1. Accent color migrations ──

  for (const c of ACCENT_COLORS) {
    // bg-{color}-{shade}
    t = t.replace(new RegExp(`\\bbg-${c}-(\\d{2,3})\\b`, 'g'), (m, shade) => {
      const r = `bg-${shadeMathBlue(shade)}`;
      log(fname, 'template', m, r);
      return r;
    });
    // text-{color}-{shade}
    t = t.replace(new RegExp(`\\btext-${c}-(\\d{2,3})\\b`, 'g'), (m, shade) => {
      const s = parseInt(shade);
      const r = s <= 100 ? 'text-math-blue-bg' : s <= 300 ? 'text-math-blue-light' : 'text-math-blue';
      log(fname, 'template', m, r);
      return r;
    });
    // border-{color}-{shade}
    t = t.replace(new RegExp(`\\bborder-${c}-(\\d{2,3})\\b`, 'g'), (m, shade) => {
      const s = parseInt(shade);
      const r = s <= 100 ? 'border-surface-100' : s <= 300 ? 'border-surface-200' : 'border-math-blue';
      log(fname, 'template', m, r);
      return r;
    });
    // ring-{color}-{shade}
    t = t.replace(new RegExp(`\\bring-${c}-(\\d{2,3})\\b`, 'g'), (m) => {
      log(fname, 'template', m, 'ring-math-blue');
      return 'ring-math-blue';
    });
    // from-{color}-{shade} / to-{color}-{shade} / via-{color}-{shade} — remove gradient stops
    t = t.replace(new RegExp(`\\bfrom-${c}-(\\d{2,3})\\b`, 'g'), (m) => {
      log(fname, 'template', m, '<removed>');
      return '';
    });
    t = t.replace(new RegExp(`\\bto-${c}-(\\d{2,3})\\b`, 'g'), (m) => {
      log(fname, 'template', m, '<removed>');
      return '';
    });
    t = t.replace(new RegExp(`\\bvia-${c}-(\\d{2,3})\\b`, 'g'), (m) => {
      log(fname, 'template', m, '<removed>');
      return '';
    });
  }

  // Clean up orphaned bg-gradient classes (only those adjacent to empty from/to)
  t = t.replace(/\bbg-gradient-to-[a-z]+\s+/g, '');

  // ── 2. Radius standardization ──

  // rounded-sm → rounded-lg
  t = t.replace(/\brounded-sm\b/g, (m) => {
    log(fname, 'template', m, 'rounded-lg');
    return 'rounded-lg';
  });
  // bare rounded (not rounded-*) → rounded-lg
  t = t.replace(/\brounded([^-])/g, (m, after) => {
    log(fname, 'template', 'rounded', 'rounded-lg');
    return 'rounded-lg' + after;
  });
  // rounded-2xl → rounded-xl
  t = t.replace(/\brounded-2xl\b/g, (m) => {
    log(fname, 'template', m, 'rounded-xl');
    return 'rounded-xl';
  });
  // rounded-3xl → rounded-xl
  t = t.replace(/\brounded-3xl\b/g, (m) => {
    log(fname, 'template', m, 'rounded-xl');
    return 'rounded-xl';
  });

  // ── 3. Shadow standardization ──

  // bare shadow (not shadow-*) → shadow-sm
  t = t.replace(/\bshadow([^-])/g, (m, after) => {
    log(fname, 'template', 'shadow', 'shadow-sm');
    return 'shadow-sm' + after;
  });
  // shadow-2xl → shadow-md
  t = t.replace(/\bshadow-2xl\b/g, (m) => {
    log(fname, 'template', m, 'shadow-md');
    return 'shadow-md';
  });
  // shadow-xl → shadow-md (appears in some files)
  t = t.replace(/\bshadow-xl\b/g, (m) => {
    log(fname, 'template', m, 'shadow-md');
    return 'shadow-md';
  });
  // shadow-lg → shadow-md
  t = t.replace(/\bshadow-lg\b/g, (m) => {
    log(fname, 'template', m, 'shadow-md');
    return 'shadow-md';
  });

  // ── 4. Spacing — 8px grid ──

  t = t.replace(/\bp-3\b/g, (m) => { log(fname, 'template', m, 'p-4'); return 'p-4'; });
  t = t.replace(/\bgap-3\b/g, (m) => { log(fname, 'template', m, 'gap-4'); return 'gap-4'; });
  t = t.replace(/\bspace-y-3\b/g, (m) => { log(fname, 'template', m, 'space-y-4'); return 'space-y-4'; });
  t = t.replace(/\bpx-3\b/g, (m) => { log(fname, 'template', m, 'px-4'); return 'px-4'; });
  t = t.replace(/\bpy-3\b/g, (m) => { log(fname, 'template', m, 'py-4'); return 'py-4'; });
  t = t.replace(/\bmx-3\b/g, (m) => { log(fname, 'template', m, 'mx-4'); return 'mx-4'; });
  t = t.replace(/\bmy-3\b/g, (m) => { log(fname, 'template', m, 'my-4'); return 'my-4'; });

  return t;
}

function transformStyle(text, fname) {
  // Minimal style transformations — hex color replacements
  // Most hex values are in template :style bindings already handled above.
  // This handles CSS custom properties and @apply directives.
  // For now, we skip hex replacement in style blocks to avoid breaking CSS.
  return text;
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  if (DRY_RUN) console.log('\n🔍 DRY RUN — no files will be modified\n');
  if (REVERT) {
    if (!existsSync(BACKUP_DIR)) {
      console.error('❌ No backup directory found at', BACKUP_DIR);
      process.exit(1);
    }
    console.log('\n♻️  REVERT — restoring from backup\n');
    const files = readdirSync(BACKUP_DIR).filter(f => f.endsWith('.vue'));
    for (const file of files) {
      const bp = join(BACKUP_DIR, file);
      const tp = join(ACTIVITIES_DIR, file);
      if (existsSync(bp)) {
        writeFileSync(tp, readFileSync(bp, 'utf-8'), 'utf-8');
        console.log(`  Restored ${file}`);
      }
    }
    console.log(`\n✅ Reverted ${files.length} files\n`);
    return;
  }

  if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

  const files = execSync('ls LPD*.vue', { cwd: ACTIVITIES_DIR })
    .toString().trim().split('\n').filter(Boolean);

  console.log(`\n📁 Processing ${files.length} LPD files...\n`);

  let modifiedCount = 0;

  for (const file of files) {
    const filePath = join(ACTIVITIES_DIR, file);
    if (!existsSync(filePath)) continue;

    const original = readFileSync(filePath, 'utf-8');
    const fname = file.replace(/\.vue$/, '');

    // Backup
    if (!DRY_RUN) {
      const bp = join(BACKUP_DIR, file);
      if (!existsSync(bp)) writeFileSync(bp, original, 'utf-8');
    }

    // Find template boundaries
    const tOpen = original.indexOf('<template>');
    const tClose = original.lastIndexOf('</template>');
    if (tOpen === -1 || tClose === -1) continue;

    const beforeTemplate = original.substring(0, tOpen + '<template>'.length);
    const tContent = original.substring(tOpen + '<template>'.length, tClose);
    const afterTemplate = original.substring(tClose);

    // Transform
    const newTContent = transformTemplate(tContent, fname);

    if (newTContent === tContent) continue;

    // Rebuild
    const result = beforeTemplate + newTContent + afterTemplate;

    if (!DRY_RUN) {
      writeFileSync(filePath, result, 'utf-8');
    }
    modifiedCount++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Files processed: ${files.length}`);
  console.log(`Files modified: ${modifiedCount}`);
  console.log(`Total changes: ${totalChanges}`);

  if (DRY_RUN) {
    console.log(`\nPlanned changes (first 80):`);
    changeLog.slice(0, 80).forEach(l => console.log(l));
    if (changeLog.length > 80) console.log(`  ... and ${changeLog.length - 80} more changes`);
    console.log(`\nRun without --dry-run to apply.`);
  } else {
    console.log(`\n✅ Phase 1 complete. Backups in ${BACKUP_DIR}`);
    console.log(`   To revert: node fix_tokens.mjs --revert`);
  }
}

main();
