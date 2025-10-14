<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import type { PropertyDefinition, PortDefinition } from '@/types/workflow'

// Layout & Text
import BaseBox from '@/components/atoms/BaseBox.vue'
import BaseText from '@/components/atoms/BaseText.vue'
import BaseHeading from '@/components/atoms/BaseHeading.vue'
import BaseStack from '@/components/atoms/BaseStack.vue'
import BaseDivider from '@/components/atoms/BaseDivider.vue'

// Form Components
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseTextarea from '@/components/atoms/BaseTextarea.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseSwitch from '@/components/atoms/BaseSwitch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
// NOTE: BaseSlider and a proper CodeEditor would be imported here if they exist

const uiStore = useUIStore()
const workflowStore = useWorkflowStore()

/**
 * Computed property to manage triggerTag for isTriggerable nodes.
 * We store it directly in propertyValues.triggerTag.
 */
const triggerTagValue = computed({
  get() {
    return workflowStore.selectedNode?.propertyValues?.triggerTag || '';
  },
  set(value: string) {
    if (workflowStore.selectedNode) {
        // We use updateNodeProperties to save it, simulating a property update.
        // The property definition is configured in trigger/manual/1.0.0/index.ts
        workflowStore.updateNodeProperties(workflowStore.selectedNode.id, { triggerTag: value });
    }
  }
});

/**
 * Helper function to handle general property value updates.
 * This can be expanded later to include debouncing or other logic.
 */
function updatePropertyValue(name: string, value: any) {
  if (workflowStore.selectedNode) {
    workflowStore.updateNodeProperties(workflowStore.selectedNode.id, { [name]: value })
  }
}

// --- Dynamic Ports Logic ---

const dynamicInputPorts = computed(() => {
  const node = workflowStore.selectedNode;
  const definition = workflowStore.selectedNodeDefinition;
  if (!node || !definition?.dynamicPorts) {
    return [];
  }
  const prefix = definition.dynamicPorts.portTemplate.namePrefix;
  return node.ports.filter(p => p.direction === 'in' && p.name.startsWith(prefix));
});

const dynamicOutputPorts = computed(() => {
  const node = workflowStore.selectedNode;
  const definition = workflowStore.selectedNodeDefinition;
  if (!node || !definition?.dynamicPorts) {
    return [];
  }
  const prefix = definition.dynamicPorts.portTemplate.namePrefix;
  return node.ports.filter(p => p.direction === 'out' && p.name.startsWith(prefix));
});

function addDynamicPort(direction: 'in' | 'out') {
  const node = workflowStore.selectedNode;
  const definition = workflowStore.selectedNodeDefinition;
  if (!node || !definition?.dynamicPorts) return;

  const template = definition.dynamicPorts.portTemplate;

  const existingPorts = direction === 'in' ? dynamicInputPorts.value : dynamicOutputPorts.value;
  const newPortNumber = existingPorts.length + 1;

  const newPort: PortDefinition = {
    type: 'data', // Default to 'data', should be overridden by template if specified
    ...template,
    name: `${template.namePrefix}${newPortNumber}`,
    label: `${template.labelPrefix} ${newPortNumber}`,
    direction, // Use the provided direction
  };

  const newPorts = [...node.ports, newPort];
  workflowStore.updateNodePorts(node.id, newPorts);
}

function removeDynamicPort(portNameToRemove: string) {
  const node = workflowStore.selectedNode;
  if (!node) return;

  const newPorts = node.ports.filter(p => p.name !== portNameToRemove);
  workflowStore.updateNodePorts(node.id, newPorts);
}
</script>

<template>
  <div v-if="uiStore.isConfigPanelVisible && workflowStore.selectedNode" class="config-panel-wrapper">
    <BaseBox p="md"  class="config-panel">
      <!-- Node Header -->
      <div>
        <BaseHeading :level="6" class="panel-title">
          {{ workflowStore.selectedNode.label }}
        </BaseHeading>
        <BaseText size="sm" color="gray-500">
          {{ workflowStore.selectedNode.type }}
        </BaseText>
      </div>

      <BaseDivider />

      <!-- Trigger Tag Configuration (for isTriggerable nodes) -->
      <BaseStack
          v-if="workflowStore.selectedNodeDefinition?.isTriggerable"
          direction="column"
          gap="sm"
          class="trigger-tag-section"
      >
          <label for="triggerTag">
              <BaseText size="sm" weight="bold">Trigger Tag</BaseText>
              <BaseText size="xs" color="gray-500">
                  Unique tag for API/SDK execution.
              </BaseText>
          </label>
          <BaseInput
              id="triggerTag"
              v-model="triggerTagValue"
              placeholder="e.g., main_api_endpoint"
          />
      </BaseStack>
      <BaseDivider v-if="workflowStore.selectedNodeDefinition?.isTriggerable" />

      <!-- Dynamic Ports Management -->
      <div v-if="workflowStore.selectedNodeDefinition?.dynamicPorts" class="dynamic-ports-section">
        <BaseStack direction="column" gap="lg">
          <!-- Inputs Section -->
          <div v-if="workflowStore.selectedNodeDefinition.dynamicPorts.canAdd.in">
            <BaseStack direction="column" gap="sm">
              <BaseText size="sm" weight="bold">Dynamic Inputs</BaseText>
              <div v-if="!dynamicInputPorts.length">
                <BaseText size="sm" color="secondary" :italic="true">No dynamic inputs added.</BaseText>
              </div>
              <div v-for="port in dynamicInputPorts" :key="port.name" class="dynamic-port-row">
                <BaseText size="sm">{{ port.label }}</BaseText>
                <BaseButton size="sm" variant="danger" @click="removeDynamicPort(port.name)" :circle="true" class="remove-port-button">
                  <BaseIcon icon="fas fa-trash" size="xs"/>
                </BaseButton>
              </div>
              <BaseButton @click="addDynamicPort('in')" size="sm" variant="secondary" class="add-port-button">
                <BaseIcon icon="fas fa-plus" size="sm"/>
                Add Input
              </BaseButton>
            </BaseStack>
          </div>

          <!-- Outputs Section -->
          <div v-if="workflowStore.selectedNodeDefinition.dynamicPorts.canAdd.out">
            <BaseStack direction="column" gap="sm">
              <BaseText size="sm" weight="bold">Dynamic Outputs</BaseText>
              <div v-if="!dynamicOutputPorts.length">
                <BaseText size="sm" color="secondary" :italic="true">No dynamic outputs added.</BaseText>
              </div>
              <div v-for="port in dynamicOutputPorts" :key="port.name" class="dynamic-port-row">
                <BaseText size="sm">{{ port.label }}</BaseText>
                <BaseButton size="sm" variant="danger" @click="removeDynamicPort(port.name)" :circle="true" class="remove-port-button">
                  <BaseIcon icon="fas fa-trash" size="xs"/>
                </BaseButton>
              </div>
              <BaseButton @click="addDynamicPort('out')" size="sm" variant="secondary" class="add-port-button">
                <BaseIcon icon="fas fa-plus" size="sm"/>
                Add Output
              </BaseButton>
            </BaseStack>
          </div>
        </BaseStack>
      </div>


      <!-- Dynamic Properties Form -->
      <div class="properties-form">
        <div v-if="!workflowStore.selectedNodeDefinition?.properties?.length">
          <BaseText color="gray-400" :italic="true" class="no-properties-text">
            No configurable properties.
          </BaseText>
        </div>

        <BaseStack v-else direction="column" gap="lg">
          <div
            v-for="prop in workflowStore.selectedNodeDefinition.properties.filter(p => p.name !== 'triggerTag')"
            :key="prop.name"
            class="property-item"
          >
            <BaseStack direction="column" gap="sm">
              <label :for="prop.name">
                <BaseText size="sm" weight="bold">{{ prop.label }}</BaseText>
              </label>

              <!-- String Input -->
              <BaseInput
                v-if="prop.type === 'string'"
                :id="prop.name"
                :model-value="workflowStore.selectedNode.propertyValues?.[prop.name]"
                @update:model-value="updatePropertyValue(prop.name, $event)"
              />

              <!-- Textarea Input -->
              <BaseTextarea
                v-if="prop.type === 'textarea'"
                :id="prop.name"
                :model-value="workflowStore.selectedNode.propertyValues?.[prop.name]"
                @update:model-value="updatePropertyValue(prop.name, $event)"
              />

              <!-- Number Input -->
              <BaseInput
                v-if="prop.type === 'number'"
                type="number"
                :id="prop.name"
                :model-value="workflowStore.selectedNode.propertyValues?.[prop.name]"
                @update:model-value="updatePropertyValue(prop.name, Number($event))"
                :min="prop.min"
                :max="prop.max"
                :step="prop.step"
              />

              <!-- Boolean Switch -->
              <BaseSwitch
                v-if="prop.type === 'boolean'"
                :id="prop.name"
                :model-value="workflowStore.selectedNode.propertyValues?.[prop.name]"
                @update:model-value="updatePropertyValue(prop.name, $event)"
              />

              <!-- Select Dropdown -->
              <BaseSelect
                v-if="prop.type === 'select'"
                :id="prop.name"
                :model-value="workflowStore.selectedNode.propertyValues?.[prop.name]"
                @update:model-value="updatePropertyValue(prop.name, $event)"
              >
                <option
                  v-for="option in prop.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>

              <!-- Fallback for unsupported types -->
              <BaseText
                v-if="!['string', 'textarea', 'number', 'boolean', 'select'].includes(prop.type)"
                size="sm"
                color="red-500"
              >
                Unsupported property type: {{ prop.type }}
              </BaseText>

              <BaseText v-if="prop.description" size="xs" color="gray-400" class="property-description">
                {{ prop.description }}
              </BaseText>
            </BaseStack>
          </div>
        </BaseStack>
      </div>
    </BaseBox>
  </div>
</template>

<style scoped>
.config-panel-wrapper {
  height: 100%;
}
.config-panel {
  width: 320px;
  height: 100%;
  border-left: 1px solid var(--color-border-base);
  background-color: var(--c-fill-light);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.dynamic-port-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.panel-title {
  margin: 0;
}

.properties-form {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: var(--sp-2); /* For scrollbar */
}

.dynamic-ports-section {
  padding-top: var(--sp-3);
  padding-bottom: var(--sp-3);
  border-top: 1px solid var(--c-border-light);
  border-bottom: 1px solid var(--c-border-light);
}

.add-port-button {
  margin-top: var(--sp-2);
  gap: var(--sp-2);
}

.remove-port-button {
  width: 24px;
  height: 24px;
}

.property-description {
  margin-top: var(--sp-1);
}

.no-properties-text {
  text-align: center;
  padding-top: var(--sp-8);
}
</style>
