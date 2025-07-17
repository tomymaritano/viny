// Code highlighting utilities and copy functionality

/**
 * Copy code content to clipboard
 * @param codeId - The ID of the code element to copy
 */
export function copyCode(codeId: string): void {
  try {
    const codeElement = document.getElementById(codeId)
    if (!codeElement) {
      console.warn(`Code element with ID ${codeId} not found`)
      return
    }

    // Get the text content, preserving line breaks
    const codeText = codeElement.textContent || codeElement.innerText || ''
    
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(codeText).then(() => {
        showCopySuccess(codeId)
      }).catch((err) => {
        console.error('Failed to copy code:', err)
        fallbackCopyMethod(codeText, codeId)
      })
    } else {
      // Fallback for older browsers
      fallbackCopyMethod(codeText, codeId)
    }
  } catch (error) {
    console.error('Error copying code:', error)
  }
}

/**
 * Fallback copy method for older browsers
 * @param text - The text to copy
 * @param codeId - The ID of the code element for visual feedback
 */
function fallbackCopyMethod(text: string, codeId: string): void {
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (successful) {
      showCopySuccess(codeId)
    } else {
      throw new Error('Fallback copy method failed')
    }
  } catch (error) {
    console.error('Fallback copy failed:', error)
    // Show manual copy instruction
    showManualCopyInstructions(codeId)
  }
}

/**
 * Show visual feedback for successful copy
 * @param codeId - The ID of the code element
 */
function showCopySuccess(codeId: string): void {
  const codeElement = document.getElementById(codeId)
  if (!codeElement) return

  // Find the copy button associated with this code block
  const wrapper = codeElement.closest('.code-block-wrapper')
  const copyButton = wrapper?.querySelector('.copy-button') as HTMLButtonElement
  
  if (copyButton) {
    copyButton.classList.add('copied')
    copyButton.setAttribute('title', 'Copied!')
    
    // Reset after 2 seconds
    setTimeout(() => {
      copyButton.classList.remove('copied')
      copyButton.setAttribute('title', 'Copy code')
    }, 2000)
  }
}

/**
 * Show manual copy instructions when automatic copy fails
 * @param codeId - The ID of the code element
 */
function showManualCopyInstructions(codeId: string): void {
  const codeElement = document.getElementById(codeId)
  if (!codeElement) return

  // Select the code text for manual copying
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(codeElement)
  selection?.removeAllRanges()
  selection?.addRange(range)

  // Show instruction
  const wrapper = codeElement.closest('.code-block-wrapper')
  if (wrapper) {
    const instruction = document.createElement('div')
    instruction.className = 'copy-instruction'
    instruction.textContent = 'Code selected. Press Ctrl+C (Cmd+C on Mac) to copy.'
    instruction.style.cssText = `
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-orange);
      color: var(--color-base3);
      padding: 0.5em 1em;
      border-radius: 4px;
      font-size: 0.8em;
      z-index: 1000;
      white-space: nowrap;
    `
    
    wrapper.style.position = 'relative'
    wrapper.appendChild(instruction)
    
    // Remove instruction after 5 seconds
    setTimeout(() => {
      if (instruction.parentNode) {
        instruction.parentNode.removeChild(instruction)
      }
    }, 5000)
  }
}

/**
 * Initialize code highlighting features
 * This should be called when the DOM is ready
 */
export function initializeCodeHighlighting(): void {
  // Make copyCode function available globally for onclick handlers
  if (typeof window !== 'undefined') {
    (window as any).copyCode = copyCode
  }

  // Add keyboard shortcuts for code blocks
  document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+C to copy focused code block
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
      const activeElement = document.activeElement
      const codeBlock = activeElement?.closest('.code-block-wrapper')
      if (codeBlock) {
        const codeElement = codeBlock.querySelector('code[id]') as HTMLElement
        if (codeElement?.id) {
          event.preventDefault()
          copyCode(codeElement.id)
        }
      }
    }
  })

  // Add click-to-focus functionality for code blocks
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const codeBlock = target.closest('.code-block-wrapper')
    if (codeBlock && !target.closest('.copy-button')) {
      const codeElement = codeBlock.querySelector('code[id]') as HTMLElement
      if (codeElement) {
        codeElement.focus()
      }
    }
  })
}

/**
 * Auto-detect and highlight code language
 * @param content - The code content to analyze
 * @returns Detected language or null
 */
export function detectCodeLanguage(content: string): string | null {
  // Simple heuristics for common languages
  const patterns = {
    javascript: [
      /\b(function|const|let|var|=>|console\.log)\b/,
      /\b(import|export|from|require)\b/,
      /\.(js|jsx|ts|tsx)$/
    ],
    python: [
      /\b(def|import|from|class|if __name__)\b/,
      /\bprint\s*\(/,
      /\.py$/
    ],
    css: [
      /\{[^}]*\}/,
      /\b(display|color|background|margin|padding)\s*:/,
      /\.(css|scss|sass)$/
    ],
    html: [
      /<\/?[a-z][\s\S]*>/i,
      /<!DOCTYPE/i
    ],
    sql: [
      /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/i,
      /\bCREATE\s+(TABLE|DATABASE|INDEX)\b/i
    ],
    json: [
      /^\s*\{[\s\S]*\}\s*$/,
      /^\s*\[[\s\S]*\]\s*$/
    ]
  }

  for (const [language, regexes] of Object.entries(patterns)) {
    if (regexes.some(regex => regex.test(content))) {
      return language
    }
  }

  return null
}