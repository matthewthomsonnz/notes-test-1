<template>
  <div class="todo-list">
    <div class="todo-list__toolbar">
      <button type="button" class="todo-list__btn" @click="addTodo">Add Todo</button>
    </div>
    <div class="todo-list__items">
      <div
        v-for="todo in todos"
        :key="todo.id"
        class="todo-list__item"
      >
        <input
          type="checkbox"
          :checked="todo.completed"
          class="todo-list__checkbox"
          @change="toggleTodo(todo.id)"
        >
        <input
          :value="todo.text"
          class="todo-list__input"
          placeholder="Todo item..."
          @input="updateTodoText(todo.id, $event.target.value)"
          @paste="handlePaste"
          @touchstart="handleTouchStart"
        >
        <button
          type="button"
          class="todo-list__delete"
          @click="deleteTodo(todo.id)"
        >×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const todos = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
});

let idCounter = 1000;

function addTodo() {
  const id = ++idCounter;
  const newTodos = [...todos.value, {
    id,
    text: '',
    completed: false
  }];
  todos.value = newTodos;
}

function toggleTodo(id) {
  const newTodos = todos.value.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  todos.value = newTodos;
}

function deleteTodo(id) {
  const newTodos = todos.value.filter(todo => todo.id !== id);
  todos.value = newTodos;
}

function updateTodoText(id, text) {
  const newTodos = todos.value.map(todo =>
    todo.id === id ? { ...todo, text } : todo
  );
  todos.value = newTodos;
}

function handlePaste(event) {
  // Ensure paste works properly on mobile
  setTimeout(() => {
    // Allow the paste to complete and trigger any necessary updates
    event.target.dispatchEvent(new Event('input', { bubbles: true }));
  }, 0);
}

function handleTouchStart(event) {
  // Ensure the input is properly focused on mobile
  const target = event.target;
  if (target && typeof target.focus === 'function') {
    target.focus();
  }
}
</script>

<style scoped>
.todo-list {
  margin-top: 1rem;
}

.todo-list__toolbar {
  margin-bottom: 0.5rem;
}

.todo-list__btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 3px;
  cursor: pointer;
}

.todo-list__btn:hover {
  background: #eee;
}

.todo-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-list__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.todo-list__checkbox {
  flex-shrink: 0;
}

.todo-list__input {
  flex: 1;
  border: 1px solid #ddd;
  padding: 0.25rem;
  border-radius: 3px;
  font-size: 0.875rem;
  -webkit-user-select: text;
  user-select: text;
  touch-action: manipulation;
  -webkit-touch-callout: default;
}

.todo-list__delete {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  border-radius: 3px;
}

.todo-list__delete:hover {
  background: #ffecec;
  color: #b23a3a;
}
</style>
