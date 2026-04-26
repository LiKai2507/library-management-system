<template>
    <div class="home-container page-wrap">
        <div class="hero-section bg-white rounded-4 shadow-sm position-relative overflow-hidden mb-4 border">
            <div class="pattern-overlay"></div>
            <div class="container-fluid px-4 pb-4 hero-content">
                <div class="row justify-content-center text-center pt-4">
                    <div class="col-lg-8">
                        <h1 class="display-4 fw-bold text-dark mb-4">探索您的下一本好書</h1>
                        <div class="search-box-wrapper shadow-lg p-2 bg-white rounded-pill mx-auto"
                            style="max-width: 600px;">
                            <div class="input-group">
                                <span class="input-group-text bg-transparent border-0 ps-4"><i
                                        class="bi bi-search text-muted"></i></span>
                                <input v-model="search" type="text" class="form-control border-0 shadow-none ps-0"
                                    placeholder="輸入書名、作者或關鍵字..." @keyup.enter="handleSearch" />
                                <button class="btn btn-primary rounded-pill px-4 fw-bold" @click="handleSearch">
                                    搜尋
                                </button>
                                <button class="btn btn-outline-secondary rounded-pill px-4 fw-bold ms-2"
                                    @click="resetSearch">
                                    重置
                                </button>
                            </div>
                        </div>
                        <p class="text-muted mt-3 mb-0 small">
                            目前共有 <span class="fw-bold">{{ books.length }}</span> 本書籍顯示於本頁
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="container-fluid px-4">
            <div v-if="books.length > 0">
                <div class="row g-4">
                    <div v-for="book in books" :key="book.id" class="col-md-6 col-lg-4">
                        <div class="card book-card border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-lift">
                            <div class="card-body p-0">
                                <div class="book-cover-wrapper">
                                    <img :src="book.cover || defaultCover" class="book-cover" alt="book cover" />
                                    <div class="cover-overlay"></div>
                                </div>
                                <div class="p-4">
                                    <h5 class="fw-bold mb-2 text-truncate">{{ book.title }}</h5>
                                    <p class="text-muted mb-3">
                                        <i class="bi bi-person me-1"></i>{{ book.author }}
                                    </p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="badge rounded-pill px-3 py-2"
                                            :class="book.status === 'available' ? 'bg-success' : 'bg-danger'">
                                            {{ book.status === 'available' ? '可借閱' : '已借出' }}
                                        </span>
                                        <small class="text-muted">
                                            <i class="bi bi-upc-scan me-1"></i>{{ book.isbn }}
                                        </small>
                                    </div>

                                    <div class="mt-4 d-flex justify-content-between align-items-center">
                                        <small class="text-muted">
                                            <i class="bi bi-bookmark-heart me-1"></i>推薦
                                        </small>

                                        <router-link :to="{ name: 'BookDetail', params: { id: book.id } }"
                                            class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">
                                            詳情 <i class="bi bi-arrow-right-short"></i>
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <nav class="mt-5 d-flex justify-content-center" v-if="totalPages > 1">
                    <ul class="pagination pagination-lg">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link rounded-start-pill" @click="changePage(1)"
                                :disabled="currentPage === 1" aria-label="First page">
                                «
                            </button>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                                aria-label="Previous page">
                                ‹
                            </button>
                        </li>

                        <li v-for="p in visiblePages" :key="p" class="page-item" :class="{ active: p === currentPage }">
                            <button class="page-link" @click="changePage(p)">{{ p }}</button>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <button class="page-link" @click="changePage(currentPage + 1)"
                                :disabled="currentPage === totalPages" aria-label="Next page">
                                ›
                            </button>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <button class="page-link rounded-end-pill" @click="changePage(totalPages)"
                                :disabled="currentPage === totalPages" aria-label="Last page">
                                »
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            <div v-else class="text-center py-5">
                <i class="bi bi-emoji-frown display-3 text-muted"></i>
                <h5 class="mt-3 text-muted">找不到符合的館藏</h5>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Vue 3 基礎
import axios from 'axios'; // Axios
import defaultCover from '../assets/images.png'; // 預設封面

const search = ref(''); // 搜尋關鍵字
const books = ref([]); // 顯示的書籍
const currentPage = ref(1); // 目前頁面
const totalPages = ref(1); // 總頁面數

// 計算顯示的頁面
const visiblePages = computed(() => {
    const total = totalPages.value || 1;
    const current = currentPage.value || 1;
    const windowSize = 5;

    if (total <= windowSize) return Array.from({ length: total }, (_, i) => i + 1);

    const half = Math.floor(windowSize / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) { start = 1; end = windowSize; }
    if (end > total) { end = total; start = total - windowSize + 1; }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// 取得書籍
const fetchBooks = async (page = 1) => {
    try {
        const res = await axios.get(`http://localhost:3000/api/books`, {
            params: { q: search.value, page: page, limit: 6 }
        });
        books.value = res.data.data;
        totalPages.value = res.data.totalPages;
        currentPage.value = page;
    } catch (err) {
        console.error(err);
    }
};

// 搜尋
const handleSearch = () => {
    currentPage.value = 1;
    fetchBooks(1);
};

// 重置搜尋
const resetSearch = () => {
    search.value = '';
    handleSearch();
};

// 切換頁面
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) fetchBooks(page);
};

// 挂載
onMounted(() => fetchBooks(1));
</script>

<style scoped>
.page-wrap {
    min-height: calc(100vh - 120px);
}

.home-container {
    padding-top: 2rem;
    padding-bottom: 2rem;
}

.hero-section {
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

.pattern-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        radial-gradient(circle at 25% 25%, rgba(13, 110, 253, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(25, 135, 84, 0.05) 0%, transparent 50%);
    pointer-events: none;
}

.hero-content {
    position: relative;
    z-index: 2;
}

.search-box-wrapper {
    transition: all 0.3s ease;
}

.search-box-wrapper:hover {
    transform: translateY(-2px);
}

.book-card {
    transition: all 0.3s ease;
}

.hover-lift:hover {
    transform: translateY(-8px);
}

.book-cover-wrapper {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.book-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.book-card:hover .book-cover {
    transform: scale(1.05);
}

.cover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
}

.pagination .page-link {
    border: none;
    color: #6c757d;
    font-weight: 600;
}

.pagination .page-item.active .page-link {
    background-color: #0d6efd;
    color: white;
}

.pagination .page-link:hover {
    background-color: #e9ecef;
}

.pagination .page-item.disabled .page-link {
    color: #adb5bd;
}

@media (max-width: 768px) {
    .display-4 {
        font-size: 2.5rem;
    }

    .search-box-wrapper {
        max-width: 100% !important;
    }

    .input-group {
        flex-wrap: wrap;
    }

    .btn {
        margin-top: 0.5rem;
    }
}
</style>