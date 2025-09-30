<script setup lang="ts">
import BaseBox from '@/components/atoms/BaseBox.vue'
import BaseStack from '@/components/atoms/BaseStack.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseHeading from '@/components/atoms/BaseHeading.vue'
import BorderedImmersiveButton from '@/components/molecules/BorderedImmersiveButton.vue'
import SaveButton from '@/components/molecules/SaveButton.vue'
import { useWorkflowStore } from '@/stores/workflow.store';
import { useFileStore } from '@/stores/file.store';
import { WorkflowsService } from '@/api/services/WorkflowsService';
import { BaseToast } from '@/services/toast';

const workflowStore = useWorkflowStore();
const fileStore = useFileStore();

async function handleRunWorkflow() {
  if (!workflowStore.currentWorkflowId) {
    BaseToast.warning('No active workflow to run.');
    return;
  }
  try {
    const result = await WorkflowsService.postApiWorkflowsRun(workflowStore.currentWorkflowId);
    BaseToast.success(`Workflow finished with result: ${JSON.stringify(result)}`);
  } catch (error) {
    BaseToast.error('Failed to execute workflow.');
    console.error(error);
  }
}
</script>

<template>
  <BaseBox
    py="xs"
    px="xs"
    shadow="--c-shadow-base"
    radius="none"
    class="top-toolbar"
  >
    <BaseStack gap="base" direction="row" align-items="center" class="toolbar-stack">
      <!-- Left side elements -->
      <div class="toolbar-section left">
        <BaseHeading :level="6">LucidFlow</BaseHeading>
        <BaseStack gap="base" direction="row" class="button-group">
          <BorderedImmersiveButton tooltip="run" @click="handleRunWorkflow">
            <BaseIcon icon="fa-solid fa-play" />
            Run
          </BorderedImmersiveButton>
          <SaveButton @save="fileStore.saveFile" @save-as="fileStore.openSaveAsModal" />
        </BaseStack>
      </div>

      <!-- Spacer to push right elements -->
      <div class="spacer">
        <BaseHeading :level="4">My LucidFlow</BaseHeading>
      </div>

      <!-- Right side elements -->
      <div class="toolbar-section right">
        <BaseStack direction="row" class="button-group">
          <BaseButton size="base" variant="text">
            <BaseIcon icon="fa-solid fa-ellipsis-h" />
          </BaseButton>
        </BaseStack>
      </div>
    </BaseStack>
  </BaseBox>
</template>

<style scoped>
.top-toolbar {
  position: relative;
  z-index: 1;
  grid-area: topbar;
  /* border-bottom: 1px solid var(--c-border-base); */
  background-color: var(--c-fill-extra-light); /* Changed from --color-bg-base for better contrast */
}

.button-group {
  gap: var(--sp-xs) ;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.spacer {
  flex-grow: 1;
  text-align: center;
}
</style>
