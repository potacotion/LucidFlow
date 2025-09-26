import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SidebarTab = 'files' | 'nodes' | null

export const useUIStore = defineStore('ui', () => {
  // State
  const activeSidebarTab = ref<SidebarTab>(null)
  const isConfigPanelVisible = ref(false)
  const selectedNodeId = ref<string | null>(null)

  // Actions
  function toggleSidebarTab(tab: SidebarTab) {
    if (activeSidebarTab.value === tab) {
      activeSidebarTab.value = null // Close if clicking the same tab again
    } else {
      activeSidebarTab.value = tab
    }
  }

  function showConfigPanel(nodeId: string) {
    selectedNodeId.value = nodeId
    isConfigPanelVisible.value = true
  }

  function hideConfigPanel() {
    selectedNodeId.value = null
    isConfigPanelVisible.value = false
  }

  return {
    // State
    activeSidebarTab,
    isConfigPanelVisible,
    selectedNodeId,
    // Actions
    toggleSidebarTab,
    showConfigPanel,
    hideConfigPanel,
  }
})
