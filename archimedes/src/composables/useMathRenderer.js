import katex from 'katex'

/**
 * Render LaTeX math expressions in text content
 * Supports inline math: \( ... \)
 * Supports block math: \[ ... \]
 */
export function renderMath(content) {
    if (!content || typeof content !== 'string') return content

    // Light markdown support for v-html lesson content
    let result = content
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[\s>])\*([^*]+?)\*(?=[\s<.,;:!?)]|$)/g, '$1<em>$2</em>')

    // Process block math first: \[ ... \] and $$ ... $$
    result = result
        .replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
        try {
            return `<span class="katex-block">${katex.renderToString(math.trim(), {
                displayMode: true,
                throwOnError: false,
                output: 'html'
            })}</span>`
        } catch (e) {
            console.warn('KaTeX error:', e)
            return match
        }
    })
        .replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
            try {
                return `<span class="katex-block">${katex.renderToString(math.trim(), {
                    displayMode: true,
                    throwOnError: false,
                    output: 'html'
                })}</span>`
            } catch (e) {
                console.warn('KaTeX error:', e)
                return match
            }
        })

    // Process inline math: \( ... \) and $ ... $
    result = result
        .replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), {
                displayMode: false,
                throwOnError: false,
                output: 'html'
            })
        } catch (e) {
            console.warn('KaTeX error:', e)
            return match
        }
    })
        .replace(/\$([^$\n]+?)\$/g, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: false,
                    throwOnError: false,
                    output: 'html'
                })
            } catch (e) {
                console.warn('KaTeX error:', e)
                return match
            }
        })
    
    return result
}

/**
 * Process all v-html bound content in a slide
 */
export function processSlideMath(slide) {
    const processed = { ...slide }
    
    // Fields that may contain LaTeX
    const mathFields = ['content', 'text', 'title', 'subtitle', 'question', 'subtext', 'equation', 'context']
    
    mathFields.forEach(field => {
        if (processed[field]) {
            processed[field] = renderMath(processed[field])
        }
    })
    
    // Process steps in steps layout
    if (processed.steps) {
        processed.steps = processed.steps.map(step => ({
            ...step,
            text: renderMath(step.text)
        }))
    }
    
    // Process parts in equation layout
    if (processed.parts) {
        processed.parts = processed.parts.map(part => ({
            ...part,
            items: part.items.map(item => renderMath(item))
        }))
    }
    
    // Process items in summary layout
    if (processed.items) {
        processed.items = processed.items.map(item => renderMath(item))
    }
    
    // Process options in multichoice
    if (processed.options) {
        processed.options = processed.options.map(opt => ({
            ...opt,
            text: renderMath(opt.text)
        }))
    }
    
    // Process left/right in comparison layout
    if (processed.left) {
        processed.left = {
            ...processed.left,
            content: renderMath(processed.left.content),
            example: renderMath(processed.left.example)
        }
    }
    if (processed.right) {
        processed.right = {
            ...processed.right,
            content: renderMath(processed.right.content),
            example: renderMath(processed.right.example)
        }
    }
    
    return processed
}

export default { renderMath, processSlideMath }
