<template>
    <div class="login-container d-flex justify-content-center align-items-center">
        <div class="card shadow-lg border-0 rounded-4 p-4" style="width: 400px; background: rgba(255, 255, 255, 0.95);">
            <div class="card-body">
                <div class="text-center mb-4">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style="width: 60px; height: 60px;">
                        <i class="bi bi-person-fill fs-3"></i>
                    </div>
                    <h3 class="fw-bold text-dark">歡迎回來</h3>
                    <p class="text-muted small">請輸入您的帳號密碼以登入</p>
                </div>

                <form @submit.prevent="handleLogin">
                    <div class="form-floating mb-3">
                        <input v-model="username" type="text" class="form-control rounded-3" id="loginUsername"
                            placeholder="帳號" required />
                        <label for="loginUsername">帳號</label>
                    </div>

                    <div class="form-floating mb-4">
                        <input v-model="password" type="password" class="form-control rounded-3" id="loginPassword"
                            placeholder="密碼" required />
                        <label for="loginPassword">密碼</label>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm hover-scale">
                        立即登入
                    </button>
                </form>

                <div class="text-center mt-4">
                    <span class="text-muted">還沒有帳號？</span>
                    <router-link to="/register" class="fw-bold text-decoration-none ms-1">立即註冊</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue' // Vue 3 基礎
import axios from 'axios' // Axios
import { useRouter } from 'vue-router' // Vue Router

const username = ref('') // 使用者帳號
const password = ref('') // 使用者密碼
const router = useRouter() // Router

// 登入
const handleLogin = async () => {
    try {
        const res = await axios.post('http://localhost:3000/api/login', {
            username: username.value,
            password: password.value,
        })

        localStorage.setItem('token', res.data.token) // 儲存 Token
        localStorage.setItem('username', res.data.username || res.data.user?.username || username.value) // 儲存使用者名稱
        localStorage.setItem('role', res.data.role || res.data.user?.role || 'member') // 儲存使用者角色

        alert('登入成功')
        router.push('/') // 跳轉到首頁
    } catch (err) {
        alert(err.response?.data?.message || '登入失敗') // 顯示錯誤訊息
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hover-scale {
    transition: transform 0.2s;
}

.hover-scale:hover {
    transform: translateY(-2px);
}
</style>
