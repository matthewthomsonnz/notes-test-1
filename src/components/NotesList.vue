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
  <button type="button" class="notes-list__btn" @click="triggerImport">Import</button>
      <button type="button" class="notes-list__btn" @click="exportNotes">Export</button>
    </div>

    <!-- Add note button at the top -->
    <div class="notes-list__add-button-container">
      <button
        type="button"
        class="notes-list__add-btn"
        @click="addNoteAtPosition(0)"
        title="Add note here"
      >
        + Add Note
      </button>
    </div>

    <Draggable
      v-model="notes"
      item-key="id"
      :animation="180"
      ghost-class="notes-list__item--ghost"
    >
      <template #item="{ element, index }">
        <div>
          <article
            class="notes-list__item"
            :data-index="index"
          >
            <button
              class="notes-list__item-delete"
              type="button"
              aria-label="Delete note"
              title="Delete note"
              @click.stop="deleteNote(element.id)"
            >🗑</button>
            <div class="notes-list__item-content">
              <textarea
                v-model="element.title"
                rows="1"
                class="notes-list__item-title"
                @input="autoResize"
                @paste="handlePaste"
                @touchstart="handleTouchStart"
                :data-note-id="element.id"
              ></textarea>
              <TodoList
                v-model="element.todos"
                @click.stop
              />
            </div>
          </article>

          <!-- Add note button after each item -->
          <div class="notes-list__add-button-container">
            <button
              type="button"
              class="notes-list__add-btn"
              @click="addNoteAtPosition(index + 1)"
              title="Add note here"
            >
              + Add Note
            </button>
          </div>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import Draggable from 'vuedraggable';
import TodoList from './TodoList.vue';

const STORAGE_KEY = 'notes-poc-v1';

const notes = ref([
  { id: 1, title: 'Inbox Zero', todos: [] },
]);

const importInput = ref(null);
let idCounter = 1000;

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
  notes.value.unshift({ id, title: '', todos: [] });
  // Focus the new note's textarea after DOM update
  nextTick(() => {
    const firstTextarea = document.querySelector('.notes-list__item-title');
    if (firstTextarea) {
      firstTextarea.focus();
    }
  });
}

function addNoteAtPosition(position) {
  const id = ++idCounter;
  notes.value.splice(position, 0, { id, title: '', todos: [] });
  // Focus the new note's textarea after DOM update
  nextTick(() => {
    const textareas = document.querySelectorAll('.notes-list__item-title');
    if (textareas[position]) {
      textareas[position].focus();
    }
  });
}

function deleteNote(id) {
  const idx = notes.value.findIndex(n => n.id === id);
  if (idx !== -1) {
    notes.value.splice(idx, 1);
  }
}

function autoResize(e) {
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function handlePaste(e) {
  // Allow default paste behavior but ensure proper mobile handling
  setTimeout(() => {
    autoResize(e);
  }, 0);
}

function handleTouchStart(e) {
  // Ensure the input is properly focused on mobile
  const target = e.target;
  if (target && typeof target.focus === 'function') {
    target.focus();
  }
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
  window.removeEventListener('beforeunload', handleBeforeUnload);
  clearTimeout(saveTimer);
});
</script>

<style scoped>
 .notes-list { display: flex; flex-direction: column; gap: .75rem; }
 .notes-list__btn { background:#eef1f5; border:1px solid #d0d5dc; padding:.4rem .7rem; font-size:.65rem; letter-spacing:.08em; text-transform: uppercase; border-radius:4px; cursor:pointer; color:#2f3945; }
 .notes-list__btn:hover { background:#e2e7ed; }
 .notes-list__btn:active { transform: translateY(1px); }
 .notes-list__btn:disabled { opacity:.45; cursor: not-allowed; }
 .notes-list__import-input { display:none; }
 .notes-list__item { background: #fff; border: 1px solid #d9dde3; border-radius: 6px; padding: 8px; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
 .notes-list__item-title {
   font-size: .95rem;
   border: none;
   width: 100%;
   outline: none;
   resize: none;
   line-height: 1.2;
   -webkit-user-select: text;
   user-select: text;
   touch-action: manipulation;
   -webkit-touch-callout: default;
 }
 .notes-list__item-handle { position: absolute; left: .5rem; top: .65rem; cursor: grab; user-select: none; font-size: .9rem; letter-spacing: -2px; color: #666; }
 .notes-list__item-handle:active { cursor: grabbing; }
 .notes-list__item-delete { position:absolute; top:.45rem; right:.45rem; background:transparent; border:none; cursor:pointer; font-size:.9rem; line-height:1; color:#b23a3a; padding:.25rem; border-radius:4px; }
  .notes-list__item-delete:hover { background:#ffecec; }
  .notes-list__item-delete:active { transform:translateY(1px); }
 .notes-list__add-button-container { display: flex; justify-content: center; margin: .5rem 0; }
 .notes-list__add-btn {
   background: #e1f5fe;
   border: 1px solid #b2ebf2;
   padding: .4rem .7rem;
   font-size: .65rem;
   letter-spacing: .08em;
   text-transform: uppercase;
   border-radius: 4px;
   cursor: pointer;
   color: #01579b;
   transition: background 0.3s, transform 0.3s;
 }
 .notes-list__add-btn:hover { background: #b2ebf2; }
 .notes-list__add-btn:active { transform: translateY(1px); }
</style>
