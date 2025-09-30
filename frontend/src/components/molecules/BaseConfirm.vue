<template>
  <transition name="fade">
    <div v-if="visible" class="base-confirm__overlay" @click.self="handleCancel">
      <BaseCard class="base-confirm__dialog" shadow="dark" radius="lg" p="lg">
        <BaseStack gap="md">
          <BaseHeading :level=3>{{ title }}</BaseHeading>
          <BaseText v-if="message" color="secondary">{{ message }}</BaseText>
          <BaseStack direction="row" justify="flex-end" gap="sm">
            <BaseButton variant="secondary" @click="handleCancel">取消</BaseButton>
            <BaseButton @click="handleConfirm">确认</BaseButton>
          </BaseStack>
        </BaseStack>
      </BaseCard>
    </div>
  </transition>
</template>

<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseCard from '@/components/atoms/BaseCard.vue';
import BaseStack from '@/components/atoms/BaseStack.vue';
import BaseHeading from '@/components/atoms/BaseHeading.vue';
import BaseText from '@/components/atoms/BaseText.vue';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
}

defineProps<Props>();
const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.base-confirm__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.base-confirm__dialog {
  width: 90%;
  max-width: 400px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
