<template>
  <main class="wrap">
    <div v-if="showInstallPrompt" class="install-banner">
      <span>Install Notes App for a better experience</span>
      <button class="install-btn" @click="installApp">Install</button>
      <button class="dismiss-btn" @click="dismissInstall">×</button>
    </div>
    <h1>Notes (Proof of Concept)</h1>
    <NotesList />
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import NotesList from './components/NotesList.vue';

const deferredPrompt = ref(null);
const showInstallPrompt = ref(false);

function handleBeforeInstallPrompt(e) {
  e.preventDefault();
  deferredPrompt.value = e;
  showInstallPrompt.value = true;
}

function installApp() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    deferredPrompt.value.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      deferredPrompt.value = null;
      showInstallPrompt.value = false;
    });
  }
}

function dismissInstall() {
  showInstallPrompt.value = false;
  deferredPrompt.value = null;
}

function handleAppInstalled() {
  console.log('App was installed');
  showInstallPrompt.value = false;
  deferredPrompt.value = null;
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<style>
main { max-width: 640px; margin: 0 auto; }
.install-banner {
  background: #2f3945;
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.install-btn {
  background: #4a93ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}
.install-btn:hover {
  background: #3a83ef;
}
.dismiss-btn {
  background: transparent;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  border-radius: 4px;
}
.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
