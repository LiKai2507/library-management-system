import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    {
        path: '/book/:id',
        name: 'BookDetail',
        component: () => import('../views/BookDetail.vue')
    },
    // 會員中心路由
    {
        path: '/dashboard',
        name: 'UserDashboard',
        component: () => import('../views/UserDashboard.vue'),
        meta: { requiresAuth: true } // 需要登入
    },
    // [新增] 管理員後台路由
    {
        path: '/admin',
        name: 'AdminPanel',
        component: () => import('../views/AdminPanel.vue'),
        meta: { requiresAuth: true, requiresAdmin: true } // 需要登入且必須是管理員
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由導航守衛
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // [新增] 取得儲存的角色

    if (role === 'admin' && (to.path === '/' || to.path === '/dashboard' || to.path.startsWith('/book/'))) {
        return next('/admin');
    }

    // 1. 檢查是否需要登入 (requiresAuth)
    if (to.meta.requiresAuth && !token) {
        alert('此功能僅限會員使用，請先登入');
        return next('/login');
    }

    // 2. [新增] 檢查是否需要管理員權限 (requiresAdmin)
    if (to.meta.requiresAdmin && role !== 'admin') {
        alert('權限不足，此頁面僅限管理員進入');
        return next('/'); // 沒權限就踢回首頁
    }

    // 3. 如果使用者已登入，防止重複去登入/註冊頁面
    if ((to.path === '/login' || to.path === '/register') && token) {
        return next(role === 'admin' ? '/admin' : '/');
    }

    // 4. 其他情況放行
    next();
});

export default router;
