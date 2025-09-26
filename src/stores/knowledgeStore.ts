import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  GraphData,
  GraphNode,
  ChatConversation,
  ChatMessage,
  GraphLayout,
} from '../types/knowledge'

interface KnowledgeStore {
  // Graph state
  graphData: GraphData
  selectedNodeId: string | null
  graphLayout: GraphLayout
  graphFilters: {
    nodeTypes: Set<GraphNode['type']>
    dateRange?: [Date, Date]
    tags?: string[]
  }

  // Chat state
  conversations: ChatConversation[]
  activeConversationId: string | null
  streamingMessageId: string | null

  // Graph actions
  setGraphData: (data: GraphData) => void
  selectNode: (nodeId: string | null) => void
  setGraphLayout: (layout: GraphLayout) => void
  updateGraphFilters: (filters: Partial<KnowledgeStore['graphFilters']>) => void

  // Chat actions
  addConversation: (conversation: ChatConversation) => void
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void
  deleteConversation: (id: string) => void
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<ChatMessage>
  ) => void

  // Utility actions
  createNewConversation: (title?: string) => string
  clearAllData: () => void
}

export const useKnowledgeStore = create<KnowledgeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        graphData: { nodes: [], edges: [] },
        selectedNodeId: null,
        graphLayout: 'force',
        graphFilters: {
          nodeTypes: new Set(['note', 'tag', 'notebook']),
        },
        conversations: [],
        activeConversationId: null,
        streamingMessageId: null,

        // Graph actions
        setGraphData: data => set({ graphData: data }),

        selectNode: nodeId => set({ selectedNodeId: nodeId }),

        setGraphLayout: layout => set({ graphLayout: layout }),

        updateGraphFilters: filters =>
          set(state => ({
            graphFilters: { ...state.graphFilters, ...filters },
          })),

        // Chat actions
        addConversation: conversation =>
          set(state => ({
            conversations: [...state.conversations, conversation],
          })),

        updateConversation: (id, updates) =>
          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
            ),
          })),

        deleteConversation: id =>
          set(state => ({
            conversations: state.conversations.filter(c => c.id !== id),
            activeConversationId:
              state.activeConversationId === id
                ? null
                : state.activeConversationId,
          })),

        setActiveConversation: id => set({ activeConversationId: id }),

        addMessage: (conversationId, message) =>
          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: [...c.messages, message],
                    updatedAt: new Date(),
                  }
                : c
            ),
          })),

        updateMessage: (conversationId, messageId, updates) =>
          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === messageId ? { ...m, ...updates } : m
                    ),
                    updatedAt: new Date(),
                  }
                : c
            ),
          })),

        // Utility actions
        createNewConversation: title => {
          const newConversation: ChatConversation = {
            id: `conv-${Date.now()}`,
            title: title || `New Chat ${new Date().toLocaleDateString()}`,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {},
          }

          set(state => ({
            conversations: [...state.conversations, newConversation],
            activeConversationId: newConversation.id,
          }))

          return newConversation.id
        },

        clearAllData: () =>
          set({
            graphData: { nodes: [], edges: [] },
            selectedNodeId: null,
            conversations: [],
            activeConversationId: null,
            streamingMessageId: null,
          }),
      }),
      {
        name: 'knowledge-store',
        partialize: state => ({
          conversations: state.conversations,
          activeConversationId: state.activeConversationId,
          graphLayout: state.graphLayout,
          graphFilters: {
            ...state.graphFilters,
            nodeTypes: Array.from(state.graphFilters.nodeTypes),
          },
        }),
        onRehydrateStorage: () => state => {
          if (state && state.graphFilters.nodeTypes) {
            state.graphFilters.nodeTypes = new Set(
              state.graphFilters.nodeTypes as any
            )
          }
        },
      }
    )
  )
)
