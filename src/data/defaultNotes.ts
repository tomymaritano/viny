import { Note } from '../types'

export const defaultNotes: Note[] = [
  {
    id: 'welcome-note',
    title: 'Welcome to Viny! 🎉',
    content: `# Welcome to Viny! 🎉

Thanks for choosing Viny as your markdown note-taking companion! This note will help you get started with the basics.

## What is Viny?

Viny is a powerful yet simple markdown note-taking application that helps you:
- ✅ Write and organize your notes with markdown
- 📁 Keep everything organized with notebooks
- 🔍 Find anything quickly with search
- 🎨 Customize your experience with themes
- 💾 Keep your data secure and private

## Getting Started

1. **Explore the notebooks** in the sidebar - we've set up some default ones for you
2. **Check out the "learn" notebook** for guides and tutorials
3. **Try creating your first note** by clicking the "+" button
4. **Customize your experience** in Settings (gear icon)

## Quick Tips

- Use **Ctrl/Cmd + K** to quickly search all your notes
- **Drag and drop** to organize notebooks and notes
- **Live preview** shows your formatted markdown as you type
- **Auto-save** keeps your work safe - no need to manually save!

## Need Help?

Visit the **"learn"** notebook for detailed guides on markdown syntax, shortcuts, and advanced features.

Happy note-taking! 📝`,
    notebook: 'inbox',
    tags: ['welcome', 'getting-started'],
    pinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'markdown-guide',
    title: 'How to use Markdown',
    content: `# How to use Markdown

Markdown is a lightweight markup language that allows you to format text using simple syntax. Here's everything you need to know!

## Headers

Use \`#\` for headers. The more \`#\` symbols, the smaller the header:

# H1 - Main Title
## H2 - Section Title  
### H3 - Subsection
#### H4 - Sub-subsection
##### H5 - Minor heading
###### H6 - Smallest heading

## Text Formatting

**Bold text** - Use \`**text**\` or \`__text__\`
*Italic text* - Use \`*text*\` or \`_text_\`
***Bold and italic*** - Use \`***text***\`
~~Strikethrough~~ - Use \`~~text~~\`
\`Inline code\` - Use backticks around text

## Lists

### Unordered Lists
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Ordered Lists
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item

## Links and Images

[Link text](https://example.com)
[Link with title](https://example.com "This is a title")

![Alt text](image-url.jpg)
![Alt text](image-url.jpg "Image title")

## Code Blocks

### Inline Code
Use \`backticks\` for inline code.

### Code Blocks
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> > This is a nested blockquote.

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | More     |
| Row 2    | Data     | More     |

## Horizontal Rules

Create a horizontal rule with three or more hyphens:

---

## Checkboxes (Task Lists)

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
- [ ] Another incomplete task

## Emoji Support

You can use emoji in your markdown! 🎉 😊 📝 💡 🚀

## Mathematical Expressions

Viny supports LaTeX math expressions:

Inline math: $E = mc^2$

Block math:
$$
\\frac{d}{dx}\\left( \\int_{0}^{x} f(u) \\, du\\right) = f(x)
$$

## Tips for Better Markdown

1. **Use consistent formatting** - Pick a style and stick with it
2. **Add blank lines** between different elements for better readability
3. **Use descriptive link text** instead of "click here"
4. **Structure your content** with headers and lists
5. **Preview your work** - Viny shows live preview as you type!

## Advanced Features in Viny

- **Auto-completion** - Type \`#\` to see header suggestions
- **Syntax highlighting** - Code blocks are automatically highlighted
- **Live preview** - See your formatted text as you type
- **Search** - Find text across all your notes instantly
- **Tags** - Organize notes with tags for easy filtering

Happy writing! 📝✨`,
    notebook: 'learn',
    tags: ['markdown', 'guide', 'syntax', 'tutorial'],
    pinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    content: `# Keyboard Shortcuts ⌨️

Master these shortcuts to become a Viny power user!

## Global Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl/Cmd + K\` | Quick search |
| \`Ctrl/Cmd + N\` | New note |
| \`Ctrl/Cmd + S\` | Save note (auto-save is enabled by default) |
| \`Ctrl/Cmd + ,\` | Open settings |
| \`Ctrl/Cmd + /\` | Toggle focus mode |

## Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl/Cmd + B\` | Bold text |
| \`Ctrl/Cmd + I\` | Italic text |
| \`Ctrl/Cmd + U\` | Underline text |
| \`Ctrl/Cmd + Z\` | Undo |
| \`Ctrl/Cmd + Y\` | Redo |
| \`Ctrl/Cmd + A\` | Select all |
| \`Ctrl/Cmd + F\` | Find in current note |
| \`Ctrl/Cmd + G\` | Find next |
| \`Ctrl/Cmd + H\` | Find and replace |

## Markdown Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl/Cmd + 1-6\` | Insert header (H1-H6) |
| \`Ctrl/Cmd + L\` | Insert link |
| \`Ctrl/Cmd + E\` | Insert code block |
| \`Ctrl/Cmd + Q\` | Insert blockquote |
| \`Ctrl/Cmd + Shift + L\` | Insert unordered list |
| \`Ctrl/Cmd + Shift + O\` | Insert ordered list |
| \`Ctrl/Cmd + Shift + C\` | Insert code block |
| \`Ctrl/Cmd + Shift + T\` | Insert table |

## Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl/Cmd + ↑\` | Go to previous note |
| \`Ctrl/Cmd + ↓\` | Go to next note |
| \`Ctrl/Cmd + ←\` | Go to previous notebook |
| \`Ctrl/Cmd + →\` | Go to next notebook |
| \`Escape\` | Close modal/dialog |
| \`Enter\` | Confirm action |

## Pro Tips 💡

1. **Customize shortcuts** in Settings > Keybindings
2. **Use Vim mode** if you prefer Vim-style editing
3. **Quick note creation** - Use \`Ctrl/Cmd + N\` from anywhere
4. **Search everywhere** - \`Ctrl/Cmd + K\` works from any view
5. **Auto-completion** - Start typing markdown syntax for suggestions

## Vim Mode Shortcuts

If you enable Vim mode in settings:

| Shortcut | Action |
|----------|--------|
| \`i\` | Insert mode |
| \`Esc\` | Normal mode |
| \`hjkl\` | Navigation |
| \`w\` | Next word |
| \`b\` | Previous word |
| \`0\` | Beginning of line |
| \`$\` | End of line |
| \`gg\` | Go to top |
| \`G\` | Go to bottom |
| \`dd\` | Delete line |
| \`yy\` | Copy line |
| \`p\` | Paste |

Remember: Practice makes perfect! The more you use these shortcuts, the faster you'll become. 🚀`,
    notebook: 'learn',
    tags: ['shortcuts', 'productivity', 'guide'],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'organizing-notes',
    title: 'Organizing Your Notes',
    content: `# Organizing Your Notes 📁

Good organization is key to finding and using your notes effectively. Here's how to master note organization in Viny!

## Notebooks

Notebooks are your main organizational tool. Think of them as folders for your notes.

### Default Notebooks

- **📥 Inbox** - Quick capture for ideas and temporary notes
- **📚 Learn** - Guides, tutorials, and learning resources
- **👤 Personal** - Personal notes and thoughts
- **🚀 Projects** - Development projects and ideas
- **💼 Work** - Work-related notes and projects

### Creating Notebooks

1. Click the "+" button next to "Notebooks" in the sidebar
2. Give it a descriptive name
3. Choose a color for easy identification
4. Add a description to remember its purpose

### Notebook Best Practices

- **Use descriptive names** - "Meeting Notes" instead of "Notes"
- **Choose meaningful colors** - Use consistent colors for similar topics
- **Add descriptions** - Help future you remember what each notebook is for
- **Don't over-organize** - Too many notebooks can be as bad as too few

## Tags

Tags are like labels you can add to notes for flexible organization.

### How to Use Tags

- Add tags when creating or editing notes
- Use \`#tag\` in your note content for quick tagging
- Filter notes by tags using the search/filter bar
- Combine multiple tags for powerful filtering

### Tag Best Practices

- **Use consistent naming** - \`meeting\` not \`meetings\` or \`meet\`
- **Keep tags short** - \`js\` instead of \`javascript\`
- **Use hierarchical tags** - \`project/web\`, \`project/mobile\`
- **Don't over-tag** - 3-5 tags per note is usually enough

### Common Tag Categories

- **Status**: \`todo\`, \`done\`, \`in-progress\`, \`archived\`
- **Priority**: \`urgent\`, \`important\`, \`someday\`
- **Type**: \`meeting\`, \`idea\`, \`reference\`, \`template\`
- **Project**: \`project-name\`, \`client-name\`
- **Context**: \`work\`, \`personal\`, \`learning\`

## Note Naming

Good note titles make finding information much easier.

### Title Best Practices

- **Be descriptive** - "Weekly Team Meeting 2024-01-15" vs "Meeting"
- **Include dates** for time-sensitive content
- **Use consistent formats** - Pick a style and stick with it
- **Front-load keywords** - Put important terms at the beginning

### Example Naming Conventions

- **Meetings**: "Team Meeting - 2024-01-15 - Sprint Planning"
- **Ideas**: "Idea: Mobile App for Local Restaurants"
- **References**: "Reference: Python List Comprehensions"
- **Templates**: "Template: Project Kickoff Checklist"

## Search and Finding Notes

### Search Tips

- Use the **global search** (\`Ctrl/Cmd + K\`) to find anything
- Search in **note titles**, **content**, and **tags**
- Use **filters** to narrow down results
- **Save searches** for commonly used filters

### Advanced Search

- \`tag:meeting\` - Find notes with specific tags
- \`notebook:work\` - Search within a specific notebook
- \`created:2024-01-15\` - Find notes created on a specific date
- \`modified:last-week\` - Find recently modified notes

## Maintenance Tips

### Regular Cleanup

1. **Review your inbox** weekly - process and organize captured notes
2. **Archive old notes** - Move completed projects to an archive notebook
3. **Update tags** - Remove outdated tags and add new ones as needed
4. **Clean up notebooks** - Merge similar notebooks if you have too many

### Monthly Review

- Look at your most-used notebooks and tags
- Identify organizational patterns that work for you
- Adjust your system based on how you actually use it
- Delete or archive notes you no longer need

## Workflow Examples

### GTD (Getting Things Done)

1. **Capture** everything in the inbox
2. **Process** inbox items into appropriate notebooks
3. **Organize** with tags like \`action\`, \`waiting\`, \`someday\`
4. **Review** regularly and update statuses

### PARA Method

- **Projects** - Things with a deadline and specific outcome
- **Areas** - Ongoing responsibilities to maintain
- **Resources** - Topics of ongoing interest
- **Archive** - Inactive items from the other categories

### Zettelkasten

- Create **atomic notes** - one idea per note
- Use **linking** between related notes
- Add **tags** for themes and topics
- Build **knowledge networks** over time

## Pro Tips 🎯

1. **Start simple** - Don't over-organize from the beginning
2. **Let your system evolve** - Adjust based on your actual usage
3. **Use templates** - Create note templates for common formats
4. **Link notes** - Use \`[[Note Title]]\` to create connections
5. **Regular reviews** - Schedule time to maintain your system

Remember: The best organization system is the one you'll actually use! Start simple and refine as you go. 📈`,
    notebook: 'learn',
    tags: ['organization', 'productivity', 'guide'],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-project-note',
    title: 'Sample Project: Todo App',
    content: `# Todo App Project 📋

## Overview

Building a simple todo application to practice React and state management.

## Features

### Core Features
- [ ] Add new todos
- [ ] Mark todos as complete
- [ ] Delete todos
- [ ] Edit todo text
- [ ] Filter todos (all, active, completed)

### Advanced Features
- [ ] Due dates
- [ ] Priority levels
- [ ] Categories/tags
- [ ] Search functionality
- [ ] Data persistence

## Tech Stack

- **Frontend**: React 18, TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Database**: LocalStorage (for now)
- **Testing**: Vitest, React Testing Library

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Setup | 1 day | Project setup, basic structure |
| Core Features | 3 days | CRUD operations, basic UI |
| Advanced Features | 2 days | Filtering, search, persistence |
| Testing | 1 day | Unit tests, integration tests |
| Polish | 1 day | UI improvements, bug fixes |

## Notes

- Keep it simple for the MVP
- Focus on clean code and good practices
- Consider accessibility from the start
- Plan for mobile responsiveness

## Resources

- [React Documentation](https://react.dev)
- [Zustand Guide](https://zustand.docs.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com)`,
    notebook: 'projects',
    tags: ['react', 'javascript', 'todo-app', 'project'],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'quick-idea',
    title: 'App idea: Recipe Manager',
    content: `# Recipe Manager App Idea 🍳

## The Problem

I always lose track of recipes I find online, and my bookmarks are a mess. Need a better way to organize and access cooking recipes.

## Solution

A simple recipe manager that:
- Saves recipes from URLs
- Allows manual recipe entry
- Organizes by categories (breakfast, dinner, dessert, etc.)
- Provides shopping list generation
- Offers meal planning features

## Quick Notes

- Could use web scraping for recipe import
- Mobile-first design for kitchen use
- Offline support for when cooking
- Integration with grocery apps?

## Next Steps

- [ ] Research existing solutions
- [ ] Create wireframes
- [ ] Technical feasibility study
- [ ] MVP feature list

*Note: Move this to projects when ready to start development*`,
    notebook: 'inbox',
    tags: ['idea', 'app', 'recipe', 'cooking'],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'daily-standup-template',
    title: 'Daily Standup Template',
    content: `# Daily Standup - [DATE] 🗓️

## What I did yesterday
- 
- 
- 

## What I'm doing today
- 
- 
- 

## Blockers/Issues
- 
- 

## Notes
- 
- 

---

*Template: Copy this template for daily standup notes*`,
    notebook: 'work',
    tags: ['template', 'standup', 'daily', 'work'],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'personal-goals',
    title: 'Personal Goals 2024',
    content: `# Personal Goals 2024 🎯

## Learning & Development

### Technical Skills
- [ ] Master TypeScript advanced features
- [ ] Learn system design patterns
- [ ] Contribute to open source projects
- [ ] Build a personal portfolio website

### Personal Growth
- [ ] Read 12 books this year
- [ ] Practice mindfulness daily
- [ ] Improve work-life balance
- [ ] Learn a new language (Spanish)

## Health & Wellness

- [ ] Exercise 3 times per week
- [ ] Cook at home 5 days per week
- [ ] Get 7-8 hours of sleep consistently
- [ ] Take regular breaks from screens

## Hobbies & Interests

- [ ] Start a photography project
- [ ] Learn to play guitar
- [ ] Try 3 new restaurants per month
- [ ] Plan 2 weekend trips

## Progress Check-ins

### Q1 Review (March)
- Progress: 
- Adjustments needed:

### Q2 Review (June)
- Progress:
- Adjustments needed:

### Q3 Review (September)
- Progress:
- Adjustments needed:

### Q4 Review (December)
- Progress:
- Final reflections:

## Notes

*Remember: Goals should be specific, measurable, and realistic. Review and adjust quarterly.*`,
    notebook: 'personal',
    tags: ['goals', '2024', 'planning', 'personal'],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]