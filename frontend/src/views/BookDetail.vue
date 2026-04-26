<template>
  <div class="container py-5 page-wrap detail-page" style="min-height: 80vh;">
    <div v-if="book" class="card border-0 shadow-lg rounded-4 overflow-hidden" style="min-height: 500px;">
      <div class="row g-0 h-100">
        <div
          class="col-lg-5 bg-light d-flex flex-column align-items-center justify-content-center p-5 position-relative">
          <div class="book-shadow-wrapper mb-4">
            <i class="bi bi-book-half text-secondary" style="font-size: 8rem; opacity: 0.3;"></i>
          </div>
          <div class="badge bg-dark text-white rounded-pill px-3 py-2 shadow-sm position-absolute top-0 start-0 m-4">
            ISBN: {{ book.isbn }}
          </div>
        </div>

        <div class="col-lg-7 bg-white">
          <div class="card-body p-lg-5 d-flex flex-column h-100">
            <!-- alerts -->
            <div v-if="successMsg"
              class="alert alert-success rounded-4 d-flex justify-content-between align-items-center">
              <div><i class="bi bi-check-circle me-2"></i>{{ successMsg }}</div>
              <button class="btn btn-sm btn-outline-success rounded-pill" @click="successMsg = ''">關閉</button>
            </div>

            <div v-if="errorMsg" class="alert alert-danger rounded-4 d-flex justify-content-between align-items-center">
              <div><i class="bi bi-x-circle me-2"></i>{{ errorMsg }}</div>
              <button class="btn btn-sm btn-outline-danger rounded-pill" @click="errorMsg = ''">關閉</button>
            </div>

            <div>
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 class="display-5 fw-bold text-dark mb-2">{{ book.title }}</h1>
                  <h4 class="text-secondary fw-light mb-4">
                    {{ book.author }} <span class="fs-6 text-muted">著</span>
                  </h4>
                </div>

                <span :class="book.status === 'available' ? 'bg-success' : 'bg-danger'"
                  class="badge rounded-pill px-3 py-2 shadow-sm">
                  {{ book.status === 'available' ? '可借閱' : '已借出' }}
                </span>
              </div>

              <div class="p-4 bg-light rounded-4 mb-4">
                <h6 class="fw-bold text-uppercase text-muted small mb-3">書籍簡介</h6>
                <p class="card-text text-secondary lh-lg mb-0">
                  這是一本關於 《{{ book.title }}》 的精選館藏。內容豐富，適合讀者深入研究。歡迎借閱或預約。
                </p>
              </div>

              <!-- 預約資訊（只要已借出就顯示） -->
              <div v-if="book.status !== 'available'" class="mb-3">
                <span class="badge bg-light text-dark border rounded-pill px-3 py-2">
                  預約排隊：{{ book.waitingCount ?? 0 }}
                </span>
                <span v-if="book.myWaitingReservation" class="badge bg-warning text-dark rounded-pill px-3 py-2 ms-2">
                  你已預約
                </span>
              </div>

              <!-- 額外提示：正在自動刷新 -->
              <div v-if="autoRefreshing" class="text-muted small">
                <i class="bi bi-arrow-repeat me-1"></i>偵測到狀態可能變更，正在自動刷新...
              </div>
            </div>

            <!-- 底部按鈕區 -->
            <div class="mt-5 d-flex align-items-center gap-3 flex-wrap pt-4 border-top">
              <!-- 返回 -->
              <button class="btn btn-light rounded-pill px-4 fw-bold" @click="router.back()">
                <i class="bi bi-arrow-left me-2"></i>返回
              </button>

              <!-- 如果是你自己借閱中 -->
              <button v-if="book.myBorrowing" class="btn btn-outline-primary rounded-pill px-4 fw-bold" disabled>
                <i class="bi bi-bookmark-check me-2"></i>你已借閱
                <span v-if="book.myDueDate" class="ms-2 small text-muted">
                  到期：{{ String(book.myDueDate).slice(0, 10) }}
                </span>
              </button>

              <!-- 操作區 (已登入) -->
              <div v-if="isLoggedIn" class="d-flex gap-3">
                <button v-if="book.status === 'available'" class="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                  @click="handleBorrow" :disabled="borrowing">
                  <i class="bi bi-book me-2"></i>我要借閱
                </button>

                <button v-else-if="book.canReserve"
                  class="btn btn-warning text-dark rounded-pill px-5 fw-bold shadow-sm" @click="handleReserve"
                  :disabled="reserving">
                  <i class="bi bi-calendar-check me-2"></i>預約候補
                </button>

                <button v-else class="btn btn-secondary rounded-pill px-5 fw-bold disabled" disabled>
                  <span v-if="book.myBorrowing">借閱中</span>
                  <span v-else-if="book.myWaitingReservation">已預約</span>
                  <span v-else>暫無法借閱</span>
                </button>

                <button v-if="book.myWaitingReservation" class="btn btn-outline-danger rounded-pill px-4 fw-bold"
                  @click="handleCancelReservation" :disabled="canceling">
                  取消預約
                </button>
              </div>

              <!-- 未登入提示 -->
              <div v-else class="d-flex align-items-center gap-3">
                <span class="text-muted"><i class="bi bi-lock-fill"></i> 請先登入</span>
                <router-link to="/login" class="btn btn-primary rounded-pill px-4 fw-bold">登入</router-link>
              </div>

              <!-- 會員中心 -->
              <button class="btn btn-light border rounded-pill px-4 fw-bold" @click="router.push('/dashboard')">
                會員中心
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <div v-if="errorMsg" class="alert alert-danger mx-auto" style="max-width: 500px;">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMsg }}
        <div class="mt-3">
          <button class="btn btn-outline-danger btn-sm" @click="$router.back()">返回上一頁</button>
        </div>
      </div>
      <div v-else>
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-3">載入中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue' // Vue
import { useRoute, useRouter } from 'vue-router' // Vue Router
import axios from 'axios' // Axios

const route = useRoute() // 當前路由
const router = useRouter() // 路由器

const book = ref(null) // 書籍
const borrowing = ref(false) // 借閱中
const reserving = ref(false) // 預約中
const canceling = ref(false) // 取消預約中
const successMsg = ref('') // 成功訊息
const errorMsg = ref('') // 錯誤訊息

// 自動刷新狀態用
const autoRefreshing = ref(false)
let pollTimer = null

const STATUS_EVENT_NAME = 'account-status-updated' // 事件名稱
const STATUS_LS_KEY = 'accountStatusUpdatedAt' // localStorage key

const isLoggedIn = computed(() => !!localStorage.getItem('token')) // 是否已登入

// 取得 Authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 通知狀態已更新
const notifyStatusUpdated = () => {
  // 同頁/同分頁：用事件通知
  window.dispatchEvent(new Event(STATUS_EVENT_NAME))
  // 跨頁/跨分頁：用 storage 通知
  localStorage.setItem(STATUS_LS_KEY, Date.now().toString())
}

// 停止自動刷新
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  autoRefreshing.value = false
}

// 開始自動刷新
const startPollingIfNeeded = () => {
  if (!book.value) return // 沒有書籍資料

  if (book.value.status === 'available') return stopPolling() // 未借閱

  if (!isLoggedIn.value) return stopPolling() // 未登入

  if (pollTimer) return
  autoRefreshing.value = true // 開始自動刷新

  // 每 3 秒刷新一次
  pollTimer = setInterval(async () => {
    await fetchBook(false)
    if (book.value?.status === 'available') stopPolling()
  }, 3000)
}

// 取得書籍資料
const fetchBook = async (forceClearMsg = false) => {
  if (forceClearMsg) {
    successMsg.value = ''
    errorMsg.value = ''
  }

  try {
    const headers = getAuthHeader() // 取得 Authorization header
    const res = await axios.get(`http://localhost:3000/api/books/${route.params.id}`, { headers }) // 取得書籍資料
    book.value = res.data // 更新書籍資料
    startPollingIfNeeded() // 開始自動刷新
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.response?.data?.message || '載入書籍失敗' // 更新錯誤訊息
  }
}

// 監聽：其他頁（例如會員中心/借閱/還書/取消預約）有狀態改變，就刷新本頁
const onStatusEvent = () => {
  fetchBook(false)
}

// 監聽 localStorage 變動（跨分頁）
const onStorage = (e) => {
  if (e.key === STATUS_LS_KEY) fetchBook(false)
}

// 切回分頁/視窗就刷新一次
const onFocusOrVisible = () => {
  if (document.visibilityState === 'visible') fetchBook(false)
}

// 借閱
const handleBorrow = async () => {
  const token = localStorage.getItem('token') // 取得 token
  if (!token) {
    alert('請先登入')
    router.push('/login')
    return
  }

  borrowing.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const res = await axios.post(
      `http://localhost:3000/api/loans/borrow`,
      { book_id: book.value.id },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    successMsg.value = res.data?.message || '借閱成功！'

    // 1) 更新狀態版本號（Dashboard 回去就一定會抓最新）
    localStorage.setItem(STATUS_LS_KEY, Date.now().toString())

    // 2) 自己頁面也刷新一次
    await fetchBook(false)

    // 3) 跳回會員中心
    router.push('/dashboard')
  } catch (err) {
    errorMsg.value = err?.response?.data?.message || err?.response?.data?.error || '借閱失敗' // 更新錯誤訊息
  } finally {
    borrowing.value = false // 關閉借閱按鈕
  }
}

// 預約
const handleReserve = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('請先登入')
    router.push('/login')
    return
  }

  reserving.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const res = await axios.post(
      `http://localhost:3000/api/reservations`,
      { book_id: book.value.id },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    successMsg.value = res.data?.message || '預約成功！'

    // 通知：會員中心要更新（預約數量會變）
    notifyStatusUpdated()

    await fetchBook(false)
  } catch (err) {
    errorMsg.value = err?.response?.data?.message || '預約失敗' // 更新錯誤訊息
  } finally {
    reserving.value = false // 關閉預約按鈕
  }
}

// 取消預約
const handleCancelReservation = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('請先登入')
    router.push('/login')
    return
  }

  if (!book.value?.myReservationId) {
    errorMsg.value = '找不到你的預約紀錄，無法取消'
    return
  }

  canceling.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const res = await axios.delete(
      `http://localhost:3000/api/reservations/${book.value.myReservationId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    successMsg.value = res.data?.message || '已取消預約' // 更新成功訊息

    // 通知：會員中心要更新（預約數量會變）
    notifyStatusUpdated()

    await fetchBook(false)
  } catch (err) {
    errorMsg.value = err?.response?.data?.message || '取消預約失敗' // 更新錯誤訊息
  } finally {
    canceling.value = false // 關閉取消預約按鈕
  }
}

onMounted(async () => {
  await fetchBook(false)

  // 監聽全站狀態更新事件（同頁）
  window.addEventListener(STATUS_EVENT_NAME, onStatusEvent)
  // storage（跨分頁）
  window.addEventListener('storage', onStorage)
  // focus / visible 刷新
  window.addEventListener('focus', onFocusOrVisible)
  // visibilitychange 刷新
  document.addEventListener('visibilitychange', onFocusOrVisible)
})

// 卸載前停止自動刷新
onBeforeUnmount(() => {
  stopPolling()
  window.removeEventListener(STATUS_EVENT_NAME, onStatusEvent) // 移除全站狀態更新事件監聽
  window.removeEventListener('storage', onStorage) // 移除 storage 監聽
  window.removeEventListener('focus', onFocusOrVisible) // 移除 focus 監聽
  document.removeEventListener('visibilitychange', onFocusOrVisible) // 移除 visibilitychange 監聽
})
</script>

<style scoped>
.detail-page {
  width: 100%;
}

.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: translateY(-2px);
}
</style>
