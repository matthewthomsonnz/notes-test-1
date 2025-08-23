<template>
  <div class="notes-list">
    <div class="notes-list__toolbar" aria-label="Notes actions">
      <input
        ref="importInput"
        type="file"
        accept="text/plain,.txt,application/json"
        class="notes-list__import-input"
        hidden
        @change="onImportFile"
      />
  <button type="button" class="notes-list__btn" :disabled="expandedId !== null" @click="addNote">Add Note</button>
  <button type="button" class="notes-list__btn" :disabled="expandedId !== null" @click="triggerImport">Import</button>
      <button type="button" class="notes-list__btn" :disabled="expandedId !== null" @click="exportNotes">Export</button>
    </div>
    <Draggable v-model="notes" item-key="id" :animation="180" ghost-class="notes-list__item--ghost" :disabled="expandedId !== null">
      <template #item="{ element, index }">
        <article
          class="notes-list__item"
          :class="{ 'notes-list__item--expanded': expandedId === element.id }"
          :data-index="index"
          @click="onContainerClick(element.id)"
        >
          <button
            v-if="expandedId !== element.id"
            class="notes-list__item-delete"
            type="button"
            aria-label="Delete note"
            title="Delete note"
            @click.stop="deleteNote(element.id)"
          >🗑</button>
          <button
            v-else
            class="notes-list__item-close"
            type="button"
            aria-label="Close"
            @click.stop="expandedId = null"
          >✕</button>
          <div class="notes-list__item-content">
            <textarea
                v-model="element.title"

              rows="1"
              class="notes-list__item-title"
              @input="autoResize"
              @click.stop="expandedId === element.id ? null : onContainerClick(element.id)"
            ></textarea>
          </div>
        </article>
      </template>
    </Draggable>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Draggable from 'vuedraggable';

const STORAGE_KEY = 'notes-poc-v1';

const notes = ref([
  { id: 1, title: 'Inbox Zero' },
]);

const expandedId = ref(null);
const importInput = ref(null);
let idCounter = 1000;

function onContainerClick(id) {
  if (expandedId.value == null) {
    expandedId.value = id;
    queueMicrotask(() => {
      const textarea = document.querySelector('.notes-list__item--expanded .notes-list__item-title');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    })
  }
}

function handleKey(e) {
  if (e.key === 'Escape' && expandedId.value !== null) {
    expandedId.value = null;
  }
}

function exportNotes() {
  try {
    const data = JSON.stringify(notes.value, null, 2);
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:T]/g,'-').split('.')[0];
    a.href = url;
    a.download = `notes-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export failed', err);
  }
}

function triggerImport() {
  if (importInput.value) importInput.value.value = '';
  importInput.value?.click();
}

function onImportFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = reader.result;
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
          notes.value = parsed;
      }
    } catch (err) {
      console.error('Import failed', err);
    }
  };
  reader.readAsText(file);
}

function addNote() {
  const id = ++idCounter;
  notes.value.unshift({ id, title: 'New Note' });
  expandedId.value = id;
  queueMicrotask(() => {
    const el = document.querySelector('.notes-list__item--expanded .notes-list__item-title');
    if (el) el.focus();
  });
}

function deleteNote(id) {
  const idx = notes.value.findIndex(n => n.id === id);
  if (idx !== -1) {
    notes.value.splice(idx, 1);
    if (expandedId.value === id) expandedId.value = null;
  }
}

function autoResize(e) {
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        notes.value = parsed;
        const maxId = parsed.reduce((m, n) => typeof n.id === 'number' && n.id > m ? n.id : m, 0);
        if (maxId > idCounter) idCounter = maxId;
      }
    }
  } catch (e) {
    console.warn('Failed to load from storage', e);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value));
  } catch (e) {
    console.warn('Failed to save notes', e);
  }
}

let saveTimer = null;
watch(notes, () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveToStorage, 250);
}, { deep: true });

function handleBeforeUnload() {
  saveToStorage();
}

onMounted(() => {
  loadFromStorage();
  window.addEventListener('keydown', handleKey);
  window.addEventListener('beforeunload', handleBeforeUnload);

  queueMicrotask(() => {
    const textareas = document.querySelectorAll('.notes-list__item-title');
    textareas.forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  });
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey);
  window.removeEventListener('beforeunload', handleBeforeUnload);
  clearTimeout(saveTimer);
});
</script>

<style scoped>
 .notes-list { display: flex; flex-direction: column; gap: .75rem; }
 .notes-list__toolbar { position: relative; display: flex; justify-content: flex-end; gap: .5rem; margin-bottom: .25rem; }
 .notes-list__btn { background:#eef1f5; border:1px solid #d0d5dc; padding:.4rem .7rem; font-size:.65rem; letter-spacing:.08em; text-transform: uppercase; border-radius:4px; cursor:pointer; color:#2f3945; }
 .notes-list__btn:hover { background:#e2e7ed; }
 .notes-list__btn:active { transform: translateY(1px); }
 .notes-list__btn:disabled { opacity:.45; cursor: not-allowed; }
 .notes-list__import-input { display:none; }
 .notes-list__item { background: #fff; border: 1px solid #d9dde3; border-radius: 6px; padding: .75rem .9rem .75rem 2.25rem; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
 .notes-list__item-title { font-size: .95rem;
   border: none;
   width: 100%;
   outline: none;
   resize:none;
   line-height:1.2; }


  .notes-list__item-delete:hover { background:#ffecec; }
  .notes-list__item-delete:active { transform:translateY(1px); }
  .notes-list__item--expanded { position: fixed; inset: 0; z-index: 999; margin: 0; border-radius: 0; padding: 3.25rem 3rem 2.5rem 3rem; box-shadow: none; overflow:auto; }
  .notes-list__item-close { position: absolute; top: .9rem; right: 1rem; background: #1e1f26; color: #fff; border: none; font: inherit; font-size: .85rem; line-height:1; padding:.45rem .55rem; border-radius: 4px; cursor: pointer; }
  .notes-list__item-close:hover { background: #2c2e37; }
  .notes-list__item-close:active { transform: translateY(1px); }
</style>
