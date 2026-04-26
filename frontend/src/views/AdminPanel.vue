<template>
    <div class="container-fluid pb-4 page-wrap admin-page">
        <div class="d-flex justify-content-between align-items-center mb-4 pt-2">
            <div>
                <h2 class="fw-bold text-dark mb-1">後台管理中心</h2>
                <p class="text-muted mb-0">管理館藏書籍、處理歸還與罰款核銷。</p>
            </div>
            <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold hover-scale" @click="openCreateModal">
                <i class="bi bi-plus-lg me-2"></i>上架新書
            </button>
        </div>

        <div class="mb-4" v-if="successMsg || errorMsg">
            <div v-if="successMsg"
                class="alert alert-success rounded-4 d-flex align-items-center justify-content-between">
                <div><i class="bi bi-check-circle me-2"></i>{{ successMsg }}</div>
                <button class="btn btn-sm btn-outline-success rounded-pill" @click="successMsg = ''">關閉</button>
            </div>
            <div v-if="errorMsg" class="alert alert-danger rounded-4 d-flex align-items-center justify-content-between">
                <div><i class="bi bi-x-circle me-2"></i>{{ errorMsg }}</div>
                <button class="btn btn-sm btn-outline-danger rounded-pill" @click="errorMsg = ''">關閉</button>
            </div>
        </div>

        <div class="row g-4 mb-5 w-100 mx-0">
            <!-- 歸還 -->
            <div class="col-md-6">
                <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h5 class="fw-bold mb-0">歸還處理</h5>
                            <i class="bi bi-arrow-repeat fs-4 text-primary"></i>
                        </div>
                        <p class="text-muted small mb-4">輸入 Loan ID 以完成還書，系統將自動計算逾期費用。</p>
                        <div class="mt-auto">
                            <div class="input-group">
                                <input v-model="loanIdToReturn" type="text"
                                    class="form-control bg-light border-0 ps-4 rounded-start-pill py-3"
                                    placeholder="Loan ID (e.g., 104)" />
                                <button @click="handleReturn" class="btn btn-success px-4 rounded-end-pill fw-bold"
                                    :disabled="loadingReturn">
                                    {{ loadingReturn ? '處理中...' : '確認還書' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 核銷 -->
            <div class="col-md-6">
                <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h5 class="fw-bold mb-0">罰款核銷</h5>
                            <i class="bi bi-cash-coin fs-4 text-warning"></i>
                        </div>
                        <p class="text-muted small mb-4">輸入 Loan ID 以核銷該筆逾期罰款，完成後狀態將更新。</p>
                        <div class="mt-auto">
                            <div class="input-group">
                                <input v-model="loanIdToClearFine" type="text"
                                    class="form-control bg-light border-0 ps-4 rounded-start-pill py-3"
                                    placeholder="Loan ID (e.g., 104)" />
                                <button @click="handleClearFine" class="btn btn-warning px-4 rounded-end-pill fw-bold"
                                    :disabled="loadingFine">
                                    {{ loadingFine ? '處理中...' : '核銷罰款' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--  目前借閱中列表（新功能） -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <div class="card-body p-0">
                <div class="p-4 border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="fw-bold mb-0">借閱中列表 (Active Loans)</h5>
                        <button class="btn btn-outline-primary rounded-pill px-4 fw-bold" @click="fetchActiveLoans">
                            <i class="bi bi-arrow-clockwise me-2"></i>刷新
                        </button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Loan ID</th>
                                <th>借閱人</th>
                                <th>書名</th>
                                <th>到期日</th>
                                <th>狀態</th>
                                <th class="text-end pe-4">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="loan in activeLoans" :key="loan.loanId">
                                <td class="ps-4 text-muted fw-bold">#{{ loan.loanId }}</td>
                                <td><span class="badge bg-light text-dark border">{{ loan.username }}</span></td>
                                <td class="fw-bold">{{ loan.bookTitle }}</td>
                                <td>{{ loan.dueDate }}</td>
                                <td>
                                    <span v-if="loan.overdueDays > 0" class="badge bg-danger rounded-pill">逾期 {{
                                        loan.overdueDays }} 天</span>
                                    <span v-else class="badge bg-success rounded-pill">正常</span>
                                </td>
                                <td class="text-end pe-4">
                                    <button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold"
                                        @click="quickReturn(loan.loanId)">
                                        歸還
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="activeLoans.length === 0">
                                <td colspan="6" class="text-center text-muted py-5">
                                    <i class="bi bi-journal-check display-6"></i>
                                    <div class="mt-2">目前沒有借閱中的書籍</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!--  館藏管理（獨立卡片） -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-body p-0">
                <div class="p-4 border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="fw-bold mb-0">館藏管理</h5>
                        <div class="input-group" style="max-width: 360px;">
                            <span class="input-group-text bg-transparent border-0"><i class="bi bi-search"></i></span>
                            <input v-model="search" type="text" class="form-control border-0 shadow-none"
                                placeholder="搜尋書名/作者/ISBN..." @keyup.enter="handleSearch" />
                            <button class="btn btn-outline-secondary rounded-pill ms-2 px-3 fw-bold"
                                @click="handleSearch">
                                搜尋
                            </button>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">書名</th>
                                <th>作者</th>
                                <th>ISBN</th>
                                <th>狀態</th>
                                <th class="text-end pe-4">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="book in books" :key="book.id">
                                <td class="ps-4 fw-bold">{{ book.title }}</td>
                                <td>{{ book.author }}</td>
                                <td class="text-muted">{{ book.isbn }}</td>
                                <td>
                                    <span :class="book.status === 'available' ? 'bg-success' : 'bg-danger'"
                                        class="badge rounded-pill px-3 py-2">
                                        {{ book.status === 'available' ? '可借閱' : '已借出' }}
                                    </span>
                                </td>
                                <td class="text-end pe-4">
                                    <button
                                        class="btn btn-sm btn-outline-danger rounded-pill px-3 hover-bg-danger d-inline-flex align-items-center gap-1"
                                        @click="deleteBook(book.id)">
                                        <i class="bi bi-trash"></i>
                                        <span>刪除</span>
                                    </button>
                                </td>
                            </tr>

                            <tr v-if="books.length === 0">
                                <td colspan="5" class="text-center text-muted py-5">
                                    <i class="bi bi-inbox display-6"></i>
                                    <div class="mt-2">目前沒有館藏資料</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="p-4 border-top d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <small class="text-muted">顯示第 {{ currentPage }} 頁，共 {{ totalPages }} 頁</small>

                    <nav v-if="totalPages > 1">
                        <ul class="pagination mb-0">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link rounded-start-pill" @click="goPage(1)"
                                    :disabled="currentPage === 1">«</button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="goPage(currentPage - 1)"
                                    :disabled="currentPage === 1">‹</button>
                            </li>

                            <li v-for="p in visiblePages" :key="p" class="page-item"
                                :class="{ active: p === currentPage }">
                                <button class="page-link" @click="goPage(p)">{{ p }}</button>
                            </li>

                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="goPage(currentPage + 1)"
                                    :disabled="currentPage === totalPages">›</button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link rounded-end-pill" @click="goPage(totalPages)"
                                    :disabled="currentPage === totalPages">»</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!--  會員管理 -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mt-4">
            <div class="card-body p-0">
                <div class="p-4 border-bottom">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <h5 class="fw-bold mb-0">會員管理</h5>

                        <div class="d-flex gap-2 align-items-center flex-wrap">
                            <input v-model="userSearch" type="text" class="form-control" style="max-width: 280px;"
                                placeholder="搜尋會員帳號/ID..." @keyup.enter="fetchUsers" />
                            <button class="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                                @click="fetchUsers">搜尋</button>
                            <button class="btn btn-outline-primary rounded-pill px-4 fw-bold" @click="fetchUsers">
                                <i class="bi bi-arrow-clockwise me-2"></i>刷新
                            </button>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">ID</th>
                                <th>帳號</th>
                                <th>角色</th>
                                <th>狀態</th>
                                <th class="text-end pe-4">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in sortedUsers" :key="u.id">
                                <td class="ps-4 text-muted">{{ u.id }}</td>
                                <td class="fw-bold">{{ u.username }}</td>
                                <td>
                                    <span class="badge rounded-pill px-3 py-2"
                                        :class="u.role === 'admin' ? 'bg-primary' : 'bg-secondary'">
                                        {{ u.role }}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge rounded-pill px-3 py-2"
                                        :class="u.status === 'active' ? 'bg-success' : 'bg-dark'">
                                        {{ u.status === 'active' ? '正常' : '已註銷' }}
                                    </span>
                                </td>
                                <td class="text-end pe-4">
                                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3"
                                        @click="deactivateUser(u.id)"
                                        :disabled="u.role === 'admin' || deactivatingUserId === u.id || u.status !== 'active'">
                                        {{ deactivatingUserId === u.id ? '處理中...' : '註銷' }}
                                    </button>
                                </td>
                            </tr>

                            <tr v-if="sortedUsers.length === 0">
                                <td colspan="5" class="text-center text-muted py-5">
                                    <i class="bi bi-people display-6"></i>
                                    <div class="mt-2">查無會員資料</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="p-4 border-top d-flex justify-content-between align-items-center mt-0 flex-wrap gap-2">
                    <small class="text-muted">共 {{ userTotal }} 位會員</small>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-backdrop fade show"></div>
        <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 rounded-4 overflow-hidden">
                    <div class="modal-header border-0 bg-primary text-white">
                        <h5 class="modal-title fw-bold">新增館藏</h5>
                        <button type="button" class="btn-close btn-close-white" @click="showModal = false"></button>
                    </div>

                    <div class="modal-body p-4">
                        <div class="form-floating mb-3">
                            <input v-model="newBook.title" type="text" class="form-control rounded-4" id="title"
                                placeholder="title" />
                            <label for="title">書名</label>
                        </div>

                        <div class="form-floating mb-3">
                            <input v-model="newBook.author" type="text" class="form-control rounded-4" id="author"
                                placeholder="author" />
                            <label for="author">作者</label>
                        </div>

                        <div class="form-floating mb-3">
                            <input v-model="newBook.isbn" type="text" class="form-control rounded-4" id="isbn"
                                placeholder="isbn" />
                            <label for="isbn">ISBN</label>
                        </div>

                        <div class="alert alert-info rounded-4 small mb-3">狀態固定為：<b>可借閱</b>（上架新書一律可借閱）</div>

                        <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" @click="createBook">
                            新增館藏 <i class="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue' // Vue 基礎功能
import axios from 'axios' // HTTP client

const search = ref('') // 搜尋關鍵字
const books = ref([]) // 書籍列表
const activeLoans = ref([]) // 借閱中列表
const currentPage = ref(1) // 目前頁面
const totalPages = ref(1) // 總頁面數

const loanIdToReturn = ref('') // 歸還
const loanIdToClearFine = ref('') // 核銷

const loadingReturn = ref(false) // 歸還
const loadingFine = ref(false) // 核銷
const successMsg = ref('') // 成功訊息
const errorMsg = ref('') // 錯誤訊息

const showModal = ref(false) // 顯示新增書籍的模態框
const newBook = ref({
    title: '',
    author: '',
    isbn: '',
    status: 'available' // 預設狀態為可借閱
})

// 會員管理
const users = ref([]) // 會員列表
const userSearch = ref('') // 搜尋關鍵字
const userTotal = ref(0) // 總會員數
const deactivatingUserId = ref(null) // 正在註銷的會員 ID

// ID 小到大排序
const sortedUsers = computed(() => [...users.value].sort((a, b) => Number(a.id) - Number(b.id)))

// 顯示頁面
const visiblePages = computed(() => {
    const total = totalPages.value || 1 // 總頁面數
    const current = currentPage.value || 1 // 目前頁面
    const windowSize = 5 // 顯示頁面數

    if (total <= windowSize) return Array.from({ length: total }, (_, i) => i + 1) // 如果總頁面數小於等於顯示頁面數，則顯示所有頁面

    const half = Math.floor(windowSize / 2) // 半個顯示頁面數
    let start = current - half // 開始頁面
    let end = current + half // 結束頁面

    // 如果開始頁面小於1，則開始頁面為1，結束頁面為顯示頁面數
    if (start < 1) {
        start = 1
        end = windowSize
    }

    // 如果結束頁面大於總頁面數，則結束頁面為總頁面數，開始頁面為總頁面數-顯示頁面數+1
    if (end > total) {
        end = total
        start = total - windowSize + 1
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// 顯示成功訊息
const showSuccess = (msg) => {
    successMsg.value = msg
    errorMsg.value = ''
}

// 顯示錯誤訊息
const showError = (msg) => {
    errorMsg.value = msg
    successMsg.value = ''
}

// 取得授權標頭
const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
}

// 取得館藏
const fetchBooks = async (page = 1) => {
    try {
        const safePage = Math.max(1, page) // 確保頁面數大於等於1
        // 確保頁面數小於等於總頁面數
        const res = await axios.get('http://localhost:3000/api/books', {
            params: { q: search.value, page: safePage, limit: 10 },
            headers: getAuthHeader()
        })

        books.value = res.data.data // 馆藏列表
        totalPages.value = res.data.totalPages || 1 // 總頁面數

        currentPage.value = Math.min(safePage, totalPages.value) // 目前頁面
        if (currentPage.value !== safePage) return fetchBooks(currentPage.value) // 如果目前頁面不等於安全頁面，則重新取得館藏
    } catch (err) {
        showError(err?.response?.data?.message || err?.response?.data?.error || '取得館藏失敗') // 顯示錯誤訊息
    }
}

// 切換頁面
const goPage = (page) => {
    if (page < 1 || page > totalPages.value) return // 如果頁面數小於等於1或大於等於總頁面數，則返回
    fetchBooks(page) // 取得館藏
}

// 搜尋
const handleSearch = () => fetchBooks(1)

// 打開新增書籍的模態框
const openCreateModal = () => {
    newBook.value = { title: '', author: '', isbn: '', status: 'available' } // 新增書籍
    showModal.value = true // 顯示模態框
}

// 新增館藏
const createBook = async () => {
    try {
        const payload = { ...newBook.value, status: 'available' } // 強制可借閱

        await axios.post('http://localhost:3000/api/admin/books', payload, {
            headers: getAuthHeader()
        }) // 新增館藏

        showModal.value = false // 關閉模態框

        newBook.value = { title: '', author: '', isbn: '', status: 'available' } // 清空新增書籍

        showSuccess('新增館藏成功') // 顯示成功訊息

        await fetchBooks(1) // 取得館藏
    } catch (err) {
        showError(err?.response?.data?.message || err?.response?.data?.error || '新增館藏失敗') // 顯示錯誤訊息
    }
}

// 刪除館藏
const deleteBook = async (id) => {
    try {
        await axios.delete(`http://localhost:3000/api/admin/books/${id}`, {
            headers: getAuthHeader()
        }) // 刪除館藏

        showSuccess('刪除成功') // 顯示成功訊息

        await fetchBooks(currentPage.value) // 取得館藏
    } catch (err) {
        showError(err?.response?.data?.message || err?.response?.data?.error || '刪除失敗')
    }
}

// 歸還後立即刷新書本狀態
const handleReturn = async () => {
    const loanId = String(loanIdToReturn.value || '').trim() // Loan ID

    if (!loanId) return showError('請輸入 Loan ID') // 顯示錯誤訊息

    loadingReturn.value = true // 顯示載入中
    try {
        const res = await axios.post(`http://localhost:3000/api/admin/return/${loanId}`, {}, { headers: getAuthHeader() }) // 還書

        showSuccess(res.data?.message || '還書完成') // 顯示成功訊息

        loanIdToReturn.value = '' // 清空 Loan ID

        await fetchBooks(currentPage.value) // 取得館藏

        await fetchActiveLoans() // 還書後刷新列表
    } catch (err) {
        showError(err?.response?.data?.message || err?.response?.data?.error || '還書失敗（請確認 Loan ID）') // 顯示錯誤訊息
    } finally {
        loadingReturn.value = false // 關閉載入中
    }
}

// 取得借閱列表
const fetchActiveLoans = async () => {
    try {
        const res = await axios.get('http://localhost:3000/api/admin/loans', { headers: getAuthHeader() }) // 取得借閱列表

        activeLoans.value = res.data // 借閱列表
    } catch (err) {
        console.error(err)
        showError('取得借閱列表失敗') // 顯示錯誤訊息
    }
}

// 快速還書
const quickReturn = (loanId) => {
    loanIdToReturn.value = loanId // Loan ID
    handleReturn() // 還書
}

// 核銷罰款
const handleClearFine = async () => {
    const loanId = String(loanIdToClearFine.value || '').trim() // Loan ID
    if (!loanId) return showError('請輸入 Loan ID') // 顯示錯誤訊息

    loadingFine.value = true // 顯示載入中
    try {
        const res = await axios.post(`http://localhost:3000/api/admin/clear-fine/${loanId}`, {}, { headers: getAuthHeader() }) // 核銷罰款
        showSuccess(res.data?.message || '罰款已核銷') // 顯示成功訊息
        loanIdToClearFine.value = '' // 清空 Loan ID
    } catch (err) {
        showError(err?.response?.data?.message || err?.response?.data?.error || '核銷失敗（請確認 Loan ID / 是否有未繳罰款）') // 顯示錯誤訊息
    } finally {
        loadingFine.value = false // 關閉載入中
    }
}

// 取得會員列表
const fetchUsers = async () => {
    try {
        const res = await axios.get('http://localhost:3000/api/admin/users', {
            params: { q: userSearch.value },
            headers: getAuthHeader()
        })

        if (Array.isArray(res.data)) {
            users.value = res.data
            userTotal.value = res.data.length
        } else {
            users.value = res.data.data || []
            userTotal.value = res.data.total ?? users.value.length
        }
    } catch (err) {
        console.error(err)
        showError(err?.response?.data?.message || '取得會員列表失敗（請確認後端 /api/admin/users）') // 顯示錯誤訊息
    }
}

// 註銷會員
const deactivateUser = async (id) => {
    if (!confirm('確定要註銷此會員？註銷後將無法登入。')) return // 顯示確認視窗

    deactivatingUserId.value = id // 註銷中的會員 ID

    try {
        const res = await axios.patch(`http://localhost:3000/api/admin/users/${id}/deactivate`, {}, { headers: getAuthHeader() }) // 註銷會員
        showSuccess(res.data?.message || '已註銷會員') // 顯示成功訊息
        await fetchUsers()
    } catch (err) {
        showError(err?.response?.data?.message || '註銷會員失敗') // 顯示錯誤訊息
    } finally {
        deactivatingUserId.value = null // 重置註銷中的會員 ID
    }
}

// 挂載時
onMounted(async () => {
    await fetchBooks(1)
    await fetchActiveLoans()
    await fetchUsers()
})
</script>

<style scoped>
.page-wrap {
    min-height: calc(100vh - 120px);
}

.admin-page {
    padding-top: 2rem;
}

.hover-scale {
    transition: transform 0.2s ease;
}

.hover-scale:hover {
    transform: scale(1.02);
}

.hover-bg-danger:hover {
    background: rgba(220, 53, 69, 0.08);
}

.pagination .page-link {
    border: none;
    font-weight: 600;
    color: #6c757d;
}

.pagination .page-item.active .page-link {
    background: #0d6efd;
    color: #fff;
}

.pagination .page-link:hover {
    background: #e9ecef;
}

.pagination .page-item.disabled .page-link {
    color: #adb5bd;
}

code {
    background: #f1f3f5;
    padding: 0.15rem 0.35rem;
    border-radius: 0.35rem;
}
</style>
