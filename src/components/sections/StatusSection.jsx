const StatusSection = () => {
  const stats = {
    totalNotes: 24,
    notebooks: 3,
    pinnedNotes: 3,
    trashedNotes: 2,
    wordCount: 15420,
    lastSync: '2024-01-15 14:30',
  }

  const recentActivity = [
    { action: 'Created', item: 'Project Planning Notes', time: '2 hours ago' },
    { action: 'Updated', item: 'Learning Neovim', time: '1 day ago' },
    { action: 'Deleted', item: 'Old Meeting Notes', time: '5 days ago' },
    { action: 'Created', item: 'Code Snippets Collection', time: '1 week ago' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-solarized-base5 mb-2">
          Status
        </h1>
        <p className="text-sm text-solarized-base1">
          Application statistics and recent activity
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-solarized-base02 border border-solarized-base01 rounded p-4 text-center">
          <div className="text-2xl font-bold text-solarized-blue mb-1">
            {stats.totalNotes}
          </div>
          <div className="text-sm text-solarized-base1">Total Notes</div>
        </div>
        <div className="bg-solarized-base02 border border-solarized-base01 rounded p-4 text-center">
          <div className="text-2xl font-bold text-solarized-green mb-1">
            {stats.notebooks}
          </div>
          <div className="text-sm text-solarized-base1">Notebooks</div>
        </div>
        <div className="bg-solarized-base02 border border-solarized-base01 rounded p-4 text-center">
          <div className="text-2xl font-bold text-solarized-yellow mb-1">
            {stats.pinnedNotes}
          </div>
          <div className="text-sm text-solarized-base1">Pinned Notes</div>
        </div>
        <div className="bg-solarized-base02 border border-solarized-base01 rounded p-4 text-center">
          <div className="text-2xl font-bold text-solarized-red mb-1">
            {stats.trashedNotes}
          </div>
          <div className="text-sm text-solarized-base1">In Trash</div>
        </div>
        <div className="bg-solarized-base02 border border-solarized-base01 rounded p-4 text-center">
          <div className="text-2xl font-bold text-solarized-cyan mb-1">
            {stats.wordCount.toLocaleString()}
          </div>
          <div className="text-sm text-solarized-base1">Total Words</div>
        </div>
        <div className="bg-solarized-base02 border border-solarized-base01 rounded p-4 text-center">
          <div className="text-lg font-bold text-solarized-magenta mb-1">✓</div>
          <div className="text-sm text-solarized-base1">Synced</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-solarized-base02 border border-solarized-base01 rounded p-4">
        <h3 className="text-lg font-medium text-solarized-base4 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    activity.action === 'Created'
                      ? 'bg-solarized-green text-solarized-base5'
                      : activity.action === 'Updated'
                        ? 'bg-solarized-blue text-solarized-base5'
                        : 'bg-solarized-red text-solarized-base5'
                  }`}
                >
                  {activity.action}
                </span>
                <span className="text-sm text-solarized-base2">
                  {activity.item}
                </span>
              </div>
              <span className="text-xs text-solarized-base0">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Info */}
      <div className="mt-6 p-4 bg-solarized-base02 border border-solarized-base01 rounded">
        <div className="flex items-center justify-between">
          <span className="text-sm text-solarized-base1">
            Last synced: {stats.lastSync}
          </span>
          <button className="px-3 py-1 bg-solarized-blue text-solarized-base5 rounded text-sm hover:bg-solarized-green-hover transition-colors">
            Sync Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default StatusSection
