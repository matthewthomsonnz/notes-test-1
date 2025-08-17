<template>
  <div class="notes-list">
    <Draggable v-model="notes" item-key="id" handle=".notes-list__item-handle" :animation="180" ghost-class="notes-list__item--ghost">
      <template #item="{ element, index }">
        <article class="notes-list__item" :data-index="index">
          <span class="notes-list__item-handle" title="Drag to reorder">⋮⋮</span>
          <div class="notes-list__item-content">
            <h2 class="notes-list__item-title">{{ element.title }}</h2>
            <p class="notes-list__item-body">{{ element.body }}</p>
          </div>
        </article>
      </template>
    </Draggable>
    <p class="notes-list__hint">Drag the handle to reorder (order updates in-memory only).</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Draggable from 'vuedraggable';

const notes = ref([
  { id: 1, title: 'Inbox Zero', body: 'Process emails twice a day only.' },
  { id: 2, title: 'Focus Block', body: '90 mins deep work, then short break.' },
  { id: 3, title: 'Meeting Prep', body: 'Clarify agenda & desired outcome.' },
  { id: 4, title: 'Daily Review', body: 'Log 3 wins and 1 improvement.' },
  { id: 5, title: 'Stretch', body: 'Stand & stretch every hour.' }
]);
</script>

<style scoped>
 .notes-list { display: flex; flex-direction: column; gap: .75rem; }
 .notes-list__item { background: #fff; border: 1px solid #d9dde3; border-radius: 6px; padding: .75rem .9rem .75rem 2.25rem; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
 .notes-list__item-title { font-size: .95rem; margin: 0 0 .25rem; line-height:1.2; }
 .notes-list__item-body { margin: 0; font-size: .8rem; color: #444; }
 .notes-list__item-handle { position: absolute; left: .5rem; top: .65rem; cursor: grab; user-select: none; font-size: .9rem; letter-spacing: -2px; color: #666; }
 .notes-list__item-handle:active { cursor: grabbing; }
 .notes-list__item--ghost { opacity: .4; }
 .notes-list__hint { font-size: .65rem; text-transform: uppercase; letter-spacing: .08em; color: #6a717d; margin: .5rem 0 0; }
</style>
