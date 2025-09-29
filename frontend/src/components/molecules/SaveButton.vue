<script setup lang="ts">
import { ref } from 'vue';
import ImmersiveButton from '@/components/molecules/ImmersiveButton.vue';
import BaseIcon from '@/components/atoms/BaseIcon.vue';
import BaseCard from '@/components/atoms/BaseCard.vue';
import BaseStack from '@/components/atoms/BaseStack.vue';
import { onClickOutside } from '@vueuse/core';

const emit = defineEmits<{
  (e: 'save'): void;
  (e: 'save-as'): void;
}>();

const isDropdownOpen = ref(false);
const dropdown = ref(null);

onClickOutside(dropdown, () => {
  isDropdownOpen.value = false;
});

const handleSave = () => {
  emit('save');
  isDropdownOpen.value = false;
};

const handleSaveAs = () => {
  emit('save-as');
  isDropdownOpen.value = false;
};
</script>

<template>
  <BaseStack
    class="save-button-group"
    gap="none"
    direction="row"
    align="center"
    bg="--c-fill-light"
  >
    <ImmersiveButton class="main-button" @click="handleSave">
      <BaseIcon icon="fa-solid fa-save" />
    </ImmersiveButton>
    <div class="divider"></div>
    <div class="dropdown-container">
      <ImmersiveButton
        class="trigger-button"
        @click="isDropdownOpen = !isDropdownOpen"
      >
        <BaseIcon icon="fa-solid fa-caret-down" />
      </ImmersiveButton>
      <transition name="fade">
        <BaseCard
          v-if="isDropdownOpen"
          ref="dropdown"
          class="dropdown-menu"
          shadow="base"
          padding="sm"
        >
          <BaseStack vertical spacing="sm">
            <div class="dropdown-item" @click="handleSave">Save</div>
            <div class="dropdown-item" @click="handleSaveAs">Save As...</div>
          </BaseStack>
        </BaseCard>
      </transition>
    </div>
  </BaseStack>
</template>

<style scoped>
.save-button-group {
  position: relative;
  display: inline-flex;
  border: 1px solid var(--c-border-base);
  border-radius: var(--radius-base);
  /* overflow: hidden; */

}

.main-button,
.trigger-button {
  border-radius: 0;
  padding: 6px 10px;
}

.main-button:hover,
.trigger-button:hover {
  /* background-color: var(--c-fill-lighter); */
}

.divider {
  width: 1px;
  background-color: var(--c-border-base);
  align-self: stretch;
}

.dropdown-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 10;
  width: 150px;
}

.dropdown-item {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  /* background-color: var(--c-fill-light); */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
