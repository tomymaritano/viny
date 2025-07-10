import PropTypes from 'prop-types'
import AllNotesSection from './sections/AllNotesSection'
import PinnedNotesSection from './sections/PinnedNotesSection'
import NotebookSection from './sections/NotebookSection'
import TrashSection from './sections/TrashSection'
import StatusSection from './sections/StatusSection'

const MainContent = ({ activeSection, notes, onOpenNote, onNewNote }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'all-notes':
        return (
          <AllNotesSection
            notes={notes}
            onOpenNote={onOpenNote}
            onNewNote={onNewNote}
          />
        )
      case 'pinned':
        return <PinnedNotesSection notes={notes} onOpenNote={onOpenNote} />
      case 'personal':
      case 'work':
      case 'projects':
        return (
          <NotebookSection
            notebookId={activeSection}
            notes={notes}
            onOpenNote={onOpenNote}
          />
        )
      case 'trash':
        return <TrashSection />
      case 'status':
        return <StatusSection notes={notes} />
      default:
        return (
          <AllNotesSection
            notes={notes}
            onOpenNote={onOpenNote}
            onNewNote={onNewNote}
          />
        )
    }
  }

  return (
    <div className="flex-1 theme-bg-primary overflow-hidden ui-font">
      <div className="h-full overflow-y-auto">{renderSection()}</div>
    </div>
  )
}

MainContent.propTypes = {
  activeSection: PropTypes.string.isRequired,
  notes: PropTypes.array.isRequired,
  onOpenNote: PropTypes.func.isRequired,
  onNewNote: PropTypes.func.isRequired,
}

export default MainContent
