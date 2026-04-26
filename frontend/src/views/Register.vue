<template>
    <div class="register-container d-flex justify-content-center align-items-center">
        <div class="card shadow-lg border-0 rounded-4 p-4" style="width: 400px; background: rgba(255, 255, 255, 0.95);">
            <div class="card-body">
                <div class="text-center mb-4">
                    <div class="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style="width: 60px; height: 60px;">
                        <i class="bi bi-person-plus-fill fs-3"></i>
                    </div>
                    <h3 class="fw-bold text-dark">加入我們</h3>
                    <p class="text-muted small">建立您的圖書館帳戶</p>
                </div>

                <form @submit.prevent="handleRegister">
                    <div class="form-floating mb-3">
                        <input v-model="username" type="text" class="form-control rounded-3" id="registerUsername"
                            placeholder="帳號" required />
                        <label for="registerUsername">設定帳號</label>
                    </div>

                    <div class="form-floating mb-3">
                        <input v-model="email" type="email" class="form-control rounded-3" id="registerEmail"
                            placeholder="信箱" />
                        <label for="registerEmail">信箱 (選填)</label>
                    </div>

                    <div class="form-floating mb-4">
                        <input v-model="password" type="password" class="form-control rounded-3" id="registerPassword"
                            placeholder="密碼" required />
                        <label for="registerPassword">設定密碼</label>
                    </div>

                    <button type="submit" class="btn btn-success w-100 rounded-pill py-3 fw-bold shadow-sm hover-scale">
                        立即註冊
                    </button>
                </form>

                <div class="text-center mt-4">
                    <span class="text-muted">已有帳號？</span>
                    <router-link to="/login" class="fw-bold text-decoration-none ms-1 text-success">前往登入</router-link>
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
const email = ref('') // 使用者信箱
const router = useRouter() // Router

// 註冊
const handleRegister = async () => {
    try {
        await axios.post('http://localhost:3000/api/register', {
            username: username.value,
            password: password.value,
            email: email.value,
            role: 'member'
        })

        alert('註冊成功，請登入')
        router.push('/login') // 跳轉到登入頁面
    } catch (err) {
        alert(err.response?.data?.message || '註冊失敗') // 顯示錯誤訊息
    }
}
</script>

<style scoped>
.register-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #e0eaec 0%, #4ca1af 100%);
}

.hover-scale {
    transition: transform 0.2s;
}

.hover-scale:hover {
    transform: translateY(-2px);
}
</style>
