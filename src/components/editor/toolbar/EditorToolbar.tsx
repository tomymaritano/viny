import PropTypes from 'prop-types'
import Icons from '../../Icons'
import IconButton from '../../ui/IconButton'

const EditorToolbar = ({
  onBold,
  onItalic,
  onStrikethrough,
  onCode,
  onHeading,
  onLink,
  onImage,
  onList,
  onOrderedList,
  onCheckbox,
  onCodeBlock,
  onQuote,
  onTable,
  onHorizontalRule,
  onTags,
  onToggleLineNumbers,
  showLineNumbers,
  isSaving,
  lastSaved,
  saveError,
  insertText, // Add insertText prop for ImageUrlConverter
}) => {
  const toolbarSections = [
    // Text formatting
    {
      name: 'formatting',
      items: [
        {
          icon: Icons.Bold,
          onClick: onBold,
          title: 'Bold (Ctrl+B)',
          shortcut: 'Ctrl+B',
        },
        {
          icon: Icons.Italic,
          onClick: onItalic,
          title: 'Italic (Ctrl+I)',
          shortcut: 'Ctrl+I',
        },
        {
          icon: Icons.Strikethrough,
          onClick: onStrikethrough,
          title: 'Strikethrough',
          shortcut: '',
        },
        {
          icon: Icons.Code,
          onClick: onCode,
          title: 'Inline Code (Ctrl+E)',
          shortcut: 'Ctrl+E',
        },
      ],
    },
    // Headings
    {
      name: 'headings',
      items: [
        {
          icon: Icons.Heading1,
          onClick: () => onHeading(1),
          title: 'Heading 1',
          shortcut: '',
        },
        {
          icon: Icons.Heading2,
          onClick: () => onHeading(2),
          title: 'Heading 2',
          shortcut: '',
        },
        {
          icon: Icons.Heading3,
          onClick: () => onHeading(3),
          title: 'Heading 3',
          shortcut: '',
        },
      ],
    },
    // Links and media
    {
      name: 'media',
      items: [
        {
          icon: Icons.Link,
          onClick: onLink,
          title: 'Link (Ctrl+L)',
          shortcut: 'Ctrl+L',
        },
        {
          icon: Icons.Image,
          onClick: () => {
            // Trigger hidden file input for clean UX
            const fileInput = document.createElement('input')
            fileInput.type = 'file'
            fileInput.accept = 'image/*'
            fileInput.style.display = 'none'
            
            fileInput.onchange = async (e) => {
              const file = e.target.files[0]
              if (file && insertText) {
                try {
                  const altText = file.name
                  const sizeKB = Math.round(file.size / 1024)
                  
                  // Generate a short reference ID
                  const imageId = 'img_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
                  
                  // Store the data URI in a global map for retrieval
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const dataUri = event.target.result
                    
                    // Store in localStorage for persistence
                    try {
                      const storedImages = JSON.parse(localStorage.getItem('nototo-images') || '{}')
                      storedImages[imageId] = dataUri
                      localStorage.setItem('nototo-images', JSON.stringify(storedImages))
                      
                      // Also store in memory for immediate access
                      if (!window.nototoImageStore) {
                        window.nototoImageStore = new Map()
                      }
                      window.nototoImageStore.set(imageId, dataUri)
                      
                      // Insert clean reference in editor
                      insertText(`![${altText}](nototo://image:${imageId})`)
                    } catch (error) {
                      console.error('Failed to store image:', error)
                      // Fallback to data URI if storage fails
                      insertText(`![${altText}](${dataUri})`)
                    }
                  }
                  reader.readAsDataURL(file)
                } catch (error) {
                  console.error('Error processing image:', error)
                  onImage() // Fallback
                }
              }
              // Clean up
              document.body.removeChild(fileInput)
            }
            
            document.body.appendChild(fileInput)
            fileInput.click()
          },
          title: 'Upload Image',
          shortcut: '',
        },
        {
          icon: Icons.Tag,
          onClick: onTags,
          title: 'Manage Tags',
          shortcut: '',
        },
      ],
    },
    // Lists
    {
      name: 'lists',
      items: [
        {
          icon: Icons.List,
          onClick: onList,
          title: 'Bullet List',
          shortcut: 'Ctrl+Shift+L',
        },
        {
          icon: Icons.ListOrdered,
          onClick: onOrderedList,
          title: 'Numbered List',
          shortcut: '',
        },
        {
          icon: Icons.CheckSquare,
          onClick: onCheckbox,
          title: 'Task List',
          shortcut: '',
        },
      ],
    },
    // Blocks
    {
      name: 'blocks',
      items: [
        {
          icon: Icons.Code2,
          onClick: onCodeBlock,
          title: 'Code Block (Ctrl+Shift+C)',
          shortcut: 'Ctrl+Shift+C',
        },
        {
          icon: Icons.Quote,
          onClick: onQuote,
          title: 'Quote (Ctrl+Shift+Q)',
          shortcut: 'Ctrl+Shift+Q',
        },
        {
          icon: Icons.Table,
          onClick: onTable,
          title: 'Table',
          shortcut: '',
        },
        {
          icon: Icons.Minus,
          onClick: onHorizontalRule,
          title: 'Horizontal Rule',
          shortcut: '',
        },
      ],
    },
    // Editor Settings
    {
      name: 'settings',
      items: [
        {
          icon: Icons.Hash,
          onClick: onToggleLineNumbers,
          title: 'Toggle Line Numbers',
          shortcut: '',
          active: showLineNumbers,
        },
      ],
    },
  ]

  const getSaveIndicator = () => {
    if (isSaving) {
      return (
        <div className="flex items-center text-theme-text-tertiary text-xs">
          <Icons.Loader2 size={14} className="animate-spin mr-1" />
          <span>Saving...</span>
        </div>
      )
    }

    if (saveError) {
      return (
        <div className="flex items-center text-theme-accent-red text-xs">
          <Icons.AlertCircle size={14} className="mr-1" />
          <span>Error saving</span>
        </div>
      )
    }

    if (lastSaved) {
      const timeSinceLastSave = Date.now() - new Date(lastSaved).getTime()
      const seconds = Math.floor(timeSinceLastSave / 1000)

      if (seconds < 5) {
        return (
          <div className="flex items-center text-theme-accent-green text-xs">
            <Icons.CheckCircle size={14} className="mr-1" />
            <span>Saved</span>
          </div>
        )
      }
    }

    return null
  }

  return (
    <div
      className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-theme-border-primary overflow-x-auto custom-scrollbar-thin bg-theme-bg-primary"
    >
      {/* Toolbar buttons - responsive layout */}
      <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
        {toolbarSections.map((section, sectionIndex) => (
          <div
            key={section.name}
            className="flex items-center space-x-1 flex-shrink-0"
          >
            {/* Hide some sections on smaller screens */}
            <div
              className={`flex items-center space-x-1 ${
                section.name === 'headings'
                  ? 'hidden sm:flex'
                  : section.name === 'blocks'
                    ? 'hidden md:flex'
                    : 'flex'
              }`}
            >
              {section.items.map((item, itemIndex) => (
                <IconButton
                  key={itemIndex}
                  icon={item.icon}
                  onClick={item.onClick}
                  isActive={item.active}
                  title={item.title}
                  size={14}
                  variant="default"
                  aria-label={item.title}
                  aria-pressed={item.active}
                  aria-keyshortcuts={item.shortcut}
                />
              ))}
            </div>
            {/* Responsive separators */}
            {sectionIndex < toolbarSections.length - 1 && (
              <div className="w-px h-4 bg-white/10 mx-1 sm:mx-2 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Save indicator - hide on very small screens */}
      <div className="hidden sm:flex items-center ml-2 flex-shrink-0">
        {getSaveIndicator()}
      </div>

    </div>
  )
}

EditorToolbar.propTypes = {
  onBold: PropTypes.func.isRequired,
  onItalic: PropTypes.func.isRequired,
  onStrikethrough: PropTypes.func.isRequired,
  onCode: PropTypes.func.isRequired,
  onHeading: PropTypes.func.isRequired,
  onLink: PropTypes.func.isRequired,
  onImage: PropTypes.func.isRequired,
  onList: PropTypes.func.isRequired,
  onOrderedList: PropTypes.func.isRequired,
  onCheckbox: PropTypes.func.isRequired,
  onCodeBlock: PropTypes.func.isRequired,
  onQuote: PropTypes.func.isRequired,
  onTable: PropTypes.func.isRequired,
  onHorizontalRule: PropTypes.func.isRequired,
  onTags: PropTypes.func.isRequired,
  onToggleLineNumbers: PropTypes.func.isRequired,
  showLineNumbers: PropTypes.bool,
  isSaving: PropTypes.bool,
  lastSaved: PropTypes.string,
  saveError: PropTypes.string,
  insertText: PropTypes.func, // Optional for inline image upload
}

export default EditorToolbar
