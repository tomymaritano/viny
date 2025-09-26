import { useState, useCallback, useRef, useEffect } from 'react'

interface AutocompleteState {
  visible: boolean
  position: { x: number; y: number }
  query: string
  triggerChar: string
}

export function useAutocomplete(editorRef: React.RefObject<any>) {
  const [state, setState] = useState<AutocompleteState>({
    visible: false,
    position: { x: 0, y: 0 },
    query: '',
    triggerChar: ''
  })

  const updateTimeout = useRef<NodeJS.Timeout>()

  const checkForTrigger = useCallback(() => {
    if (!editorRef.current || !editorRef.current.view) return

    const view = editorRef.current.view
    const { state: editorState } = view
    const { from, to } = editorState.selection.main
    
    if (from !== to) {
      // Hide on selection
      setState(prev => ({ ...prev, visible: false }))
      return
    }

    const pos = from
    const line = editorState.doc.lineAt(pos)
    const lineText = line.text
    const linePos = pos - line.from

    // Check for trigger characters
    const triggers = ['#', '@', '[[', ':', '/']
    let foundTrigger = ''
    let triggerPos = -1
    let query = ''

    // Look backwards from cursor for trigger
    for (let i = linePos - 1; i >= 0; i--) {
      const substr = lineText.substring(i, linePos)
      
      // Check for double bracket trigger
      if (substr.startsWith('[[')) {
        foundTrigger = '[['
        triggerPos = i
        query = substr.slice(2)
        break
      }
      
      // Check for single char triggers
      const char = lineText[i]
      if (triggers.includes(char)) {
        // Make sure it's at word boundary
        if (i === 0 || /\s/.test(lineText[i - 1])) {
          foundTrigger = char
          triggerPos = i
          query = substr.slice(1)
          break
        }
      }
      
      // Stop at whitespace
      if (/\s/.test(char)) break
    }

    if (foundTrigger && query.length >= 0) {
      // Calculate position
      const coords = view.coordsAtPos(line.from + triggerPos)
      if (coords) {
        setState({
          visible: true,
          position: {
            x: coords.left,
            y: coords.bottom + 5
          },
          query: foundTrigger + query,
          triggerChar: foundTrigger
        })
      }
    } else {
      setState(prev => ({ ...prev, visible: false }))
    }
  }, [editorRef])

  const handleSelect = useCallback((text: string) => {
    if (!editorRef.current || !editorRef.current.view) return

    const view = editorRef.current.view
    const { state: editorState } = view
    const pos = editorState.selection.main.from
    const line = editorState.doc.lineAt(pos)
    const lineText = line.text
    const linePos = pos - line.from

    // Find the start of the query
    let start = linePos
    for (let i = linePos - 1; i >= 0; i--) {
      const char = lineText[i]
      if (state.triggerChar === '[[') {
        if (i > 0 && lineText.substring(i - 1, i + 1) === '[[') {
          start = i - 1
          break
        }
      } else if (char === state.triggerChar) {
        start = i
        break
      }
    }

    // Replace from trigger to cursor
    const from = line.from + start
    const to = pos

    view.dispatch({
      changes: { from, to, insert: text + ' ' },
      selection: { anchor: from + text.length + 1 }
    })

    // Hide autocomplete
    setState({ visible: false, position: { x: 0, y: 0 }, query: '', triggerChar: '' })
  }, [editorRef, state.triggerChar])

  const hide = useCallback(() => {
    setState({ visible: false, position: { x: 0, y: 0 }, query: '', triggerChar: '' })
  }, [])

  // Listen for editor changes
  useEffect(() => {
    if (!editorRef.current || !editorRef.current.view) return

    const view = editorRef.current.view
    
    const updateListener = () => {
      // Debounce updates
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current)
      }
      updateTimeout.current = setTimeout(checkForTrigger, 100)
    }

    // Add update listener
    const updateExtension = view.state.facet(view.state.facet as any).find(
      (ext: any) => ext?.update
    )
    
    if (!updateExtension) {
      // Fallback: poll for changes
      const interval = setInterval(checkForTrigger, 200)
      return () => clearInterval(interval)
    }

    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current)
      }
    }
  }, [editorRef, checkForTrigger])

  return {
    visible: state.visible,
    position: state.position,
    query: state.query,
    onSelect: handleSelect,
    onClose: hide
  }
}