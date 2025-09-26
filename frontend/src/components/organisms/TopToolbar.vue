<script setup lang="ts">
import BaseBox from '@/components/atoms/BaseBox.vue'
import BaseStack from '@/components/atoms/BaseStack.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseHeading from '@/components/atoms/BaseHeading.vue'
</script>

<template>
  <BaseBox
    :padding="['sp-2', 'sp-3']"
    shadow="--c-shadow-base"
    radius="none"
    class="top-toolbar"
  >
    <BaseStack gap="base" direction="row" align-items="center" class="toolbar-stack">
      <!-- Left side elements -->
      <div class="toolbar-section left">
        <BaseHeading :level="6">LucidFlow</BaseHeading>
        <BaseStack gap="base" direction="row" class="button-group">
          <BaseButton>
            <BaseIcon icon="fa-solid fa-play" />
            Run
          </BaseButton>
          <BaseButton>
            <BaseIcon icon="fa-solid fa-save" />
            Save
          </BaseButton>
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
  grid-area: topbar;
  /* border-bottom: 1px solid var(--c-border-base); */
  background-color: var(--c-background); /* Changed from --color-bg-base for better contrast */
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
