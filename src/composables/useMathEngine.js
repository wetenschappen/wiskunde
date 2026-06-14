import katex from 'katex'
import * as mathjs from 'mathjs'

const superscriptMap = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'x': 'ˣ', 'y': 'ʸ'
}

const subscriptMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', 
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', 'n': 'ₙ', 'x': 'ₓ', 'y': 'ᵧ'
}

/**
 * Replaces plain text math expressions like x^2 with x² and x_1 with x₁
 */
function convertPlaintextMath(text) {
    let result = text;
    
    // Replace superscripts: e.g., x^2 -> x² or x^(2n) -> x²ⁿ (simple cases)
    result = result.replace(/\^([0-9\+\-nxy])/g, (match, p1) => superscriptMap[p1] || match)
    
    // Replace multiple digits e.g. x^23 -> x²³ (need iterative approach or regex)
    result = result.replace(/\^(\d+)/g, (match, digits) => {
        return digits.split('').map(d => superscriptMap[d]).join('')
    })

    // Subscripts: x_1 -> x₁
    result = result.replace(/_([0-9\+\-nxy])/g, (match, p1) => subscriptMap[p1] || match)
    result = result.replace(/_(\d+)/g, (match, digits) => {
        return digits.split('').map(d => subscriptMap[d]).join('')
    })

    return result
}

function renderKaTeX(formula, displayMode) {
    try {
        return katex.renderToString(formula.trim(), {
            throwOnError: false,
            displayMode,
            macros: {
                "\\R": "\\mathbb{R}",
                "\\N": "\\mathbb{N}",
                "\\Z": "\\mathbb{Z}",
                "\\Q": "\\mathbb{Q}",
                "\\limt": "\\lim_{#1 \\to #2}"
            }
        })
    } catch {
        return formula
    }
}

/**
 * Parses a string to evaluate KaTeX math blocks and fixes plaintext math notation.
 */
export function processMathText(text) {
    if (!text || typeof text !== 'string') return text;

    let result = text;

    // Process display math: \[ ... \] or $$ ... $$
    result = result.replace(/\$\$(.+?)\$\$/gs, (_, formula) => renderKaTeX(formula, true));
    result = result.replace(/\\\[(.+?)\\\]/gs, (_, formula) => renderKaTeX(formula, true));
    
    // Process inline math: $ ... $ or \( ... \)
    result = result.replace(/(^|[^\\])\$([^$\n]+?)\$/g, (match, prefix, formula) => {
        return prefix + renderKaTeX(formula, false);
    });
    result = result.replace(/\\\((.+?)\\\)/gs, (_, formula) => renderKaTeX(formula, false));

    // After extracting and rendering KaTeX, we might still have plain text math left.
    // However, KaTeX output is HTML and contains ^ and _ symbols!
    // To safely replace plaintext math, we should avoid touching HTML tags.
    // An easy trick is to parse text nodes only, or we do the plain text math FIRST,
    // but doing it first might break KaTeX formulas like x^2 inside $...$.
    // Let's do a safe plaintext math conversion ONLY outside of $...$ and HTML tags.
    // A simpler approach: Do plaintext math conversion on the whole string EXCEPT inside 
    // already rendered KaTeX. But KaTeX render output has things like class="vlist-t".
    
    // Let's do it on the raw text BEFORE KaTeX, but ONLY outside of math delimiters!
    return processTextOutsideMath(text);
}

function processTextOutsideMath(text) {
    // Regex matches $$...$$, \[...\], \(...\), $...$ OR any other text
    const mathRegex = /(\$\$.+?\$\$|\\\[.+?\\\]|\\\(.+?\\\)|\$(?!\d).+?\$)/gs;
    
    let parts = text.split(mathRegex);
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        
        // If this part is a math block
        if (part.startsWith('$$') || part.startsWith('\\[') || part.startsWith('\\(') || part.startsWith('$')) {
            if (part.startsWith('$$')) parts[i] = renderKaTeX(part.slice(2, -2), true);
            else if (part.startsWith('\\[')) parts[i] = renderKaTeX(part.slice(2, -2), true);
            else if (part.startsWith('\\(')) parts[i] = renderKaTeX(part.slice(2, -2), false);
            else if (part.startsWith('$')) parts[i] = renderKaTeX(part.slice(1, -1), false);
        } else {
            // It's normal text, apply plaintext conversions
            parts[i] = convertPlaintextMath(part);
        }
    }
    
    return parts.join('');
}

export function evaluateExpression(expr, scope = {}) {
    try {
        return mathjs.evaluate(expr, scope)
    } catch(e) {
        console.warn('Math.js evaluation error:', e)
        return null;
    }
}

export const math = mathjs;