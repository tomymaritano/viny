/**
 * Prompt Templates for RAG System
 * Manages different prompt formats for various LLM providers
 */

export interface PromptConfig {
  query: string
  context: {
    text: string
    sources: any[]
  }
  includeMetadata?: boolean
  systemPrompt?: string
  examples?: Array<{
    query: string
    answer: string
  }>
}

export class PromptTemplate {
  private templates = {
    default: {
      system: `You are a helpful AI assistant with access to a personal knowledge base. 
Your role is to answer questions based on the provided context from the user's notes.
Always be accurate and cite the specific notes when providing information.
If the context doesn't contain relevant information, say so clearly.`,

      user: (config: PromptConfig) => `
Context from your notes:
${config.context.text}

Question: ${config.query}

Please provide a comprehensive answer based on the context above. If the context contains relevant information, cite which notes you're referencing.`,
    },

    detailed: {
      system: `You are an advanced knowledge management assistant with access to a personal note-taking system.
Your responsibilities:
1. Provide accurate answers based solely on the provided context
2. Cite specific notes and relevant sections
3. Highlight connections between different notes when relevant
4. Maintain the user's writing style when quoting
5. Acknowledge when information is incomplete or missing`,

      user: (config: PromptConfig) => `
Based on the following context from my notes, please answer my question.

CONTEXT:
${config.context.text}

${
  config.includeMetadata
    ? `
METADATA:
${config.context.sources.map(s => `- ${s.noteTitle} (relevance: ${(s.score * 100).toFixed(1)}%)`).join('\n')}
`
    : ''
}

QUESTION: ${config.query}

Please provide a detailed answer that:
1. Directly addresses my question
2. Cites specific notes when referencing information
3. Points out any connections between different notes
4. Mentions if any important information seems to be missing`,
    },

    conversational: {
      system: `You are a friendly AI assistant helping with personal knowledge management.
Be conversational but informative. Use the context from notes to answer questions naturally.`,

      user: (config: PromptConfig) => `
Here's what I found in your notes:

${config.context.text}

Your question: ${config.query}

Let me help you with that based on your notes...`,
    },

    analytical: {
      system: `You are an analytical AI assistant specialized in extracting insights from personal notes.
Focus on patterns, themes, and connections across different notes.
Provide structured, analytical responses.`,

      user: (config: PromptConfig) => `
ANALYTICAL CONTEXT:
${config.context.text}

QUERY FOR ANALYSIS: ${config.query}

Please provide an analytical response that includes:
- Key findings from the notes
- Patterns or themes identified
- Connections between different pieces of information
- Any gaps or areas needing more information`,
    },

    summarization: {
      system: `You are a summarization expert. Create concise, accurate summaries of personal notes.
Maintain the key points while reducing redundancy.`,

      user: (config: PromptConfig) => `
Please summarize the following content from my notes:

${config.context.text}

Focus: ${config.query}

Create a summary that captures the essential information while being concise and well-structured.`,
    },
  }

  /**
   * Generate RAG prompt based on configuration
   */
  generateRAGPrompt(config: PromptConfig, template = 'default'): string {
    const selectedTemplate =
      this.templates[template as keyof typeof this.templates] ||
      this.templates.default

    const systemPrompt = config.systemPrompt || selectedTemplate.system
    const userPrompt = selectedTemplate.user(config)

    // Format for different LLM providers
    return this.formatForProvider(systemPrompt, userPrompt, config.examples)
  }

  /**
   * Generate prompt for auto-tagging
   */
  generateTaggingPrompt(noteContent: string, existingTags: string[]): string {
    const systemPrompt = `You are a tagging assistant. Analyze the note content and suggest relevant tags.
Consider the existing tags in the system for consistency.
Return only a comma-separated list of tags, nothing else.`

    const userPrompt = `
Note content:
${noteContent}

Existing tags in the system: ${existingTags.join(', ')}

Suggest 3-5 relevant tags for this note:`

    return this.formatForProvider(systemPrompt, userPrompt)
  }

  /**
   * Generate prompt for summarization
   */
  generateSummaryPrompt(
    noteContent: string,
    style: 'brief' | 'detailed' = 'brief'
  ): string {
    const systemPrompt =
      style === 'brief'
        ? 'You are a summarization assistant. Create brief, one-paragraph summaries.'
        : 'You are a summarization assistant. Create comprehensive summaries with key points.'

    const userPrompt =
      style === 'brief'
        ? `Summarize this note in one concise paragraph:\n\n${noteContent}`
        : `Create a detailed summary with key points:\n\n${noteContent}\n\nInclude:\n- Main topics\n- Key insights\n- Action items (if any)`

    return this.formatForProvider(systemPrompt, userPrompt)
  }

  /**
   * Generate prompt for question generation
   */
  generateQuestionsPrompt(noteContent: string): string {
    const systemPrompt = `You are a learning assistant. Generate thoughtful questions that help deepen understanding of the content.`

    const userPrompt = `Based on this note, generate 5 thought-provoking questions that would help someone better understand or reflect on the content:

${noteContent}

Format each question on a new line starting with "Q:"`

    return this.formatForProvider(systemPrompt, userPrompt)
  }

  /**
   * Format prompt for different LLM providers
   */
  private formatForProvider(
    systemPrompt: string,
    userPrompt: string,
    examples?: Array<{ query: string; answer: string }>
  ): string {
    // For now, return a simple format
    // TODO: Implement provider-specific formatting (ChatML, Alpaca, etc.)
    let prompt = `System: ${systemPrompt}\n\n`

    if (examples && examples.length > 0) {
      prompt += 'Examples:\n'
      for (const example of examples) {
        prompt += `Q: ${example.query}\nA: ${example.answer}\n\n`
      }
    }

    prompt += `User: ${userPrompt}\n\nAssistant:`

    return prompt
  }

  /**
   * Create a custom template
   */
  addTemplate(
    name: string,
    template: {
      system: string
      user: (config: PromptConfig) => string
    }
  ): void {
    this.templates[name as keyof typeof this.templates] = template
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): string[] {
    return Object.keys(this.templates)
  }
}
