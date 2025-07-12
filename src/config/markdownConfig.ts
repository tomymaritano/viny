import MarkdownIt from 'markdown-it'
import { full as markdownItEmoji } from 'markdown-it-emoji'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

// Configure markdown-it instance
export const createMarkdownRenderer = () => {
  return new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch {
          // Ignore highlighting errors
        }
      }
      return '' // use external default escaping
    },
  })
    .use(markdownItEmoji)
    .use(markdownItTaskLists, { enabled: true, label: true, labelAfter: true })
}

// Default markdown renderer instance
export const md = createMarkdownRenderer()
