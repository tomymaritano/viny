import { useState, useCallback, useRef, useEffect } from 'react'
import { useSettings } from '../../../hooks/useSettings'

export const useScrollSync = viewMode => {
  const [isScrollSyncing, setIsScrollSyncing] = useState(false)
  const editorContainerRef = useRef(null)
  const previewContainerRef = useRef(null)
  const { settings } = useSettings()
  const syncScrollEnabled = settings.syncScrolling !== false // Default to true

  const syncScroll = useCallback(
    (sourceElement, targetElement) => {
      if (
        !sourceElement ||
        !targetElement ||
        isScrollSyncing ||
        !syncScrollEnabled
      )
        return

      setIsScrollSyncing(true)

      const sourceScrollTop = sourceElement.scrollTop
      const sourceScrollHeight =
        sourceElement.scrollHeight - sourceElement.clientHeight
      const targetScrollHeight =
        targetElement.scrollHeight - targetElement.clientHeight

      if (sourceScrollHeight > 0 && targetScrollHeight > 0) {
        const scrollRatio = sourceScrollTop / sourceScrollHeight
        const newTargetScrollTop = scrollRatio * targetScrollHeight
        targetElement.scrollTop = newTargetScrollTop
      }

      setTimeout(() => setIsScrollSyncing(false), 50)
    },
    [isScrollSyncing, syncScrollEnabled]
  )

  const handleEditorScroll = useCallback(
    e => {
      if (viewMode === 'split' && previewContainerRef.current) {
        syncScroll(e.target, previewContainerRef.current)
      }
    },
    [viewMode, syncScroll]
  )

  const handlePreviewScroll = useCallback(
    e => {
      const editorContainer = editorContainerRef.current
      if (!editorContainer || viewMode !== 'split') return

      let editorElement = editorContainer.querySelector('.cm-scroller')

      if (!editorElement) {
        const cmEditor = editorContainer.querySelector('.cm-editor')
        if (cmEditor) {
          editorElement = cmEditor.querySelector('.cm-scroller')
        }
      }

      if (editorElement) {
        syncScroll(e.target, editorElement)
      }
    },
    [syncScroll, viewMode]
  )

  useEffect(() => {
    const editorContainer = editorContainerRef.current
    if (!editorContainer || viewMode !== 'split') return

    const setupScrollListener = () => {
      let editorElement = editorContainer.querySelector('.cm-scroller')

      if (!editorElement) {
        const cmEditor = editorContainer.querySelector('.cm-editor')
        if (cmEditor) {
          editorElement = cmEditor.querySelector('.cm-scroller')
        }
      }

      if (!editorElement) {
        setTimeout(setupScrollListener, 100)
        return
      }

      editorElement.addEventListener('scroll', handleEditorScroll, {
        passive: true,
      })
      return () =>
        editorElement.removeEventListener('scroll', handleEditorScroll)
    }

    let cleanup = setupScrollListener()

    if (!cleanup) {
      const observer = new window.MutationObserver(() => {
        cleanup = setupScrollListener()
        if (cleanup) {
          observer.disconnect()
        }
      })

      observer.observe(editorContainer, {
        childList: true,
        subtree: true,
      })

      setTimeout(() => {
        if (!cleanup) {
          cleanup = setupScrollListener()
        }
      }, 500)

      return () => {
        observer.disconnect()
        if (cleanup) cleanup()
      }
    }

    return cleanup
  }, [handleEditorScroll, viewMode])

  return {
    editorContainerRef,
    previewContainerRef,
    handlePreviewScroll,
  }
}
