<template>
    <nav class="d-flex flex-column bg-white border-end h-100 sidebar-wrapper">
        <div class="px-4 py-4 mb-2">
            <router-link :to="homeRoute" class="text-decoration-none d-flex align-items-center gap-2">
                <div>
                    <h5 class="fw-bold m-0 text-primary tracking-tight">📖圖書館管理系統</h5>
                </div>
            </router-link>
        </div>

        <div class="flex-grow-1 overflow-y-auto px-3">
            <p class="text-uppercase text-muted fw-bold mb-3 px-3" style="font-size: 0.75rem; letter-spacing: 1px;">
                MAIN MENU
            </p>

            <ul class="nav nav-pills flex-column gap-2 px-2">
                <li class="nav-item" v-if="!isAdmin">
                    <router-link to="/" class="nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-3"
                        active-class="active">
                        <i class="bi bi-search fs-5"></i>
                        <span>館藏檢索</span>
                    </router-link>
                </li>

                <li class="nav-item" v-if="isLoggedIn && !isAdmin">
                    <router-link to="/dashboard" class="nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-3"
                        active-class="active">
                        <i class="bi bi-grid fs-5"></i>
                        <span>會員中心</span>
                    </router-link>
                </li>

                <li class="nav-item" v-if="isAdmin">
                    <router-link to="/admin" class="nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-3"
                        active-class="active">
                        <i class="bi bi-shield-lock fs-5"></i>
                        <span>後台管理</span>
                    </router-link>
                </li>
            </ul>
        </div>

        <div class="p-4 border-top">
            <template v-if="isLoggedIn">
                <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-light user-card">
                    <div class="avatar-circle">
                        {{ username.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                        <div class="fw-bold text-dark">{{ username }}</div>
                        <small class="text-muted">{{ isAdmin ? '管理員' : '一般會員' }}</small>
                    </div>
                </div>

                <button class="btn btn-outline-danger w-100 mt-3 rounded-pill fw-bold" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>登出
                </button>
            </template>

            <template v-else>
                <router-link to="/login" class="btn btn-outline-primary w-100 rounded-pill fw-bold mb-2">
                    登入
                </router-link>
                <router-link to="/register" class="btn btn-primary w-100 rounded-pill fw-bold">
                    註冊
                </router-link>
            </template>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue' // 計算屬性
import { useRouter } from 'vue-router' // 路由

const router = useRouter() // 初始化路由

const isLoggedIn = computed(() => !!localStorage.getItem('token')) // 檢查是否登入
const username = computed(() => localStorage.getItem('username') || 'User') // 取得使用者名稱
const isAdmin = computed(() => localStorage.getItem('role') === 'admin') // 檢查是否為管理員

const homeRoute = computed(() => (isAdmin.value ? '/admin' : '/')) // 根據權限決定首頁

const handleLogout = () => {
    localStorage.removeItem('token') // 移除 token
    localStorage.removeItem('username') // 移除使用者名稱
    localStorage.removeItem('role') // 移除角色
    router.push('/login') // 登出後跳轉到登入頁面
}
</script>

<style scoped>
.sidebar-wrapper {
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
    height: 100vh;
    position: sticky;
    top: 0;
    overflow: hidden;
}

.brand-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
}

.nav-link {
    color: #6c757d;
    transition: all 0.2s;
}

.nav-link:hover {
    background: #f8f9fa;
    color: #224abe;
}

.nav-link.active {
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(78, 115, 223, 0.25);
}

.avatar-circle {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #4e73df;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.user-card {
    transition: background 0.2s;
    cursor: default;
}

.user-card:hover {
    background: #f8f9fa;
}
</style>