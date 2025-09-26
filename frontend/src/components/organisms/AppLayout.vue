<template>
  <div class="app-layout">
    <slot name="topbar"></slot>
    <slot name="sidebar"></slot>
    <aside class="panel-content">
      <slot name="panel"></slot>
    </aside>
    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'topbar topbar topbar'
    'sidebar panel content';
  height: 100vh;
  width: 100vw;
  background-color: var(--color-bg-base);
  color: var(--color-text-base);
}

.panel-content {
  grid-area: panel;
  overflow: hidden;
  background-color: var(--c-background-soft);
  /* Optional: Add a border to visually separate the panel */
  /* border-right: 1px solid var(--c-border-base); */
}

.main-content {
  grid-area: content;
  overflow: hidden; /* Prevents scrollbars on the main layout */
}
</style>
