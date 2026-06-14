#!/usr/bin/env node
/**
 * SWISS ARMY KNIFE CLI 🔧⚡
 * Unified tool for the Activity System.
 *
 * 1. Uses Gemini CLI
 * 2. Choose tool: Create / Improve / Activate activity
 *
 * Usage: node scripts/swiss.mjs
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚙ QUICK CONFIG — Change Gemini model on the line below:
 * ═══════════════════════════════════════════════════════════════
 */

const GEMINI_MODEL = "gemini-2.5-pro"; // ← Change this when at capacity.

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import readline from "readline";
import { fileURLToPath } from "url";
import os from "os";
import { diffLines } from "diff";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECT PATHS
// ═══════════════════════════════════════════════════════════════════════════════

const ROOT = path.resolve(__dirname);

const PATHS = {
  activities: path.resolve(ROOT, "src", "components", "activities"),
  lessons: path.resolve(ROOT, "src", "lessons"),
  agentGuide: path.resolve(ROOT, "AGENTS.md"),
  memory: path.resolve(ROOT, "scripts", "swiss-memory.json"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// TERMINAL COLORS
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
  white: "\x1b[37m",
  bg: {
    green: "\x1b[42m",
    red: "\x1b[41m",
    blue: "\x1b[44m",
    yellow: "\x1b[43m",
    magenta: "\x1b[45m",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION MEMORY
// ═══════════════════════════════════════════════════════════════════════════════

function loadMemory() {
  try {
    if (fs.existsSync(PATHS.memory)) {
      return JSON.parse(fs.readFileSync(PATHS.memory, "utf-8"));
    }
  } catch (e) {}
  return {
    lastActivity: null,
    lastActionKey: null,
    lastSubTarget: null,
    lastPrompt: null,
    lastModel: null,
    lastUpdated: null,
  };
}

function saveMemory(updates) {
  try {
    let memory = loadMemory();
    memory = { ...memory, ...updates, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(PATHS.memory, JSON.stringify(memory, null, 2), "utf-8");
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// GEMINI CLI CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const AI_CONFIG = {
  modelName: GEMINI_MODEL,
  command: "gemini.cmd",
};

const RETRY_CONFIG = {
  maxAttempts: 3,
  timeout: 300000,
  delayBetweenRetries: 2000,
};
const AUTO_FIX_CONFIG = {
  maxAttempts: 3,
};
const CONTEXT_CONFIG = {
  trimReference: process.argv.includes("--trim-reference"),
  maxReferenceChars: 24000,
};
const PRE_SAVE_GUARD = {
  enabled: !process.argv.includes("--no-guard"),
  timeout: 120000,
};
const DRY_RUN = process.argv.includes("--dry-run");

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITY CLASSIFIER & VUE COMPILER EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

function extractBlock(code, blockType) {
  if (blockType === "all") return code;
  try {
    const { descriptor } = parse(code);
    let block = null;
    if (blockType === "template") block = descriptor.template;
    else if (blockType === "script")
      block = descriptor.scriptSetup || descriptor.script;
    else if (blockType === "style")
      block = descriptor.styles && descriptor.styles[0];
    if (!block) return null;
    const contentStart = block.loc.start.offset;
    const contentEnd = block.loc.end.offset;
    const trueStart = code.lastIndexOf(`<${blockType}`, contentStart);
    const closeTag = `</${blockType}>`;
    const closeTagIndex = code.indexOf(closeTag, contentEnd);
    const trueEnd =
      closeTagIndex !== -1 ? closeTagIndex + closeTag.length : code.length;
    return code.substring(trueStart, trueEnd);
  } catch (error) {
    console.log(
      `\n${C.yellow}⚠️ SFC Parser error. Falling back to regex for <${blockType}>...${C.reset}`,
    );
    const fallbackMatch = code.match(
      new RegExp(`<${blockType}[^>]*>([\\s\\S]*?)<\\/${blockType}>`, "i"),
    );
    return fallbackMatch ? fallbackMatch[0] : null;
  }
}

const SCIENCE_KEYWORDS = [
  "force",
  "kracht",
  "newton",
  "atom",
  "fysica",
  "physics",
  "chemie",
  "gas",
  "molecule",
  "ion",
  "temperatuur",
  "druk",
  "energie",
  "simulat",
  "lab",
  "biology",
  "cel",
  "zwaartekracht",
  "gravity",
  "velocity",
  "snelheid",
  "massa",
];
const MATHS_KEYWORDS = [
  "equation",
  "vergelijking",
  "function",
  "functie",
  "graph",
  "grafiek",
  "parabool",
  "lineair",
  "kwadraat",
  "trigonometry",
  "vector",
  "algebra",
  "geometry",
  "meetkunde",
  "pythagoras",
  "driehoek",
  "triangle",
  "math",
  "reken",
  "formule",
  "hoek",
  "graden",
  "sinus",
  "cosinus",
  "tangens",
  "wortel",
  "breuk",
  "percentage",
];

function classifyActivity(code, filename) {
  const lower = code.toLowerCase();
  const nameLower = filename.toLowerCase();
  const features = {
    hasTabs: /activeTab|tabs?\s*=\s*ref/i.test(code),
    hasSVG: /<svg[\s>]/i.test(code),
    hasCanvas: /<canvas[\s>]/i.test(code) || /getContext\s*\(/i.test(code),
    hasChartJS: /vue-chartjs|chart\.js|ChartJS/i.test(code),
    hasDragDrop: /@dragstart|@drop|draggable/i.test(code),
    hasAnimations: /@keyframes|animation:|transition-all|animate-/i.test(code),
  };
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/i);
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const blocks = {
    scriptLines: scriptMatch ? scriptMatch[1].split("\n").length : 0,
    templateLines: templateMatch ? templateMatch[1].split("\n").length : 0,
    styleLines: styleMatch ? styleMatch[1].split("\n").length : 0,
    totalLines: code.split("\n").length,
  };
  const tabNamesMatch = code.match(/v-for="[^"]*in\s*\[([^\]]+)\]/);
  const tabNames = tabNamesMatch
    ? tabNamesMatch[1]
        .replace(/'/g, "")
        .split(",")
        .map((s) => s.trim())
    : [];
  let scienceScore = SCIENCE_KEYWORDS.filter(
    (kw) => lower.includes(kw) || nameLower.includes(kw),
  ).length;
  let mathsScore = MATHS_KEYWORDS.filter(
    (kw) => lower.includes(kw) || nameLower.includes(kw),
  ).length;
  let type = "generic-interactive";
  if (scienceScore > mathsScore && scienceScore >= 3) type = "science-sim";
  else if (mathsScore > scienceScore && mathsScore >= 3)
    type = "maths-exercise";
  return { type, features, blocks, tabNames };
}

function printFingerprint(filename, fp) {
  const typeLabels = {
    "science-sim": `${C.bg.blue}${C.white}${C.bright} 🔬 Science Simulation ${C.reset}`,
    "maths-exercise": `${C.bg.magenta}${C.white}${C.bright} 📐 Maths Exercise ${C.reset}`,
    "generic-interactive": `${C.bg.yellow}${C.bright} 🎮 Interactive Activity ${C.reset}`,
  };
  console.log(
    `\n${C.bright}${C.cyan}╭─── Activity Analysis ──────────────────────────────╮${C.reset}`,
  );
  console.log(
    `${C.cyan}│${C.reset} ${C.bright}Activity:${C.reset} ${filename.replace(".vue", "")}`,
  );
  console.log(
    `${C.cyan}│${C.reset} ${C.bright}Type:${C.reset}       ${typeLabels[fp.type]}`,
  );
  console.log(
    `${C.cyan}│${C.reset} ${C.bright}Lines:${C.reset}      ${fp.blocks.totalLines} lines`,
  );
  console.log(
    `${C.bright}${C.cyan}╰───────────────────────────────────────────────────╯${C.reset}`,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMART XML CONTEXT INJECTION
// ═══════════════════════════════════════════════════════════════════════════════

function truncateForPrompt(code, maxChars = 16000) {
  if (!CONTEXT_CONFIG.trimReference) return code;
  if (!code || code.length <= maxChars) return code;
  const headSize = Math.floor(maxChars * 0.75);
  const tailSize = maxChars - headSize;
  return `${code.slice(0, headSize)}\n\n/* ... reference truncated for prompt efficiency ... */\n\n${code.slice(-tailSize)}`;
}

function getSmartContext(
  fingerprint,
  filename,
  actionKey,
  forcedReference = null,
) {
  let context = "";
  const isVisualTask = [
    "visuals",
    "tabs",
    "charts",
    "feedback",
    "create",
    "interactive",
    "custom",
  ].includes(actionKey);
  const isLogicTask = ["fix", "cleanup"].includes(actionKey);
  if (isVisualTask && fs.existsSync(PATHS.agentGuide)) {
    const full = fs.readFileSync(PATHS.agentGuide, "utf-8");
    const designMatch = full.match(/##\s*Design System[\s\S]*?(?=\n##\s|$)/i);
    if (designMatch) {
      context += `<design_system>\n${designMatch[0].substring(0, 1500)}\n</design_system>\n`;
    }
  }
  if (isLogicTask) {
    context += `<logic_rules>\nFocus STRICTLY on Vue 3 Composition API best practices, reactivity, and error handling. Do NOT alter styling or layout unless it is the direct cause of the bug.\n</logic_rules>\n`;
  }
  if (fingerprint.type === "science-sim") {
    context += `<science_directives>\nThis is a SCIENTIFIC SIMULATION. Ensure mathematically correct placement and scientific units.\n</science_directives>\n`;
  } else if (fingerprint.type === "maths-exercise") {
    context += `<maths_directives>\nThis is a MATHS EXERCISE. Focus on correct Unicode notation (², √, Δ, π) and robust SVG coordinate systems (viewBox mapping).\n</maths_directives>\n`;
  }
  const referenceFile =
    forcedReference || pickBestReference(fingerprint, filename);
  if (referenceFile) {
    const fullRefCode = readActivity(referenceFile);
    const targetBlock = fingerprint._targetBlock || "all";
    const rawRefCode =
      targetBlock === "all"
        ? fullRefCode
        : extractBlock(fullRefCode, targetBlock) || fullRefCode;
    const refCodeToSend = truncateForPrompt(
      rawRefCode,
      CONTEXT_CONFIG.maxReferenceChars,
    );
    context += `<reference_example file="${referenceFile}" block="${targetBlock}">\n\`\`\`vue\n${refCodeToSend}\n\`\`\`\n</reference_example>\n`;
  }
  return context;
}

function pickBestReference(fingerprint, currentFile) {
  const activities = listActivities().filter((f) => f !== currentFile);
  if (!activities.length) return null;
  let bestFile = null,
    bestScore = -1;
  for (const file of activities) {
    try {
      const fp = classifyActivity(readActivity(file), file);
      let score = fp.type === fingerprint.type ? 10 : 0;
      for (const [key, val] of Object.entries(fingerprint.features))
        if (val && fp.features[key]) score += 2;
      if (score > bestScore) {
        bestScore = score;
        bestFile = file;
      }
    } catch (e) {}
  }
  return bestFile;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
  {
    id: "fix",
    icon: "🎯",
    label: "Fix Bugs",
    description: "Analyze and fix bugs, missing imports, reactivity issues",
    showIf: () => true,
    smartBlock: (subTarget) =>
      !subTarget || subTarget === "template" ? "all" : "script",
    subMenu: {
      title: "What type of bug?",
      options: [
        { id: "imports", label: "Missing imports" },
        { id: "reactivity", label: "Reactivity issues" },
        { id: "template", label: "Template errors" },
        { id: "logic", label: "Logic errors" },
      ],
    },
    prompt: (subTarget) => {
      const targets = {
        imports:
          "Analyze and fix missing imports. Ensure all components, composables, and utilities are properly imported.",
        reactivity:
          "Analyze and fix reactivity issues. Check ref(), reactive(), computed() usage and ensure proper state management.",
        template:
          "Analyze and fix template errors. Check for syntax errors, invalid bindings, or missing definitions.",
        logic:
          "Analyze and fix logic errors in functions and calculations. Ensure all business logic is correct.",
      };
      return (
        targets[subTarget] ||
        "Analyze this code thoroughly for bugs, missing imports, reactivity issues, and template errors. Fix them while preserving functionality."
      );
    },
  },
  {
    id: "visuals",
    icon: "🎨",
    label: (fp) =>
      fp.features.hasCanvas ? "Improve Canvas & Physics" : "Improve Visuals",
    description: "Better colors, animations, and visual polish",
    showIf: () => true,
    smartBlock: "all",
    subMenu: {
      title: "What to improve?",
      options: [
        { id: "background", label: "Background" },
        { id: "colors", label: "Colors & Styling" },
        { id: "buttons", label: "Buttons & Controls" },
        { id: "animations", label: "Animations & Transitions" },
      ],
    },
    prompt: (subTarget, fp) => {
      const targets = {
        background:
          "Improve the background. Make it visually appealing and appropriate for the activity theme.",
        colors:
          "Improve the color scheme. Ensure good contrast, consistent palette, and appropriate mood.",
        buttons:
          "Improve buttons and interactive controls. Make them more visually appealing and intuitive.",
        animations:
          "Improve animations and transitions. Add smooth micro-animations that enhance UX without being distracting.",
      };
      const base =
        targets[subTarget] || "Significantly improve the visual quality.";
      return base + (fp.features.hasSVG ? " Optimize SVG rendering." : "");
    },
  },
  {
    id: "charts",
    icon: "📊",
    label: "Improve Charts & Data",
    description: "Optimize axis labels, tooltips and data",
    showIf: (fp) => fp.features.hasChartJS || fp.features.hasSVG,
    smartBlock: "all",
    subMenu: {
      title: "What to improve?",
      options: [
        { id: "axis", label: "Axis labels" },
        { id: "tooltips", label: "Tooltips & Legends" },
        { id: "data", label: "Data accuracy" },
        { id: "responsive", label: "Responsiveness" },
      ],
    },
    prompt: (subTarget) => {
      const targets = {
        axis: "Optimize axis labels and scales. Ensure clear units, readable font sizes, and appropriate intervals.",
        tooltips:
          "Improve tooltips and legends. Make them informative, well-styled, and non-intrusive.",
        data: "Verify and improve data accuracy. Ensure calculations are correct and data representation is meaningful.",
        responsive:
          "Improve responsiveness. Ensure charts resize properly and remain usable on different screen sizes.",
      };
      return (
        targets[subTarget] ||
        "Optimize data display, chart configuration, axis labels and responsiveness."
      );
    },
  },
  {
    id: "tabs",
    icon: "➕",
    label: "Add New Tab/Step",
    description: "Add an extra step to this activity",
    showIf: (fp) => fp.features.hasTabs,
    smartBlock: "all",
    subMenu: {
      title: "What to add?",
      options: [
        { id: "sequence", label: "New step in sequence" },
        { id: "parallel", label: "New parallel tab" },
        { id: "exercise", label: "New exercise type" },
      ],
    },
    prompt: (subTarget, fp) => {
      const targets = {
        sequence:
          "Add a logical new step to the existing sequence. Existing tabs: " +
          fp.tabNames.join(", ") +
          ".",
        parallel:
          "Add a new parallel tab that offers an alternative path or view.",
        exercise: "Add a new type of exercise to diversify the activity.",
      };
      return (
        targets[subTarget] ||
        "Add a logical new tab or step. Existing tabs: " +
          fp.tabNames.join(", ") +
          "."
      );
    },
  },
  {
    id: "feedback",
    icon: "💬",
    label: "Better Student Feedback",
    description: "Improve correct/wrong answer texts",
    showIf: () => true,
    smartBlock: "all",
    subMenu: {
      title: "What to improve?",
      options: [
        { id: "tone", label: "Encouragement tone" },
        { id: "hints", label: "Hint quality" },
        { id: "language", label: "Language level" },
        { id: "explanation", label: "Error explanation" },
      ],
    },
    prompt: (subTarget) => {
      const targets = {
        tone: "Rewrite feedback with a more encouraging, positive tone. Celebrate correct answers enthusiastically.",
        hints:
          "Improve hints. When wrong, provide progressively helpful hints that guide without giving away the answer.",
        language:
          "Adjust language level. Ensure feedback is clear, concise, and age-appropriate.",
        explanation:
          "Improve error explanations. Explain WHY an answer is wrong, not just that it is. Help students understand concepts.",
      };
      return (
        targets[subTarget] ||
        'Rewrite ALL feedback texts. Make correct answers encouraging, and wrong answers constructive (provide hints). NEVER show "correct" / "wrong" but explain WHY.'
      );
    },
  },
  {
    id: "cleanup",
    icon: "🧹",
    label: "Clean Up Code",
    description: "Refactor code (functionality stays the same)",
    showIf: (fp) => fp.blocks.totalLines > 200,
    smartBlock: "all",
    subMenu: {
      title: "What to clean?",
      options: [
        { id: "deadcode", label: "Remove dead code" },
        { id: "logic", label: "Simplify logic" },
        { id: "style", label: "Code style" },
        { id: "comments", label: "Comments & docs" },
      ],
    },
    prompt: (subTarget) => {
      const targets = {
        deadcode:
          "Remove dead code: unused variables, commented-out sections, redundant computations, and obsolete imports.",
        logic:
          "Simplify complex logic. Break down nested conditionals, extract helper functions, and improve readability.",
        style:
          "Ensure consistent code style: formatting, naming conventions, and proper use of Vue 3 patterns.",
        comments:
          "Improve comments and documentation. Add useful docs where missing, remove redundant comments.",
      };
      return (
        targets[subTarget] ||
        "Refactor and clean up this code. Remove dead code, simplify logic, ensure consistent code style."
      );
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DIFF ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

function generateDiffPreview(oldCode, newCode) {
  const parts = diffLines(oldCode, newCode);
  let added = 0,
    removed = 0;
  const diffResult = [];
  for (const part of parts) {
    const lines = part.value.replace(/\n$/, "").split("\n");
    if (part.added) {
      added += lines.length;
      diffResult.push(...lines.map((l) => ({ type: "+", line: l })));
    } else if (part.removed) {
      removed += lines.length;
      diffResult.push(...lines.map((l) => ({ type: "-", line: l })));
    }
  }
  return {
    added,
    removed,
    diffLines: diffResult,
    oldLength: oldCode.split("\n").length,
    newLength: newCode.split("\n").length,
  };
}

function printDiffSummary(diff) {
  console.log(
    `\n${C.bright}${C.cyan}╭─── Diff Preview ─────────────────────────────────╮${C.reset}`,
  );
  console.log(
    `${C.cyan}│${C.reset} ${C.green}+${diff.added} added${C.reset}  ${C.red}-${diff.removed} removed${C.reset}`,
  );
  console.log(
    `${C.cyan}│${C.reset} ${diff.oldLength} → ${diff.newLength} lines`,
  );
  console.log(
    `${C.bright}${C.cyan}╰───────────────────────────────────────────────────╯${C.reset}`,
  );
}

function printDiffFull(diff) {
  console.log(`\n${C.bright}${C.cyan}=== Full Diff ===${C.reset}\n`);
  diff.diffLines.forEach((l) => {
    if (l.type === "+") console.log(`${C.green}+ ${l.line}${C.reset}`);
    else console.log(`${C.red}- ${l.line}${C.reset}`);
  });
  console.log("");
}

function extractCodeFromAIResult(result) {
  const codeRegex = new RegExp(
    `\`\`\`(?:vue|html|js|javascript)?\\s*([\\s\\S]*?)\`\`\``,
    "i",
  );
  const match = result.match(codeRegex);
  if (match && match[1]) return match[1].trim();
  if (result.includes("<template>") || result.includes("<script")) {
    const firstTagIndex = result.search(/<(template|script|style)/i);
    if (firstTagIndex !== -1) return result.substring(firstTagIndex).trim();
  }
  return null;
}

function formatSFCError(error) {
  if (!error) return "Unknown compiler error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return String(error);
}

function validateVueSFC(code, filename = "Activity.vue") {
  try {
    const { descriptor, errors } = parse(code, { filename });
    if (errors && errors.length > 0) {
      return { ok: false, reason: formatSFCError(errors[0]) };
    }
    if (!descriptor.template) {
      return { ok: false, reason: "Missing <template> block" };
    }
    if (!descriptor.script && !descriptor.scriptSetup) {
      return { ok: false, reason: "Missing <script> or <script setup> block" };
    }

    let bindingMetadata = {};
    const scriptId = `swiss-validate-${Date.now()}`;
    try {
      const scriptResult = compileScript(descriptor, {
        id: scriptId,
      });
      bindingMetadata = scriptResult.bindings || {};
    } catch (err) {
      return {
        ok: false,
        reason: `Script compile error: ${formatSFCError(err)}`,
      };
    }

    try {
      const templateResult = compileTemplate({
        source: descriptor.template.content,
        filename,
        id: scriptId,
        compilerOptions: {
          bindingMetadata,
        },
      });
      if (templateResult.errors && templateResult.errors.length > 0) {
        return {
          ok: false,
          reason: `Template compile error: ${formatSFCError(templateResult.errors[0])}`,
        };
      }
    } catch (err) {
      return {
        ok: false,
        reason: `Template compile error: ${formatSFCError(err)}`,
      };
    }

    return { ok: true, reason: null };
  } catch (err) {
    return { ok: false, reason: formatSFCError(err) };
  }
}

async function autoFixInvalidSFC({
  brokenCode,
  fallbackCode,
  filename,
  originalTask,
  initialReason,
}) {
  let currentCode = brokenCode;
  let currentReason = initialReason || "Unknown validation error";

  for (let attempt = 1; attempt <= AUTO_FIX_CONFIG.maxAttempts; attempt++) {
    console.log(
      `${C.yellow}⚠ Invalid SFC detected. Auto-fix attempt ${attempt}/${AUTO_FIX_CONFIG.maxAttempts}...${C.reset}`,
    );

    const fallbackSection = fallbackCode
      ? `<last_working_code>\n\`\`\`vue\n${fallbackCode}\n\`\`\`\n</last_working_code>`
      : "";

    const fixPrompt = `SYSTEM RULE: Do NOT greet, introduce yourself, or add closing remarks. Output ONLY: a single \`\`\`vue\`\`\` code block.

You are repairing a Vue 3 SFC that currently has syntax/compilation errors.

<validation_error>
${currentReason}
</validation_error>

<broken_code>
\`\`\`vue
${currentCode}
\`\`\`
</broken_code>

${fallbackSection}

<original_task>
${originalTask || "Fix and improve this activity"}
</original_task>

CRITICAL RULES:
- Return ONE complete valid Vue SFC in a single \`\`\`vue\`\`\` block.
- Keep the intended changes from <broken_code> as much as possible.
- Only change what is necessary to make the component compile and run.
- Do not add placeholders or TODO comments.`;

    let candidate = null;
    try {
      const result = await callAI(fixPrompt);
      candidate = extractCodeFromAIResult(result);
    } catch (err) {
      console.log(
        `${C.yellow}⚠ Auto-fix request failed: ${err.message}${C.reset}`,
      );
    }

    if (!candidate) {
      currentReason = "Could not extract code from auto-fix response";
      continue;
    }

    const validation = validateVueSFC(candidate, filename);
    if (validation.ok) {
      console.log(
        `${C.green}✓ Auto-fix succeeded on attempt ${attempt}.${C.reset}`,
      );
      return { ok: true, code: candidate };
    }

    currentCode = candidate;
    currentReason = validation.reason;
  }

  return { ok: false, code: null, reason: currentReason };
}

function getTaskMode(actionKey) {
  if (["fix", "cleanup"].includes(actionKey)) return "logic";
  if (["visuals", "charts", "tabs", "feedback"].includes(actionKey))
    return "visual";
  return "mixed";
}

function getProjectScripts() {
  try {
    const packageJsonPath = path.resolve(ROOT, "package.json");
    if (!fs.existsSync(packageJsonPath)) return {};
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return pkg && pkg.scripts ? pkg.scripts : {};
  } catch {
    return {};
  }
}

function runPreSaveGuard() {
  return new Promise((resolve) => {
    if (!PRE_SAVE_GUARD.enabled) {
      resolve({
        skipped: true,
        ok: true,
        reason: "Guard disabled (use --no-guard to bypass)",
      });
      return;
    }

    const scripts = getProjectScripts();
    const hasBuild = typeof scripts.build === "string";
    const hasTypecheck = typeof scripts.typecheck === "string";

    if (!hasBuild && !hasTypecheck) {
      resolve({
        skipped: true,
        ok: true,
        reason: "No build/typecheck script found in package.json",
      });
      return;
    }

    const command = hasTypecheck ? "npm run typecheck" : "npm run build";
    const label = hasTypecheck ? "typecheck" : "build";

    const child = spawn(command, {
      cwd: ROOT,
      shell: true,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let finished = false;

    const timeoutId = setTimeout(() => {
      try {
        child.kill();
      } catch (e) {}
      finish({
        skipped: false,
        ok: false,
        reason: `${label} timed out after ${Math.round(PRE_SAVE_GUARD.timeout / 1000)}s`,
      });
    }, PRE_SAVE_GUARD.timeout);

    function finish(result) {
      if (finished) return;
      finished = true;
      clearTimeout(timeoutId);
      resolve(result);
    }

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      finish({ skipped: false, ok: false, reason: err.message || String(err) });
    });
    child.on("close", (code) => {
      if (code === 0) {
        finish({ skipped: false, ok: true, reason: `${label} passed` });
      } else {
        const output = `${stdout}\n${stderr}`.trim();
        const message = output || `${label} failed with exit code ${code}`;
        finish({ skipped: false, ok: false, reason: message });
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI INVOCATION
// ═══════════════════════════════════════════════════════════════════════════════

async function callAI(prompt) {
  if (DRY_RUN) return "```vue\n<!-- DRY RUN -->\n```";
  const { command, modelName } = AI_CONFIG;
  const tempPromptFile = path.join(
    os.tmpdir(),
    `swiss_prompt_${Date.now()}.txt`,
  );
  fs.writeFileSync(tempPromptFile, prompt, "utf-8");
  const attempt = () => {
    return new Promise((resolve, reject) => {
      const child = spawn(`${command} -m ${modelName} < "${tempPromptFile}"`, {
        cwd: ROOT,
        shell: true,
      });
      let finished = false;
      let stdout = "",
        stderr = "";
      const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
      let i = 0;
      const spinner = setInterval(() => {
        process.stdout.write(
          `\r${C.cyan}${spinnerFrames[i++ % spinnerFrames.length]} AI (${AI_CONFIG.modelName}) is working...${C.reset}`,
        );
      }, 80);
      const timeoutId = setTimeout(() => {
        try {
          child.kill();
        } catch (e) {}
        finish(
          new Error(
            `CLI timeout after ${Math.round(RETRY_CONFIG.timeout / 1000)}s`,
          ),
        );
      }, RETRY_CONFIG.timeout);

      function finish(err, value) {
        if (finished) return;
        finished = true;
        clearInterval(spinner);
        clearTimeout(timeoutId);
        process.stdout.write("\r\x1b[K");
        if (err) reject(err);
        else resolve(value);
      }

      child.stdout.on("data", (data) => (stdout += data.toString()));
      child.stderr.on("data", (data) => (stderr += data.toString()));
      child.on("close", (code) => {
        if (code === 0) finish(null, stdout.trim());
        else finish(new Error(`CLI exit ${code}: ${stderr}`));
      });
      child.on("error", (err) => finish(err));
    });
  };
  try {
    for (let i = 1; i <= RETRY_CONFIG.maxAttempts; i++) {
      if (i > 1)
        console.log(
          `\n${C.cyan}Attempt ${i}/${RETRY_CONFIG.maxAttempts}...${C.reset}`,
        );
      try {
        return await attempt();
      } catch (err) {
        console.log(`\n${C.yellow}⚠ Error: ${err.message}${C.reset}`);
        if (i < RETRY_CONFIG.maxAttempts)
          await new Promise((r) =>
            setTimeout(r, RETRY_CONFIG.delayBetweenRetries),
          );
      }
    }
  } finally {
    try {
      if (fs.existsSync(tempPromptFile)) fs.unlinkSync(tempPromptFile);
    } catch (e) {}
  }
  throw new Error("All attempts failed");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER (SANDWICH METHOD)
// ═══════════════════════════════════════════════════════════════════════════════

async function improveBlock(
  fullCode,
  blockType,
  description,
  fingerprint,
  filename,
  actionKey,
) {
  fingerprint._targetBlock = blockType;
  const smartContext = getSmartContext(fingerprint, filename, actionKey);
  const isFullFile = blockType === "all";
  const taskMode = getTaskMode(actionKey);
  let targetCode = isFullFile ? fullCode : extractBlock(fullCode, blockType);
  if (!targetCode && !isFullFile) {
    console.log(
      `\n${C.red}⚠️ Cannot parse <${blockType}> block. Switching to Full File.${C.reset}`,
    );
    targetCode = fullCode;
    blockType = "all";
  }
  const prompt = `SYSTEM RULE: Do NOT greet, introduce yourself, or add closing remarks. Output ONLY: a single \`\`\`vue\`\`\` code block.

OUTPUT CONSTRAINTS:
- Return ONLY one \`\`\`vue\`\`\` block with the final code.
- No reasoning, no commentary, no markdown outside that code block.
- No placeholder comments such as "existing code...".

You are an expert in Vue 3 and educational web components.
You are working on a component. Rules: script=${fingerprint.blocks.scriptLines}, template=${fingerprint.blocks.templateLines}.

<project_context>
${smartContext}
</project_context>

<code_to_modify>
\`\`\`vue
${targetCode}
\`\`\`
</code_to_modify>

=== YOUR SPECIFIC TASK ===
Here is the description of what you need to do with the <code_to_modify>:
"${description}"

CRITICAL RULES:
- You MUST return the requested code in a single \`\`\`vue\`\`\` block.
- You MUST NOT skip any unmodified code (no placeholder comments).
- Preserve imports, emits, props, component APIs and event names unless the task explicitly requires changing them.
- Keep existing Dutch instructional text unless the task explicitly asks to rewrite language.
- If task_mode is "logic": keep the UI visually identical.
- If task_mode is "visual": preserve business logic and scoring behavior.
- Do not change logic unrelated to this specific modification.

TASK MODE:
- task_mode: ${taskMode}

FINAL CHECKLIST (silent):
- Vue SFC remains valid.
- No undefined refs/computed/methods in template.
- No removed functionality not requested.`;

  console.log(`\n${C.cyan}AI is preparing (${blockType} block)...${C.reset}`);
  const result = await callAI(prompt);
  let extractedCode = extractCodeFromAIResult(result);
  if (
    !extractedCode &&
    (result.includes("<template>") || result.includes("<script"))
  ) {
    console.log(
      `\n${C.yellow}⚠️ AI forgot markdown backticks. Fallback activated.${C.reset}`,
    );
    extractedCode = extractCodeFromAIResult(result);
  }
  if (!extractedCode) {
    console.log(
      `\n${C.red}⚠️ ERROR: Could not find code in response.${C.reset}`,
    );
    return fullCode;
  }

  if (isFullFile) {
    const extractedValidation = validateVueSFC(extractedCode, filename);
    if (!extractedValidation.ok) {
      const autoFix = await autoFixInvalidSFC({
        brokenCode: extractedCode,
        fallbackCode: fullCode,
        filename,
        originalTask: description,
        initialReason: extractedValidation.reason,
      });
      if (!autoFix.ok) {
        console.log(
          `\n${C.yellow}⚠️ Auto-fix failed (${autoFix.reason}). Keeping original code.${C.reset}`,
        );
        return fullCode;
      }
      extractedCode = autoFix.code;
    }
    return extractedCode;
  }

  if (!isFullFile) {
    const oldBlock = extractBlock(fullCode, blockType);
    if (oldBlock) {
      console.log(`${C.green}✓ ${blockType} successfully merged!${C.reset}`);
      const sliceIndex = fullCode.indexOf(oldBlock);
      if (sliceIndex !== -1)
        extractedCode =
          fullCode.substring(0, sliceIndex) +
          extractedCode +
          fullCode.substring(sliceIndex + oldBlock.length);
      else extractedCode = fullCode.replace(oldBlock, () => extractedCode);
    }
  }

  const finalValidation = validateVueSFC(extractedCode, filename);
  if (!finalValidation.ok) {
    const autoFix = await autoFixInvalidSFC({
      brokenCode: extractedCode,
      fallbackCode: fullCode,
      filename,
      originalTask: description,
      initialReason: finalValidation.reason,
    });
    if (!autoFix.ok) {
      console.log(
        `\n${C.yellow}⚠️ Auto-fix failed (${autoFix.reason}). Keeping original code.${C.reset}`,
      );
      return fullCode;
    }
    return autoFix.code;
  }

  return extractedCode;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE I/O UTILS
// ═══════════════════════════════════════════════════════════════════════════════

function listActivities() {
  try {
    return fs
      .readdirSync(PATHS.activities)
      .filter((f) => f.endsWith(".vue"))
      .sort();
  } catch {
    return [];
  }
}
function readActivity(filename) {
  try {
    return fs.readFileSync(path.join(PATHS.activities, filename), "utf-8");
  } catch {
    return "";
  }
}
function writeActivity(filename, content) {
  const target = path.join(PATHS.activities, filename);
  if (fs.existsSync(target)) {
    try {
      fs.copyFileSync(target, target + ".bak");
    } catch (e) {}
  }
  fs.writeFileSync(target, content, "utf-8");
}

function autoRegisterActivity(filename, description) {
  const activities = listActivities().map((f) => {
    const name = f.replace(".vue", "");
    return {
      filename: f,
      componentName: name,
      kebabKey: toKebabCase(name),
      importPath: `../components/activities/${name}.vue`,
    };
  });
  if (activities.length > 0) {
    updateUseActivityFile(activities);
  }
  const testPath = path.resolve(ROOT, "src", "lessons", "testallactivities.js");
  if (fs.existsSync(testPath)) {
    const componentName = filename.replace(".vue", "");
    const camelCaseName =
      componentName.charAt(0).toLowerCase() + componentName.slice(1);
    const hyphenName = toKebabCase(componentName);
    let testCode = fs.readFileSync(testPath, "utf-8");
    if (!testCode.includes(`activityId: '${camelCaseName}'`)) {
      const cardMarker = `                {
                    id: 'card-custom-starter',`;
      const cleanDesc = description
        .replace(/[\r\n]+/g, " ")
        .replace(/'/g, "\\'")
        .substring(0, 50);
      const newCard = `                {
                    id: 'card-${hyphenName}',
                    type: 'digital',
                    title: '${componentName}',
                    description: '${cleanDesc}...',
                    action: 'activity',
                    activityId: '${camelCaseName}',
                    icon: 'PhStar'
                },\n`;
      testCode = testCode.replace(cardMarker, newCard + cardMarker);
      const actMarker = `        // Template
        customActivityStarter: {`;
      const newAct = `        ${camelCaseName}: {
            type: '${camelCaseName}',
            title: '${componentName}',
            instruction: 'New activity: ${componentName}'
        },\n\n        // Template\n        customActivityStarter: {`;
      testCode = testCode.replace(actMarker, newAct);
      fs.writeFileSync(testPath, testCode, "utf-8");
      console.log(
        `  ${C.green}✓ Added to test-all-activities.js test-suite${C.reset}`,
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function ask(rl, question) {
  return new Promise((resolve) =>
    rl.question(`${C.bright}${C.yellow} ${question}${C.reset} `, (answer) =>
      resolve(answer.replace(/[\r\n]+/g, " ").trim()),
    ),
  );
}

async function askMultiline(rl, question) {
  console.log(`\n${C.bright}${C.yellow} ${question}${C.reset}`);
  console.log(
    `${C.dim}(Paste your text. Press Enter twice or type 'DONE' on its own line to finish)${C.reset}\n`,
  );
  return new Promise((resolve) => {
    let lines = [];
    const onLine = (input) => {
      if (
        input.trim().toUpperCase() === "DONE" ||
        (input.trim() === "" &&
          lines.length > 0 &&
          lines[lines.length - 1].trim() === "")
      ) {
        rl.off("line", onLine);
        resolve(lines.join("\n").trim());
      } else {
        lines.push(input);
      }
    };
    rl.on("line", onLine);
  });
}

async function selectNumbered(rl, title, options) {
  console.log(`\n${C.bright}${C.magenta}=== ${title} ===${C.reset}\n`);
  options.forEach((opt, i) =>
    console.log(`  ${C.cyan}[${i + 1}]${C.reset} ${opt.label || opt}`),
  );
  console.log(`\n  ${C.dim}[0] Back / Exit${C.reset}\n`);
  while (true) {
    const ans = parseInt(await ask(rl, `Choose a number:`), 10);
    if (ans === 0) return null;
    if (ans > 0 && ans <= options.length) return options[ans - 1];
  }
}

async function selectSubTarget(rl, action) {
  const sub = action.subMenu;
  console.log(`\n${C.bright}${C.magenta}=== ${sub.title} ===${C.reset}\n`);
  sub.options.forEach((opt, i) =>
    console.log(`  ${C.cyan}[${i + 1}]${C.reset} ${opt.label}`),
  );
  console.log(`  ${C.green}[C]${C.reset} ${C.bright}Custom${C.reset}\n`);
  while (true) {
    const ans = (await ask(rl, "Choose:")).toLowerCase().trim();
    if (ans === "c") return null;
    const idx = parseInt(ans, 10) - 1;
    if (idx >= 0 && idx < sub.options.length) return sub.options[idx].id;
  }
}

async function loadTextFileMenu(rl, memory) {
  const downloadsDir = path.join(os.homedir(), "Downloads");
  const txtFiles = fs.existsSync(downloadsDir)
    ? fs
        .readdirSync(downloadsDir)
        .filter((f) => f.endsWith(".txt"))
        .sort((a, b) => {
          return (
            fs.statSync(path.join(downloadsDir, b)).mtimeMs -
            fs.statSync(path.join(downloadsDir, a)).mtimeMs
          );
        })
        .slice(0, 10)
    : [];
  const descOptions = [];
  if (memory && memory.lastPrompt) {
    const preview = memory.lastPrompt.substring(0, 50).replace(/\n/g, " ");
    descOptions.push(`🔄 Previous prompt: "${preview}..."`);
  }
  for (const f of txtFiles) {
    const sizeKB = (
      fs.statSync(path.join(downloadsDir, f)).size / 1024
    ).toFixed(1);
    descOptions.push(`📄 ${f} (${sizeKB} KB)`);
  }
  if (descOptions.length === 0) {
    console.log(`${C.yellow}No .txt files found in Downloads.${C.reset}`);
    return null;
  }
  const txtChoice = await selectNumbered(rl, "Choose a file:", descOptions);
  if (!txtChoice) return null;
  if (txtChoice.startsWith("🔄")) return memory.lastPrompt;
  if (txtChoice.startsWith("📄")) {
    const selectedTxt = txtChoice
      .replace(/^📄 /, "")
      .replace(/\s*\(.*?KB\)$/, "");
    console.log(`${C.green}✓ Loaded from ${selectedTxt}${C.reset}`);
    return fs.readFileSync(path.join(downloadsDir, selectedTxt), "utf-8");
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTIVE SESSION LAUNCHER
// ═══════════════════════════════════════════════════════════════════════════════

async function launchInteractiveSession(filename, fingerprint) {
  const activityCode = readActivity(filename);
  const smartContext = getSmartContext(fingerprint, filename, "interactive");
  const codeLines = activityCode.split("\n").length;
  const hasDesignSystem = smartContext.includes("<design_system>");
  const hasReference = smartContext.includes("<reference_example");
  const refMatch = smartContext.match(/file="([^"]+)"/);
  const refName = refMatch ? refMatch[1] : null;
  const contextContent = `# Interactive Session Context

## Activity: ${filename}

\`\`\`vue
${activityCode}
\`\`\`

${smartContext}

## Instructions

You are now helping iterate on the above Vue 3 activity component.
The user will describe what they want changed. Help with targeted improvements.
Keep the same code style and follow the design system above.
Respond in English unless asked otherwise.

When you modify code, ALWAYS return the full code (no placeholders).
`;
  const contextFileName = ".gemini-interactive-context.md";
  const contextFilePath = path.resolve(ROOT, contextFileName);
  fs.writeFileSync(contextFilePath, contextContent, "utf-8");
  console.log(
    `\n${C.bright}${C.cyan}╭─── Interactive Session Preparation ───────────────╮${C.reset}`,
  );
  console.log(
    `${C.cyan}│${C.reset} ${C.bright}Activity:${C.reset} ${filename} (${codeLines} lines)`,
  );
  if (hasDesignSystem)
    console.log(
      `${C.cyan}│${C.reset} ${C.bright}Design System:${C.reset} ${C.green}✓ Loaded${C.reset}`,
    );
  if (hasReference)
    console.log(
      `${C.cyan}│${C.reset} ${C.bright}Reference:${C.reset} ${refName || "Automatically chosen"}`,
    );
  console.log(
    `${C.cyan}│${C.reset} ${C.bright}Model:${C.reset} ${AI_CONFIG.modelName}`,
  );
  console.log(
    `${C.cyan}│${C.reset} ${C.bright}Context:${C.reset} ${contextFileName}`,
  );
  console.log(
    `${C.bright}${C.cyan}╰───────────────────────────────────────────────────╯${C.reset}`,
  );
  const initialPrompt = `Read the file ${contextFileName} in the current directory. This contains the Vue activity code and context I need help with. Briefly confirm what you see and ask what I want to change.`;
  const escapedPrompt = initialPrompt.replace(/"/g, '\\"');
  const cmd = `start wt cmd /k "cd /d "${ROOT}" && gemini.cmd -m ${AI_CONFIG.modelName} -i "${escapedPrompt}""`;
  spawn(cmd, { shell: true, detached: true, stdio: "ignore" });
  console.log(
    `\n${C.bright}${C.green}✓ Gemini CLI opened in new terminal window!${C.reset}`,
  );
  console.log(
    `${C.dim}  AI automatically reads the context. You can start chatting immediately.${C.reset}`,
  );
  console.log(
    `${C.dim}  Swiss knife stays open - you can return here when done.${C.reset}`,
  );
  console.log(
    `${C.dim}  (Context file: ${contextFileName} is kept for the session)${C.reset}\n`,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 1: CREATE NEW ACTIVITY
// ═══════════════════════════════════════════════════════════════════════════════

async function generateNewActivity(rl, memory) {
  const newName = await ask(
    rl,
    "What should the file be named? (e.g. GravitySimulation):",
  );
  if (!newName) return;
  const finalFilename = newName.endsWith(".vue") ? newName : newName + ".vue";
  console.log(`\n${C.bright}${C.magenta}=== Describe Activity ===${C.reset}\n`);
  console.log(`  ${C.cyan}[1]${C.reset} Scan for .txt files (Downloads)`);
  console.log(
    `  ${C.cyan}[2]${C.reset} Write a custom prompt directly in the terminal`,
  );
  console.log(`\n  ${C.dim}[0] Back / Exit${C.reset}\n`);

  const promptSourceChoice = await ask(rl, "Choose:");
  let description = null;
  if (promptSourceChoice === "1") {
    description = await loadTextFileMenu(rl, memory);
  } else if (promptSourceChoice === "2") {
    description = await askMultiline(
      rl,
      "Describe the new activity in detail:",
    );
  } else {
    return;
  }
  if (!description) return;

  console.log(`\n${C.bright}${C.magenta}=== Reference Activity ===${C.reset}`);
  const activities = listActivities();
  console.log(`${C.dim}DEBUG: Found ${activities.length} activities${C.reset}`);
  console.log(
    `${C.dim}DEBUG: PATHS.activities = ${PATHS.activities}${C.reset}`,
  );
  const fileOptions = [];
  for (const f of activities) {
    try {
      const content = readActivity(f);
      const fp = classifyActivity(content, f);
      const icon =
        fp.type === "science-sim"
          ? "🔬"
          : fp.type === "maths-exercise"
            ? "📐"
            : "🎮";
      fileOptions.push({ value: f, label: `${icon} ${f.replace(".vue", "")}` });
    } catch (e) {
      console.log(
        `${C.dim}DEBUG: Error processing ${f}: ${e.message}${C.reset}`,
      );
    }
  }
  console.log(
    `${C.dim}DEBUG: fileOptions has ${fileOptions.length} entries${C.reset}`,
  );
  const refOptions = [
    { label: "🤖 Let AI automatically choose the best" },
    ...fileOptions,
  ];
  const pickedRef = await selectNumbered(
    rl,
    "Which activity to use as template/base?",
    refOptions,
  );
  let forcedReference = null;
  if (pickedRef && pickedRef.value && pickedRef.value !== refOptions[0].value) {
    forcedReference = pickedRef.value;
    console.log(
      `\n${C.green}✓ "${forcedReference}" set as fixed reference!${C.reset}`,
    );
  } else {
    console.log(
      `\n${C.dim}AI will automatically choose reference based on keywords...${C.reset}`,
    );
  }

  const pseudoFingerprint = classifyActivity(description, finalFilename);
  pseudoFingerprint.blocks = {
    scriptLines: 50,
    templateLines: 50,
    styleLines: 50,
    totalLines: 150,
  };
  const smartContext = getSmartContext(
    pseudoFingerprint,
    finalFilename,
    "create",
    forcedReference,
  );

  const prompt = `SYSTEM RULE: Do NOT greet, introduce yourself, or add closing remarks. Output ONLY: a single \`\`\`vue\`\`\` code block.

OUTPUT CONSTRAINTS:
- Return ONLY one \`\`\`vue\`\`\` block with final code.
- No reasoning, no commentary, no markdown outside that code block.
- No placeholder comments such as "implement later" or "existing code...".

You are an expert in Vue 3 and educational web components.
You are creating a brand new component named ${finalFilename}.

<project_context>
${smartContext}
</project_context>

=== YOUR SPECIFIC TASK ===
Create a completely new Vue 3 component based on this description:
"${description}"

CRITICAL RULES:
- You MUST return a complete Vue 3 SFC (Single File Component) with \`<template>\`, \`<script setup>\`, and optionally \`<style scoped>\`.
- Use the <reference_example> from project_context as a strong base and inspiration for structure and imports. Adapt it correctly for the new activity.
- Keep language and tone classroom-appropriate (Dutch-friendly copy is allowed).
- Build for desktop and mobile responsiveness.
- Avoid external dependencies that are not already present in the reference.
- Write clean, working code with no missing refs/functions used by the template.

FINAL CHECKLIST (silent):
- Vue SFC is valid and self-contained.
- All template bindings resolve to defined state/computed/methods.
- No dead code, no TODO placeholders.
- Student flow works end-to-end on first run.`;

  console.log(
    `\n${C.cyan}AI is generating new activity (${finalFilename}). This may take a while...${C.reset}`,
  );
  const result = await callAI(prompt);
  let extractedCode = extractCodeFromAIResult(result);
  if (
    !extractedCode &&
    (result.includes("<template>") || result.includes("<script"))
  ) {
    console.log(
      `\n${C.yellow}⚠️ AI forgot markdown backticks. Fallback activated.${C.reset}`,
    );
    extractedCode = extractCodeFromAIResult(result);
  }
  if (!extractedCode) {
    console.log(
      `\n${C.red}⚠️ ERROR: Could not find code in response.${C.reset}`,
    );
    return;
  }

  const validation = validateVueSFC(extractedCode, finalFilename);
  if (!validation.ok) {
    const autoFix = await autoFixInvalidSFC({
      brokenCode: extractedCode,
      fallbackCode: null,
      filename: finalFilename,
      originalTask: description,
      initialReason: validation.reason,
    });
    if (autoFix.ok) {
      extractedCode = autoFix.code;
    }
  }

  const finalValidation = validateVueSFC(extractedCode, finalFilename);
  if (!finalValidation.ok) {
    console.log(
      `\n${C.red}⚠️ Generated component is invalid (${finalValidation.reason}). Not saved.${C.reset}`,
    );
    return;
  }
  console.log(
    `\n${C.bright}${C.green}✓ New activity generated successfully!${C.reset}`,
  );
  console.log(
    `\n${C.bright}${C.cyan}╭─── Code Preview ─────────────────────────────────╮${C.reset}`,
  );
  console.log(
    `${C.cyan}│${C.reset} ${extractedCode.split("\n").length} lines generated.`,
  );
  console.log(
    `${C.bright}${C.cyan}╰───────────────────────────────────────────────────╯${C.reset}`,
  );

  let decided = false;
  while (!decided) {
    const choice = (
      await ask(rl, "Save? [Y]es (Enter) | [N]o | [V]iew code:")
    ).toLowerCase();
    if (choice === "y" || choice === "yes" || choice === "") {
      writeActivity(finalFilename, extractedCode);
      console.log(
        `${C.bright}${C.green}✓ Saved as ${finalFilename}!${C.reset}`,
      );
      autoRegisterActivity(finalFilename, description);
      saveMemory({
        lastActivity: finalFilename,
        lastActionKey: "create",
        lastPrompt: description,
      });
      decided = true;
    } else if (choice === "n" || choice === "no") {
      console.log(`${C.yellow}✗ Not saved.${C.reset}`);
      decided = true;
    } else if (choice === "v" || choice === "view") {
      console.log(`\n${extractedCode}\n`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 2: IMPROVE EXISTING ACTIVITY
// ═══════════════════════════════════════════════════════════════════════════════

async function improveActivity(rl, memory) {
  const activities = listActivities();
  const fileOptions = activities.map((f) => {
    const fp = classifyActivity(readActivity(f), f);
    const icon =
      fp.type === "science-sim"
        ? "🔬"
        : fp.type === "maths-exercise"
          ? "📐"
          : "🎮";
    return { value: f, label: `${icon} ${f.replace(".vue", "")}` };
  });

  const filenameObj = await selectNumbered(
    rl,
    "Which activity do you want to improve?",
    fileOptions,
  );
  if (!filenameObj) return;
  const filename = filenameObj.value;

  let iterationDone = false;
  let instantPrompt = null;

  while (!iterationDone) {
    const freshCode = readActivity(filename);
    const fingerprint = classifyActivity(freshCode, filename);
    let selectedAction = null;
    let currentDesc = "";
    let targetBlock = "all";

    if (instantPrompt) {
      selectedAction = { key: "custom", label: "Custom Iteration" };
      currentDesc = instantPrompt;
      instantPrompt = null;
    } else {
      printFingerprint(filename, fingerprint);
      const availableActions = QUICK_ACTIONS.filter((a) =>
        a.showIf(fingerprint),
      );
      console.log(
        `\n${C.bright}${C.magenta}=== What do you want to do with ${filename.replace(".vue", "")}? ===${C.reset}\n`,
      );
      availableActions.forEach((action, idx) => {
        const lbl =
          typeof action.label === "function"
            ? action.label(fingerprint)
            : action.label;
        console.log(
          `  ${C.cyan}[${idx + 1}]${C.reset} ${action.icon} ${C.bright}${lbl}${C.reset}`,
        );
      });
      console.log(
        `\n  ${C.green}[C]${C.reset} ✏️  ${C.bright}Something else (Custom input)${C.reset}`,
      );
      console.log(
        `  ${C.blue}[I]${C.reset} 🖥️  ${C.bright}Interactive session (Gemini CLI in terminal)${C.reset}`,
      );
      if (memory.lastActivity === filename && memory.lastActionKey) {
        console.log(
          `  ${C.yellow}[R]${C.reset} 🔄 ${C.bright}Repeat previous action${C.reset}`,
        );
      }
      console.log(`  ${C.dim}[0] Back to tools${C.reset}\n`);

      const choice = await ask(rl, "Choose:");
      if (choice === "0") return;
      if (choice.toLowerCase() === "c") {
        // Custom input submenu
        console.log(
          `\n${C.bright}${C.magenta}=== Custom Input ===${C.reset}\n`,
        );
        console.log(`  ${C.cyan}[1]${C.reset} Scan for .txt files (Downloads)`);
        console.log(
          `  ${C.cyan}[2]${C.reset} Write a custom prompt directly in the terminal`,
        );
        console.log(`\n  ${C.dim}[0] Back${C.reset}\n`);

        const customChoice = await ask(rl, "Choose:");
        if (customChoice === "1") {
          const loadedTxt = await loadTextFileMenu(rl, memory);
          if (!loadedTxt) continue;
          currentDesc = loadedTxt;
        } else if (customChoice === "2") {
          currentDesc = await askMultiline(
            rl,
            "Describe what you want to change:",
          );
          if (!currentDesc) continue;
        } else {
          continue; // Back
        }
        selectedAction = { key: "custom", label: "Custom Iteration" };
      } else if (choice.toLowerCase() === "i") {
        await launchInteractiveSession(filename, fingerprint);
        const continueChoice = await ask(
          rl,
          "Continue in swiss knife? [Enter=Yes / N=Exit]:",
        );
        if (continueChoice.toLowerCase() === "n") {
          iterationDone = true;
          return;
        }
        continue;
      } else if (
        choice.toLowerCase() === "r" &&
        memory.lastActivity === filename &&
        memory.lastActionKey
      ) {
        selectedAction = availableActions.find(
          (a) => a.id === memory.lastActionKey,
        ) || { key: "custom" };
        selectedAction.subTarget = memory.lastSubTarget || null;
        if (selectedAction.id && typeof selectedAction.prompt === "function") {
          currentDesc = selectedAction.prompt(
            memory.lastSubTarget,
            fingerprint,
          );
          if (!currentDesc) currentDesc = memory.lastPrompt || "";
        } else {
          currentDesc = memory.lastPrompt || "";
        }
      } else {
        const idx = parseInt(choice, 10) - 1;
        if (idx >= 0 && idx < availableActions.length) {
          selectedAction = availableActions[idx];
          selectedAction.key = selectedAction.id;
          const subTarget = await selectSubTarget(rl, selectedAction);
          selectedAction.subTarget = subTarget;
          if (subTarget === null) {
            // Custom input submenu
            console.log(
              `\n${C.bright}${C.magenta}=== Custom Input ===${C.reset}\n`,
            );
            console.log(
              `  ${C.cyan}[1]${C.reset} Scan for .txt files (Downloads)`,
            );
            console.log(
              `  ${C.cyan}[2]${C.reset} Write a custom prompt directly in the terminal`,
            );
            console.log(`\n  ${C.dim}[0] Back${C.reset}\n`);

            const customChoice = await ask(rl, "Choose:");
            if (customChoice === "1") {
              const loadedTxt = await loadTextFileMenu(rl, memory);
              if (!loadedTxt) continue;
              currentDesc = loadedTxt;
            } else if (customChoice === "2") {
              currentDesc = await askMultiline(
                rl,
                "Describe what you want to change:",
              );
              if (!currentDesc) continue;
            } else {
              continue; // Back
            }
          } else {
            currentDesc = selectedAction.prompt(subTarget, fingerprint);
          }
        }
      }
      if (!selectedAction) continue;
      if (typeof selectedAction.smartBlock === "function") {
        targetBlock = selectedAction.smartBlock(selectedAction.subTarget);
      } else {
        targetBlock = selectedAction.smartBlock || "all";
      }
      if (!currentDesc) continue;
    }

    // CALL AI
    const newCode = await improveBlock(
      freshCode,
      targetBlock,
      currentDesc,
      fingerprint,
      filename,
      selectedAction.key,
    );
    if (newCode !== freshCode) {
      const diff = generateDiffPreview(freshCode, newCode);
      printDiffSummary(diff);
      writeActivity(filename, newCode);

      const guardResult = await runPreSaveGuard();
      if (guardResult.skipped) {
        console.log(
          `${C.dim}  Pre-save guard skipped: ${guardResult.reason}${C.reset}`,
        );
      } else if (guardResult.ok) {
        console.log(
          `${C.green}✓ Pre-save guard passed (${guardResult.reason})${C.reset}`,
        );
      } else {
        console.log(
          `${C.yellow}⚠ Pre-save guard failed. Restoring backup before accept/reject step.${C.reset}`,
        );
        const backupPath = path.join(PATHS.activities, filename + ".bak");
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, path.join(PATHS.activities, filename));
          try {
            fs.unlinkSync(backupPath);
          } catch (e) {}
          console.log(
            `${C.yellow}⚠ Restored original file because guard failed:${C.reset} ${guardResult.reason}`,
          );
        } else {
          console.log(
            `${C.red}⚠ Guard failed and backup missing. Please restore manually.${C.reset}`,
          );
        }
        continue;
      }

      console.log(
        `\n${C.bright}${C.green}✓ Code automatically saved!${C.reset}`,
      );
      console.log(
        `${C.yellow}  Test the activity in your browser now...${C.reset}`,
      );
      console.log(`${C.dim}  (Backup saved as ${filename}.bak)${C.reset}`);

      let decided = false;
      while (!decided) {
        const choice = (
          await ask(
            rl,
            "\nDecision after test? [A]ccept (Enter) | [R]estore (backup) | [D]iff view:",
          )
        ).toLowerCase();
        if (choice === "a" || choice === "accept" || choice === "") {
          const backupPath = path.join(PATHS.activities, filename + ".bak");
          try {
            if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
          } catch (e) {}
          console.log(
            `${C.bright}${C.green}✓ Changes accepted! Backup deleted.${C.reset}`,
          );
          saveMemory({
            lastActivity: filename,
            lastActionKey: selectedAction.key,
            lastSubTarget: selectedAction.subTarget || null,
            lastPrompt: currentDesc,
          });
          decided = true;
        } else if (choice === "r" || choice === "restore") {
          const backupPath = path.join(PATHS.activities, filename + ".bak");
          if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, path.join(PATHS.activities, filename));
            try {
              fs.unlinkSync(backupPath);
            } catch (e) {}
            console.log(
              `${C.bright}${C.green}✓ Original code restored from backup!${C.reset}`,
            );
          } else {
            console.log(`${C.red}⚠ Backup file not found.${C.reset}`);
          }
          decided = true;
        } else if (choice === "d" || choice === "diff") {
          printDiffFull(diff);
        }
      }
    } else {
      console.log(`${C.yellow}⚠ No code changes generated.${C.reset}`);
    }

    console.log(
      `\n${C.bright}${C.magenta}=== Action complete. What now? ===${C.reset}`,
    );
    console.log(
      `  ${C.green}[Enter]${C.reset} Close file & return to tools menu`,
    );
    console.log(`  ${C.cyan}[M]${C.reset}     Action menu for this file`);
    console.log(
      `  ${C.yellow}[T]${C.reset}     Iterate with .txt from Downloads`,
    );
    console.log(`  ${C.dim}[C]${C.reset}     Iterate by typing`);
    console.log(
      `  ${C.blue}[I]${C.reset}     Open interactive session in terminal`,
    );

    const nextStep = (await ask(rl, "Choice:")).toLowerCase().trim();
    if (nextStep === "" || nextStep === "j") {
      iterationDone = true;
    } else if (nextStep === "t") {
      instantPrompt = await loadTextFileMenu(rl, memory);
    } else if (nextStep === "c") {
      instantPrompt = await askMultiline(
        rl,
        "Describe what else you want to change:",
      );
    } else if (nextStep === "i") {
      await launchInteractiveSession(filename, fingerprint);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 3: ACTIVATE ACTIVITY INTO LESSON (PRECISE)
// ═══════════════════════════════════════════════════════════════════════════════

function listLessons() {
  try {
    return fs
      .readdirSync(PATHS.lessons)
      .filter((f) => f.endsWith(".js") && !f.startsWith("_"))
      .sort();
  } catch {
    return [];
  }
}

function readLesson(filename) {
  const fullPath = path.join(PATHS.lessons, filename);
  let content;
  try {
    content = fs.readFileSync(fullPath, "utf-8");
  } catch (e) {
    console.error(`${C.red}Error reading lesson file: ${e.message}${C.reset}`);
    return null;
  }
  const objStr = content.replace(/^export default\s+/, "").replace(/;$/, "");
  try {
    const lessonObj = new Function(`return ${objStr}`)();
    return { content, obj: lessonObj, fullPath };
  } catch (e1) {
    try {
      const evalFunc = new Function("objStr", `return eval(${objStr})`);
      const lessonObj = evalFunc(objStr);
      return { content, obj: lessonObj, fullPath };
    } catch (e2) {
      console.error(
        `${C.red}Failed to parse lesson '${filename}': ${e2.message}${C.reset}`,
      );
      return null;
    }
  }
}

function getTimelineSteps(lessonObj) {
  if (!lessonObj.timeline) return [];
  const steps = [];
  for (const [key, step] of Object.entries(lessonObj.timeline)) {
    if (step.step && step.title) {
      steps.push({
        key,
        step: step.step,
        title: step.title,
        time: step.time || "",
        cards: step.cards || [],
      });
    }
  }
  return steps.sort((a, b) => a.step.localeCompare(b.step));
}

function formatCardAsJS(card) {
  let str = `{\n`;
  str += `                    id: '${card.id}',\n`;
  str += `                    type: '${card.type}',\n`;
  str += `                    title: '${card.title}',\n`;
  str += `                    description: '${card.description}',\n`;
  str += `                    action: '${card.action}',\n`;
  str += `                    activityId: '${card.activityId}'`;
  if (card.icon) str += `,\n                    icon: '${card.icon}'`;
  str += `\n                }`;
  return str;
}

function injectCardIntoLesson(lessonContent, stepKey, newCard) {
  const stepStartRegex = new RegExp(`(${stepKey}:\\s*\\{)`, "m");
  const stepStartMatch = lessonContent.match(stepStartRegex);
  if (!stepStartMatch) {
    console.log(`${C.red}✗ Could not find step ${stepKey} in lesson${C.reset}`);
    return null;
  }
  let braceDepth = 0;
  let inCardsArray = false;
  let cardsArrayStart = -1;
  let cardsArrayEnd = -1;
  const searchStart = stepStartMatch.index + stepStartMatch[0].length;
  for (let i = searchStart; i < lessonContent.length; i++) {
    const char = lessonContent[i];
    if (char === "{" && !inCardsArray) braceDepth++;
    else if (char === "}" && !inCardsArray) {
      braceDepth--;
      if (braceDepth === 0) break;
    } else if (char === "[" && !inCardsArray) {
      const beforeBracket = lessonContent
        .substring(searchStart, i)
        .match(/cards:\s*$/);
      if (beforeBracket) {
        inCardsArray = true;
        cardsArrayStart = i;
      }
    } else if (char === "]" && inCardsArray) {
      cardsArrayEnd = i;
      inCardsArray = false;
      break;
    }
  }
  if (cardsArrayStart === -1 || cardsArrayEnd === -1) {
    console.log(
      `${C.red}✗ Could not find cards array in step ${stepKey}${C.reset}`,
    );
    return null;
  }
  const cardStr = formatCardAsJS(newCard);
  const beforeCards = lessonContent.substring(0, cardsArrayStart + 1);
  const afterCards = lessonContent.substring(cardsArrayEnd);
  const existingContent = lessonContent
    .substring(cardsArrayStart + 1, cardsArrayEnd)
    .trim();
  let injection;
  if (existingContent) {
    let trailingComma = "";
    if (!existingContent.endsWith(",")) {
      trailingComma = ",";
    }
    injection = `${existingContent}${trailingComma}\n                ${cardStr}`;
  } else {
    injection = `\n                ${cardStr}\n            `;
  }
  return `${beforeCards}${injection}${afterCards}`;
}

async function activateActivity(rl) {
  // STEP 1: Select lesson
  const lessons = listLessons();
  if (lessons.length === 0) {
    console.log(`\n${C.red}No lessons found in src/lessons/${C.reset}`);
    return;
  }
  const lessonOptions = lessons.map((f) => {
    const fullPath = path.join(PATHS.lessons, f);
    const content = fs.readFileSync(fullPath, "utf-8");
    const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
    const title = titleMatch ? titleMatch[1] : f.replace(".js", "");
    return { value: f, label: `📘 ${title} (${f})` };
  });
  console.log(
    `\n${C.bright}${C.yellow}STEP 1: Select a lesson to add activity to${C.reset}`,
  );
  const selectedLesson = await selectNumbered(
    rl,
    "Which lesson?",
    lessonOptions,
  );
  if (!selectedLesson) return;
  const lessonFile = selectedLesson.value;
  const lesson = readLesson(lessonFile);
  if (!lesson) return;

  // STEP 2: Select timeline step
  const steps = getTimelineSteps(lesson.obj);
  if (steps.length === 0) {
    console.log(`\n${C.red}No timeline steps found in this lesson.${C.reset}`);
    return;
  }
  const stepOptions = steps.map((s) => ({
    value: s.key,
    label: `📍 Step ${s.step}: ${s.title} ${s.time ? `(${s.time})` : ""} [${s.cards.length} cards]`,
  }));
  console.log(
    `\n${C.bright}${C.yellow}STEP 2: Select where to add the activity${C.reset}`,
  );
  const selectedStep = await selectNumbered(
    rl,
    "Which step in the timeline?",
    stepOptions,
  );
  if (!selectedStep) return;

  // STEP 3: Select activity
  const activities = listActivities();
  if (activities.length === 0) {
    console.log(
      `\n${C.red}No activities found in src/components/activities/${C.reset}`,
    );
    return;
  }
  const activityOptions = activities.map((f) => {
    const name = f.replace(".vue", "");
    const readable = name.replace(/([A-Z])/g, " $1").trim();
    return { value: f, label: `🎮 ${readable}`, id: name };
  });
  console.log(
    `\n${C.bright}${C.yellow}STEP 3: Select the activity to activate${C.reset}`,
  );
  const selectedActivity = await selectNumbered(
    rl,
    "Which activity?",
    activityOptions,
  );
  if (!selectedActivity) return;
  const activityName = selectedActivity.id;

  // STEP 4: Configure card
  console.log(
    `\n${C.bright}${C.magenta}=== Configure Activity Card ===${C.reset}`,
  );
  console.log(`${C.dim}Activity: ${activityName}${C.reset}\n`);
  const title = await ask(
    rl,
    `Activity title (default: ${activityName.replace(/([A-Z])/g, " $1").trim()}):`,
  );
  const finalTitle = title || activityName.replace(/([A-Z])/g, " $1").trim();
  const description = await ask(rl, "Short description for students:");
  if (!description) {
    console.log(`${C.yellow}Description is required. Try again.${C.reset}`);
    return;
  }
  const icon = await ask(
    rl,
    "Icon name (default: PhStar, e.g. PhAtom, PhFlask):",
  );
  const finalIcon = icon || "PhStar";

  // STEP 5: Build & inject
  const newCard = {
    id: `card-${activityName}`,
    type: "digital",
    title: finalTitle,
    description: description,
    action: "activity",
    activityId: activityName,
    icon: finalIcon,
  };

  console.log(`\n${C.bright}${C.cyan}=== Preview: Activity Card ===${C.reset}`);
  console.log(JSON.stringify(newCard, null, 2));
  console.log("");
  const confirm = await ask(rl, "Inject this activity into the lesson? (y/n):");
  if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
    console.log(`${C.yellow}✗ Activity activation cancelled.${C.reset}`);
    return;
  }

  const stepKey = selectedStep.value;
  const newContent = injectCardIntoLesson(lesson.content, stepKey, newCard);
  if (!newContent) {
    console.log(
      `${C.red}✗ Failed to inject activity. Manual intervention needed.${C.reset}`,
    );
    return;
  }

  fs.writeFileSync(lesson.fullPath, newContent, "utf-8");
  console.log(
    `\n${C.bright}${C.green}✅ Activity activated successfully!${C.reset}`,
  );
  console.log(`${C.green}  Lesson: ${lessonFile}${C.reset}`);
  console.log(`${C.green}  Step: ${stepKey}${C.reset}`);
  console.log(`${C.green}  Activity: ${activityName}${C.reset}`);
  console.log(`${C.dim}  File updated: ${lesson.fullPath}${C.reset}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 4: SYNC ALL ACTIVITIES (REPLACES syncActivities.js)
// ═══════════════════════════════════════════════════════════════════════════════

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function updateUseActivityFile(activities) {
  const USE_ACTIVITY_FILE = path.resolve(
    ROOT,
    "src",
    "composables",
    "useActivitySystem.js",
  );
  const originalContent = fs.readFileSync(USE_ACTIVITY_FILE, "utf8");
  const useCRLF = originalContent.includes("\r\n");
  const normalizedContent = originalContent.replace(/\r\n/g, "\n");

  const sortedImports = [...activities].sort((a, b) =>
    a.componentName.localeCompare(b.componentName),
  );
  const sortedMap = [...activities].sort((a, b) =>
    a.kebabKey.localeCompare(b.kebabKey),
  );
  const newImportLines = sortedImports
    .map(
      (imp) =>
        `const ${imp.componentName} = defineAsyncComponent(() => import('../components/activities/${imp.componentName}.vue'))`,
    )
    .join("\n");
  const newMapEntries = sortedMap
    .map((comp, idx) => {
      const comma = idx < sortedMap.length - 1 ? "," : "";
      const key = comp.kebabKey.includes("-")
        ? `"${comp.kebabKey}"`
        : comp.kebabKey;
      return `    ${key}: ${comp.componentName}${comma}`;
    })
    .join("\n");
  const asyncComponentsSection = `// Async Components (Lazy Loaded)\n${newImportLines}\n`;
  const componentMapSection = `// Registry\nconst COMPONENT_MAP = {\n${newMapEntries}\n}`;
  const newSection = asyncComponentsSection + componentMapSection;

  const startMarker = "// Async Components (Lazy Loaded)";
  const endMarker = "// Registry";
  const startIdx = normalizedContent.indexOf(startMarker);
  const endIdx = normalizedContent.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `${C.red}✗ Could not find markers in useActivitySystem.js${C.reset}`,
    );
    return;
  }

  const beforeSection = normalizedContent.substring(0, startIdx);
  const afterEndIdx = normalizedContent.indexOf("\n}", endIdx);
  if (afterEndIdx === -1) {
    console.error(`${C.red}✗ Could not find end of COMPONENT_MAP${C.reset}`);
    return;
  }
  const afterSection = normalizedContent.substring(afterEndIdx + 2);

  let newContent = beforeSection + newSection + afterSection;
  if (useCRLF) {
    newContent = newContent.replace(/\n/g, "\r\n");
  }

  fs.writeFileSync(USE_ACTIVITY_FILE, newContent, "utf8");
  console.log(
    `${C.green}✓ Updated useActivitySystem.js with ${sortedImports.length} activities${C.reset}`,
  );
}

async function syncAllActivities(rl) {
  const activities = listActivities().map((f) => {
    const name = f.replace(".vue", "");
    return {
      filename: f,
      componentName: name,
      kebabKey: toKebabCase(name),
      importPath: `../components/activities/${name}.vue`,
    };
  });

  console.log(
    `\n${C.bright}${C.cyan}╭─── Sync All Activities ─────────────────────────────╮${C.reset}`,
  );
  console.log(`${C.cyan}│${C.reset} Found ${activities.length} activity files`);
  console.log(
    `${C.bright}${C.cyan}╰───────────────────────────────────────────────────╯${C.reset}`,
  );

  const confirm = await ask(rl, "Update useActivitySystem.js? (y/n):");
  if (confirm.toLowerCase() === "y" || confirm.toLowerCase() === "yes") {
    updateUseActivityFile(activities);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MONSTER FLOW
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  process.stdout.write("\x1b[2J\x1b[0;0H");
  console.log(
    `${C.bright}${C.blue}╔══════════════════════════════════════════════════════════╗${C.reset}`,
  );
  console.log(
    `${C.bright}${C.blue}║${C.reset} ${C.bright}🔧 SWISS ARMY KNIFE CLI 🔧${C.reset}                           ${C.blue}║${C.reset}`,
  );
  console.log(
    `${C.bright}${C.blue}║${C.reset} Unified tool for the Activity System            ${C.blue}║${C.reset}`,
  );
  console.log(
    `${C.bright}${C.blue}╚══════════════════════════════════════════════════════════╝${C.reset}`,
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  saveMemory({ lastModel: AI_CONFIG.modelName });
  console.log(
    `\n${C.bright}${C.green}✓ Using Gemini (${AI_CONFIG.modelName})${C.reset}\n`,
  );
  console.log(
    `${C.dim}  Context mode: ${CONTEXT_CONFIG.trimReference ? `trimmed (${CONTEXT_CONFIG.maxReferenceChars} chars max)` : "full reference"}${C.reset}`,
  );
  console.log(
    `${C.dim}  Pre-save guard: ${PRE_SAVE_GUARD.enabled ? "ON" : "OFF"} (${PRE_SAVE_GUARD.enabled ? "typecheck/build check enabled" : "use --no-guard to disable"})${C.reset}`,
  );
  console.log(
    `${C.dim}  Auto-fix attempts: ${AUTO_FIX_CONFIG.maxAttempts}${C.reset}\n`,
  );

  // MAIN TOOLS MENU
  while (true) {
    console.log(`\n${C.bright}${C.magenta}=== Main Tools Menu ===${C.reset}\n`);
    console.log(
      `  ${C.cyan}[1]${C.reset} ${C.bright}✨ Create New Activity${C.reset}`,
    );
    console.log(`     Generate a new Vue component with AI`);
    console.log(``);
    console.log(
      `  ${C.cyan}[2]${C.reset} ${C.bright}🔨 Improve Existing Activity${C.reset}`,
    );
    console.log(`     Fix bugs, improve visuals, add tabs, etc.`);
    console.log(``);
    console.log(
      `  ${C.cyan}[3]${C.reset} ${C.bright}🎯 Activate Activity into Lesson${C.reset}`,
    );
    console.log(`     Precisely add an activity to a specific lesson & step`);
    console.log(``);
    console.log(
      `  ${C.cyan}[4]${C.reset} ${C.bright}🔄 Sync All Activities${C.reset}`,
    );
    console.log(`     Update useActivitySystem.js registry`);
    console.log(``);
    console.log(`  ${C.dim}[0] Exit${C.reset}\n`);

    const toolChoice = await ask(rl, "Choose a tool:");

    if (toolChoice === "0") break;
    else if (toolChoice === "1") {
      await generateNewActivity(rl, loadMemory());
    } else if (toolChoice === "2") {
      await improveActivity(rl, loadMemory());
    } else if (toolChoice === "3") {
      await activateActivity(rl);
    } else if (toolChoice === "4") {
      await syncAllActivities(rl);
    }
  }

  rl.close();
  console.log(
    `\n${C.bright}${C.green}✓ Swiss Army Knife CLI closed.${C.reset}\n`,
  );
}

main().catch((err) => {
  console.error(`\n${C.red}CRASH:${C.reset}`, err);
  process.exit(1);
});
