<template>
    <div class="container-fluid pb-4 page-wrap dashboard-page">
        <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 bg-white p-4 rounded-4 shadow-sm border w-100">
            <div class="d-flex align-items-center mb-3 mb-md-0">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                    style="width: 60px; height: 60px; font-size: 1.5rem;">
                    {{ username.charAt(0).toUpperCase() }}
                </div>
                <div>
                    <h2 class="h4 fw-bold mb-0">早安，{{ username }}</h2>
                    <p class="text-muted mb-0 small">歡迎回到您的個人圖書館</p>
                    <div class="small mt-1">
                        <span class="badge bg-light text-dark border rounded-pill px-3 py-2">
                            未繳罰款：NT$ {{ status.fines }}
                        </span>
                        <span class="badge bg-light text-dark border rounded-pill px-3 py-2 ms-2">
                            預約中：{{ status.reservations.length }}
                        </span>
                    </div>
                </div>
            </div>

            <button @click="handleLogout" class="btn btn-light text-danger border rounded-pill px-4 fw-bold">
                <i class="bi bi-box-arrow-right me-2"></i>登出系統
            </button>
        </div>

        <!--借閱中 / 已歸還 / 逾期 -->
        <div class="row g-4 mb-5 w-100 mx-0">
            <div class="col-md-4">
                <div
                    class="card border-0 bg-primary text-white shadow rounded-4 p-3 h-100 overflow-hidden position-relative">
                    <div class="card-body position-relative z-1">
                        <div class="display-5 fw-bold mb-1">{{ status.borrowing.length }}</div>
                        <div class="opacity-75">當前借閱（未逾期）</div>
                    </div>
                    <i class="bi bi-book position-absolute bottom-0 end-0 p-3"
                        style="font-size: 5rem; opacity: 0.2; transform: rotate(-10deg);"></i>
                </div>
            </div>

            <div class="col-md-4">
                <div
                    class="card border-0 bg-warning text-dark shadow rounded-4 p-3 h-100 overflow-hidden position-relative">
                    <div class="card-body position-relative z-1">
                        <div class="display-5 fw-bold mb-1">{{ status.returned.length }}</div>
                        <div class="opacity-75">已歸還</div>
                    </div>
                    <i class="bi bi-check2-circle position-absolute bottom-0 end-0 p-3"
                        style="font-size: 5rem; opacity: 0.2; transform: rotate(-10deg);"></i>
                </div>
            </div>

            <div class="col-md-4">
                <div
                    class="card border-0 bg-danger text-white shadow rounded-4 p-3 h-100 overflow-hidden position-relative">
                    <div class="card-body position-relative z-1">
                        <div class="display-5 fw-bold mb-1">{{ status.overdue.length }}</div>
                        <div class="opacity-75">逾期</div>
                    </div>
                    <i class="bi bi-exclamation-triangle position-absolute bottom-0 end-0 p-3"
                        style="font-size: 5rem; opacity: 0.2; transform: rotate(-10deg);"></i>
                </div>
            </div>
        </div>

        <div class="row g-4 w-100 mx-0">
            <!-- 借閱中 -->
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0">借閱中（未逾期）</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">{{ status.borrowing.length }}</span>
                        </div>

                        <div v-if="status.borrowing.length > 0" class="list-group list-group-flush">
                            <div v-for="item in status.borrowing" :key="item.loanId"
                                class="list-group-item py-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold">{{ item.title }}</div>
                                    <small class="text-muted">到期日：{{ item.dueDate }}</small>
                                </div>
                                <div class="d-flex align-items-center gap-2">
                                    <button class="btn btn-sm rounded-pill px-3" :class="getRenewBtnClass(item)"
                                        :disabled="!canRenew(item) || renewingId === item.loanId"
                                        @click="handleRenew(item.loanId)">
                                        <span v-if="renewingId === item.loanId"
                                            class="spinner-border spinner-border-sm me-1"></span>
                                        {{ getRenewBtnText(item) }}
                                    </button>
                                    <span class="badge bg-success rounded-pill px-3 py-2">借閱中</span>
                                </div>
                            </div>
                        </div>

                        <div v-else class="text-center py-5 text-muted">
                            <i class="bi bi-inbox display-5"></i>
                            <p class="mb-0 mt-2">目前沒有借閱中的書籍</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 逾期 -->
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0">逾期提醒</h5>
                            <span class="badge bg-danger rounded-pill px-3 py-2">{{ status.overdue.length }}</span>
                        </div>

                        <div v-if="status.overdue.length > 0" class="list-group list-group-flush">
                            <div v-for="item in status.overdue" :key="item.loanId"
                                class="list-group-item py-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold">{{ item.title }}</div>
                                    <small class="text-muted">逾期天數：{{ item.overdueDays }}</small>
                                </div>
                                <span class="badge bg-danger rounded-pill px-3 py-2">逾期</span>
                            </div>
                        </div>

                        <div v-else class="text-center py-5 text-muted">
                            <i class="bi bi-emoji-smile display-5"></i>
                            <p class="mb-0 mt-2">目前沒有逾期書籍</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 預約中 -->
            <div class="col-12">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0">預約中</h5>
                            <span class="badge bg-dark rounded-pill px-3 py-2">{{ status.reservations.length }}</span>
                        </div>

                        <div v-if="status.reservations.length > 0" class="list-group list-group-flush">
                            <div v-for="r in status.reservations" :key="r.reservationId"
                                class="list-group-item py-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold">{{ r.title }}</div>
                                    <small class="text-muted">預約日期：{{ r.reserveDate }}</small>
                                </div>

                                <div class="d-flex align-items-center gap-2">
                                    <span class="badge bg-secondary rounded-pill px-3 py-2">等待中</span>
                                    <button class="btn btn-outline-danger btn-sm rounded-pill px-3"
                                        :disabled="cancelingId === r.reservationId"
                                        @click="cancelReservation(r.reservationId)">
                                        {{ cancelingId === r.reservationId ? '取消中...' : '取消預約' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div v-else class="text-center py-5 text-muted">
                            <i class="bi bi-calendar-x display-5"></i>
                            <p class="mb-0 mt-2">目前沒有預約中的書籍</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 已歸還（最近 50 筆） -->
            <div class="col-12">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0">已歸還（最近 50 筆）</h5>
                            <span class="badge bg-warning text-dark rounded-pill px-3 py-2">{{ status.returned.length
                                }}</span>
                        </div>

                        <div v-if="status.returned.length > 0" class="list-group list-group-flush">
                            <div v-for="it in status.returned" :key="it.loanId"
                                class="list-group-item py-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold">{{ it.title }}</div>
                                    <small class="text-muted">歸還日：{{ it.returnDate }}</small>
                                </div>
                                <span class="badge bg-warning text-dark rounded-pill px-3 py-2">已歸還</span>
                            </div>
                        </div>

                        <div v-else class="text-center py-5 text-muted">
                            <i class="bi bi-clock-history display-5"></i>
                            <p class="mb-0 mt-2">目前沒有歸還紀錄</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue' // 引入 Vue 3 基礎
import { useRouter } from 'vue-router' // 引入 Vue Router
import axios from 'axios' // 引入 Axios

const router = useRouter()
const username = ref(localStorage.getItem('username') || 'User') // 使用者名稱

// 狀態
const status = ref({
    borrowing: [],
    overdue: [],
    returned: [],
    reservations: [],
    fines: 0
})

const cancelingId = ref(null) // 取消預約
const renewingId = ref(null) // 續借

// 用 timestamp 當「狀態版本號」
const STATUS_LS_KEY = 'accountStatusUpdatedAt'
let lastSeenTs = Number(localStorage.getItem(STATUS_LS_KEY) || 0)

// 取得狀態
const fetchStatus = async () => {
    try {
        const token = localStorage.getItem('token')
        if (!token) return router.push('/login')

        const res = await axios.get('http://localhost:3000/api/loans/status', {
            headers: { Authorization: `Bearer ${token}` }
        })
        status.value = res.data
    } catch (err) {
        console.error(err)
        alert(err?.response?.data?.message || '取得會員狀態失敗（可能 token 過期 / API 路徑錯誤）')
    }
}

// 每次進到此頁都檢查 timestamp，有變就重新抓資料（保證「借閱後跳回來」一定更新）
const refreshIfNeeded = async () => {
    const ts = Number(localStorage.getItem(STATUS_LS_KEY) || 0)
    if (ts !== lastSeenTs) {
        lastSeenTs = ts
        await fetchStatus()
    }
}

// 取消預約
const cancelReservation = async (reservationId) => {
    try {
        const token = localStorage.getItem('token')
        if (!token) return router.push('/login')

        cancelingId.value = reservationId

        await axios.delete(`http://localhost:3000/api/reservations/${reservationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        // 更新版本號 + 立刻刷新
        localStorage.setItem(STATUS_LS_KEY, Date.now().toString())
        lastSeenTs = Number(localStorage.getItem(STATUS_LS_KEY) || 0)
        await fetchStatus()
    } catch (err) {
        console.error(err)
        alert(err?.response?.data?.message || '取消預約失敗')
    } finally {
        cancelingId.value = null
    }
}

// 異動借閱狀態
const canRenew = (item) => {
    return item.renewCount < 2 && item.reservationCount === 0
}

// 異動借閱按鈕文字
const getRenewBtnText = (item) => {
    if (renewingId.value === item.loanId) return '續借中...'
    if (item.renewCount >= 2) return '已達續借上限'
    if (item.reservationCount > 0) return '有人預約，無法續借'
    return '續借'
}

// 異動借閱按鈕樣式
const getRenewBtnClass = (item) => {
    if (item.renewCount >= 2 || item.reservationCount > 0) return 'btn-secondary opacity-50'
    return 'btn-outline-primary'
}

// 異動借閱按鈕按鈕
const handleRenew = async (loanId) => {
    try {
        const token = localStorage.getItem('token')
        if (!token) return router.push('/login')

        renewingId.value = loanId
        await axios.post(`http://localhost:3000/api/user/renew/${loanId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })

        alert('續借成功！')

        // 更新版本號 + 立刻刷新
        localStorage.setItem(STATUS_LS_KEY, Date.now().toString())
        lastSeenTs = Number(localStorage.getItem(STATUS_LS_KEY) || 0)
        await fetchStatus()
    } catch (err) {
        console.error(err)
        alert(err?.response?.data?.message || '續借失敗')
    } finally {
        renewingId.value = null
    }
}

// 登出
const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    router.push('/login')
}

// 挂載時
onMounted(async () => {
    await fetchStatus()
    await refreshIfNeeded()
})

onActivated(async () => {
    // keep-alive 回到頁面也一定檢查一次
    await refreshIfNeeded()
})
</script>

<style scoped>
.dashboard-page {
    width: 100%;
}

.transition-all {
    transition: all 0.3s ease;
}

.btn-white {
    background-color: #fff;
    border-color: transparent;
}

.btn-white:hover {
    background-color: #f8f9fa;
}
</style>
