<template>
  <div class="app-container">
    <Navbar v-if="!isAuthPage" class="sidebar-container" />

    <main :class="['main-content', { 'full-screen': isAuthPage }]">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue' // 引入 Navbar
import { computed } from 'vue' // 引入 computed
import { useRoute } from 'vue-router' // 引入 useRoute

const route = useRoute() // 使用 useRoute

// 判斷是否為登入或註冊頁面 (這些頁面不需要側邊欄)
const isAuthPage = computed(() => {
  return ['/login', '/register'].includes(route.path)
})
</script>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f3f6f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
}

.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
}

.sidebar-container {
  flex-shrink: 0;
  width: 260px;
  height: 100%;
  z-index: 1000;
}

.main-content {
  flex-grow: 1;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem;
}

.full-screen {
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

.page-wrap {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .sidebar-container {
    width: 220px;
  }
}

.main-content::-webkit-scrollbar {
  width: 10px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>