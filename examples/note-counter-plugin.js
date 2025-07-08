// Nototo Plugin: Note Counter
// Displays note statistics and productivity metrics

export default {
  name: 'note-counter',
  version: '1.2.0',
  description: 'Track your note-taking productivity with detailed statistics and insights',
  author: 'Nototo Community',
  
  config: {
    showInSidebar: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    showDailyGoal: true,
    dailyGoal: 5 // notes per day
  },

  activate(api) {
    this.api = api
    this.refreshTimer = null
    
    console.log('Note Counter plugin activated!')

    // Add sidebar section with stats
    if (this.config.showInSidebar) {
      api.ui.addSidebarSection({
        id: 'note-counter-section',
        title: 'Note Statistics',
        icon: '📊',
        content: this.renderStats(),
        onClick: () => {
          this.showDetailedStats()
        }
      })
    }

    // Add toolbar button
    api.editor.addToolbarButton({
      id: 'note-counter-stats',
      title: 'Show Statistics',
      icon: '📊',
      onClick: () => {
        this.showDetailedStats()
      }
    })

    // Add command
    api.editor.addCommand({
      id: 'note-counter.show-stats',
      name: 'Note Counter: Show Statistics',
      keybinding: 'Ctrl+Shift+S',
      callback: () => {
        this.showDetailedStats()
      }
    })

    // Set up auto-refresh
    if (this.config.autoRefresh) {
      this.startAutoRefresh()
    }

    // Track plugin usage
    this.incrementUsageCount()
    
    api.ui.showToast('Note Counter plugin ready! 📊', 'success')
  },

  deactivate() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    console.log('Note Counter plugin deactivated!')
  },

  // Calculate various statistics
  calculateStats() {
    const notes = this.api.notes.getAll()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Filter notes (exclude trashed)
    const activeNotes = notes.filter(note => !note.isTrashed)
    
    // Calculate basic stats
    const totalNotes = activeNotes.length
    const totalWords = activeNotes.reduce((sum, note) => sum + this.countWords(note.content), 0)
    const averageWords = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0
    
    // Calculate time-based stats
    const todayNotes = activeNotes.filter(note => 
      new Date(note.createdAt || note.date) >= today
    ).length
    
    const weekNotes = activeNotes.filter(note => 
      new Date(note.createdAt || note.date) >= thisWeek
    ).length
    
    const monthNotes = activeNotes.filter(note => 
      new Date(note.createdAt || note.date) >= thisMonth
    ).length

    // Calculate progress toward daily goal
    const dailyProgress = this.config.showDailyGoal ? 
      Math.min(100, Math.round((todayNotes / this.config.dailyGoal) * 100)) : 0

    // Find most productive day
    const dayStats = this.calculateDayStats(activeNotes)
    const mostProductiveDay = this.getMostProductiveDay(dayStats)

    // Calculate notebook distribution
    const notebookStats = this.calculateNotebookStats(activeNotes)

    return {
      totalNotes,
      totalWords,
      averageWords,
      todayNotes,
      weekNotes,
      monthNotes,
      dailyProgress,
      mostProductiveDay,
      notebookStats,
      dayStats
    }
  },

  countWords(text) {
    return text.trim().split(/\s+/).length
  },

  calculateDayStats(notes) {
    const dayStats = {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Initialize day stats
    days.forEach(day => dayStats[day] = 0)
    
    // Count notes by day of week
    notes.forEach(note => {
      const date = new Date(note.createdAt || note.date)
      const day = days[date.getDay()]
      dayStats[day]++
    })
    
    return dayStats
  },

  getMostProductiveDay(dayStats) {
    let maxCount = 0
    let maxDay = 'No data'
    
    Object.entries(dayStats).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxDay = day
      }
    })
    
    return { day: maxDay, count: maxCount }
  },

  calculateNotebookStats(notes) {
    const notebookCounts = {}
    
    notes.forEach(note => {
      const notebook = note.notebook || 'Default'
      notebookCounts[notebook] = (notebookCounts[notebook] || 0) + 1
    })
    
    return Object.entries(notebookCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Top 5 notebooks
  },

  renderStats() {
    const stats = this.calculateStats()
    
    return `
      <div class="note-counter-stats">
        <div class="stat-item">
          <span class="stat-number">${stats.totalNotes}</span>
          <span class="stat-label">Total Notes</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${stats.todayNotes}</span>
          <span class="stat-label">Today</span>
        </div>
        ${this.config.showDailyGoal ? `
          <div class="stat-item">
            <span class="stat-number">${stats.dailyProgress}%</span>
            <span class="stat-label">Daily Goal</span>
          </div>
        ` : ''}
      </div>
    `
  },

  showDetailedStats() {
    const stats = this.calculateStats()
    
    const message = `
📊 Note Statistics:

📝 Total Notes: ${stats.totalNotes}
🔤 Total Words: ${stats.totalWords.toLocaleString()}
📊 Average Words/Note: ${stats.averageWords}

📅 Time-based Stats:
• Today: ${stats.todayNotes} notes
• This Week: ${stats.weekNotes} notes  
• This Month: ${stats.monthNotes} notes

${this.config.showDailyGoal ? `🎯 Daily Goal: ${stats.todayNotes}/${this.config.dailyGoal} (${stats.dailyProgress}%)` : ''}

🏆 Most Productive Day: ${stats.mostProductiveDay.day} (${stats.mostProductiveDay.count} notes)

📚 Top Notebooks:
${stats.notebookStats.map(([name, count]) => `• ${name}: ${count} notes`).join('\n')}
    `.trim()
    
    this.api.ui.showToast(message, 'info')
  },

  startAutoRefresh() {
    this.refreshTimer = setInterval(() => {
      // Update sidebar section if it exists
      // In a real implementation, this would update the UI
      console.log('Auto-refreshing note statistics...')
    }, this.config.refreshInterval)
  },

  incrementUsageCount() {
    const currentCount = this.api.utils.storage.get('usageCount') || 0
    this.api.utils.storage.set('usageCount', currentCount + 1)
    this.api.utils.storage.set('lastUsed', new Date().toISOString())
  },

  // Export notes with statistics
  exportWithStats() {
    const stats = this.calculateStats()
    const notes = this.api.notes.getAll().filter(note => !note.isTrashed)
    
    let output = `# Note Statistics Export\n\n`
    output += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    output += `## Summary\n`
    output += `- Total Notes: ${stats.totalNotes}\n`
    output += `- Total Words: ${stats.totalWords.toLocaleString()}\n`
    output += `- Average Words per Note: ${stats.averageWords}\n\n`
    
    output += `## Notes\n\n`
    notes.forEach((note, index) => {
      const wordCount = this.countWords(note.content)
      output += `### ${index + 1}. ${note.title}\n`
      output += `**Words:** ${wordCount} | **Created:** ${new Date(note.createdAt || note.date).toLocaleDateString()}\n\n`
      output += `${note.content}\n\n---\n\n`
    })
    
    return output
  }
}

/*
Plugin Features:
===============

This Note Counter plugin provides:

1. Real-time statistics about your notes
2. Productivity tracking and daily goals
3. Time-based analytics (today, week, month)
4. Notebook distribution analysis
5. Most productive day identification
6. Auto-refresh capabilities
7. Keyboard shortcuts for quick access
8. Export functionality with embedded stats

Usage:
- View quick stats in the sidebar
- Click the sidebar section for detailed stats
- Use Ctrl+Shift+S to show statistics
- Set daily goals in plugin configuration

The plugin helps users understand their note-taking patterns
and maintain productivity momentum.
*/