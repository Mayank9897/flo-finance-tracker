// ═══════════════════════════════════════════════
//  FLO — EXPENSE TRACKER  |  script.js (Full Stack)
// ═══════════════════════════════════════════════

// ─── Category Definitions ───────────────────────
const categories = {
    income: [
        { name: 'Salary',      emoji: '💼' },
        { name: 'Freelance',   emoji: '💻' },
        { name: 'Investment',  emoji: '📈' },
        { name: 'Bonus',       emoji: '🎁' },
        { name: 'Other',       emoji: '💰' }
    ],
    expense: [
        { name: 'Food & Dining',   emoji: '🍔' },
        { name: 'Transportation',  emoji: '🚗' },
        { name: 'Shopping',        emoji: '🛍️' },
        { name: 'Entertainment',   emoji: '🎬' },
        { name: 'Utilities',       emoji: '⚡' },
        { name: 'Health',          emoji: '🏥' },
        { name: 'Education',       emoji: '📚' },
        { name: 'Other',           emoji: '📌' }
    ]
};

// ─── Category emoji lookup ───────────────────────
const categoryEmoji = {};
[...categories.income, ...categories.expense].forEach(c => {
    categoryEmoji[c.name] = c.emoji;
});

let currentFilter = 'all';
let charts        = {};
let currentUser   = null;

// ─── API Helper ──────────────────────────────────
async function api(url, options = {}) {
    try {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

// ─── Auth Check ──────────────────────────────────
async function checkAuth() {
    try {
        const data = await fetch('api/auth/me.php').then(r => r.json());
        if (!data.loggedIn) {
            window.location.href = 'login.html';
            return false;
        }
        currentUser = data.user;
        // Update sidebar user info
        const nameEl = document.getElementById('sidebarUserName');
        const emailEl = document.getElementById('sidebarUserEmail');
        const avatarEl = document.getElementById('sidebarAvatar');
        if (nameEl)   nameEl.textContent  = currentUser.name;
        if (emailEl)  emailEl.textContent = currentUser.email;
        if (avatarEl) avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
        return true;
    } catch {
        window.location.href = 'login.html';
        return false;
    }
}

async function logout() {
    await fetch('api/auth/logout.php');
    window.location.href = 'login.html';
}

// ─── Init ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const authed = await checkAuth();
    if (!authed) return;

    updateCategories();
    setupNavigation();
    setupSearch();
    document.getElementById('date').valueAsDate = new Date();

    await loadDashboard();
    setTimeout(() => animateStatBars(), 400);
});

// ─── Load Dashboard ──────────────────────────────
async function loadDashboard() {
    showPageLoader(true);
    try {
        await Promise.all([
            loadSummary(),
            loadTransactions(),
            loadCharts()
        ]);
    } finally {
        showPageLoader(false);
    }
}

// ─── Summary Stats ───────────────────────────────
async function loadSummary() {
    const data = await api('api/analytics/summary.php');
    animateCounter('totalIncome',   data.total_income);
    animateCounter('totalExpenses', data.total_expenses);
    animateCounter('balance',       data.balance);
    renderCategoryBreakdown(data.category_breakdown);
}

// ─── Transactions ────────────────────────────────
async function loadTransactions(filter = 'all') {
    const url = filter === 'all'
        ? 'api/transactions/get.php'
        : `api/transactions/get.php?type=${filter}`;

    const data = await api(url);
    renderTransactionList('expenseList',       data.transactions, 10);
    renderTransactionList('allTransactionsList', data.transactions, 0);
}

function renderTransactionList(containerId, transactions, limit) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const list = limit > 0 ? transactions.slice(0, limit) : transactions;

    if (!list.length) {
        el.innerHTML = `
            <div class="empty-state">
                <i data-lucide="inbox" class="w-12 h-12 text-slate-600 mx-auto mb-3"></i>
                <p class="text-slate-500 text-sm">No transactions yet</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    el.innerHTML = list.map((t, i) => buildTxHTML(t, i)).join('');
    lucide.createIcons();
}

function buildTxHTML(t, index) {
    const emoji   = categoryEmoji[t.category] || '📌';
    const date    = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const sign    = t.type === 'income' ? '+' : '-';
    const amtClass = t.type === 'income' ? 'income' : 'expense';

    return `
        <div class="tx-item" style="animation-delay:${index * 40}ms">
            <div class="tx-emoji">${emoji}</div>
            <div class="tx-info">
                <div class="tx-title">${escHtml(t.category)}</div>
                <div class="tx-meta">${escHtml(t.description)} · ${date}</div>
            </div>
            <span class="tx-amount ${amtClass}">${sign}₹${parseFloat(t.amount).toFixed(2)}</span>
            <button class="tx-delete" onclick="deleteTransaction(${t.id})" title="Delete">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
        </div>`;
}

// ─── Add Transaction ─────────────────────────────
async function addTransaction(e) {
    e.preventDefault();

    const type        = document.getElementById('transactionType').value;
    const category    = document.getElementById('category').value;
    const amount      = parseFloat(document.getElementById('amount').value);
    const date        = document.getElementById('date').value;
    const description = document.getElementById('description').value || 'No description';

    if (!type || !category || !amount || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = document.querySelector('#addModal form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    try {
        await api('api/transactions/add.php', {
            method: 'POST',
            body: JSON.stringify({ type, category, amount, date, description })
        });

        closeAddModal();
        showToast(`${type === 'income' ? '💰 Income' : '💸 Expense'} added — ₹${amount.toFixed(0)}`, 'success');

        // Refresh all data
        await loadDashboard();

        // If on analytics page, refresh those charts too
        if (document.getElementById('analytics').classList.contains('active')) {
            await loadAnalyticsCharts();
        }
        // If on budget page, refresh
        if (document.getElementById('budget').classList.contains('active')) {
            await loadBudget();
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Transaction';
    }
}

// ─── Delete Transaction ──────────────────────────
async function deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;

    await api('api/transactions/delete.php', {
        method: 'DELETE',
        body: JSON.stringify({ id })
    });

    showToast('Transaction removed', 'error');
    await loadDashboard();

    if (document.getElementById('analytics').classList.contains('active')) {
        await loadAnalyticsCharts();
    }
    if (document.getElementById('budget').classList.contains('active')) {
        await loadBudget();
    }
}

// ─── Filter ──────────────────────────────────────
async function filterTransactions(type, event) {
    currentFilter = type;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    await loadTransactions(type);
}

// ─── Search ──────────────────────────────────────
function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', e => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const q = e.target.value.trim();
            const url = q
                ? `api/transactions/get.php?search=${encodeURIComponent(q)}`
                : 'api/transactions/get.php';
            const data = await api(url);
            renderTransactionList('allTransactionsList', data.transactions, 0);
        }, 300);
    });
}

// ─── Charts ──────────────────────────────────────
async function loadCharts() {
    const data = await api('api/analytics/monthly.php');
    renderMonthlyChart(data.monthly);
    renderCategoryChartFromSummary();
}

async function renderCategoryChartFromSummary() {
    const data = await api('api/analytics/summary.php');
    renderCategoryChart(data.category_breakdown);
}

async function loadAnalyticsCharts() {
    const data = await api('api/analytics/monthly.php');
    renderIncomeExpensesChart(data);
    renderTrendChart(data.trend);
}

function renderMonthlyChart(monthly) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    if (charts.monthly) charts.monthly.destroy();

    const labels  = monthly.map(m => m.label);
    const income  = monthly.map(m => m.income);
    const expense = monthly.map(m => m.expense);

    charts.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [
                { label: 'Income',   data: income,  backgroundColor: 'rgba(52,211,153,0.7)', borderColor: '#34d399', borderWidth: 0, borderRadius: 8, borderSkipped: false },
                { label: 'Expenses', data: expense, backgroundColor: 'rgba(248,113,113,0.7)', borderColor: '#f87171', borderWidth: 0, borderRadius: 8, borderSkipped: false }
            ]
        },
        options: chartOptions()
    });
}

function renderCategoryChart(breakdown) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    if (charts.category) charts.category.destroy();

    const labels  = breakdown.map(b => b.category);
    const data    = breakdown.map(b => b.total);
    const palette = ['#6366f1','#ec4899','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#84cc16'];

    charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                data: data.length ? data : [1],
                backgroundColor: palette.slice(0, labels.length || 1).map(c => c + 'cc'),
                borderColor: palette.slice(0, labels.length || 1),
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12, boxWidth: 10, boxHeight: 10 } }
            }
        }
    });
}

function renderIncomeExpensesChart(data) {
    const ctx = document.getElementById('incomeExpensesChart');
    if (!ctx) return;
    if (charts.incomeExpenses) charts.incomeExpenses.destroy();

    const totalIncome  = data.monthly.reduce((s, m) => s + m.income,  0);
    const totalExpense = data.monthly.reduce((s, m) => s + m.expense, 0);

    charts.incomeExpenses = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [totalIncome || 0, totalExpense || 0],
                backgroundColor: ['rgba(52,211,153,0.8)', 'rgba(248,113,113,0.8)'],
                borderColor: ['#34d399', '#f87171'],
                borderWidth: 2, hoverOffset: 10
            }]
        },
        options: { responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 } } }
        }
    });
}

function renderTrendChart(trend) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    if (charts.trend) charts.trend.destroy();

    const dates      = trend.map(t => new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    const incomeData = trend.map(t => t.cum_income);
    const expData    = trend.map(t => t.cum_expense);

    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.length ? dates : ['No Data'],
            datasets: [
                { label: 'Cumulative Income',   data: incomeData, borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.08)',  borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#34d399' },
                { label: 'Cumulative Expenses', data: expData,    borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#f87171' }
            ]
        },
        options: chartOptions()
    });
}

function chartOptions() {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 12 }, padding: 16, boxWidth: 12, boxHeight: 12 } },
            tooltip: { backgroundColor: 'rgba(13,17,23,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 12, cornerRadius: 10 }
        },
        scales: {
            y: { beginAtZero: true, ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'transparent' } },
            x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'transparent' } }
        }
    };
}

// ─── Category Breakdown ──────────────────────────
function renderCategoryBreakdown(breakdown) {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    if (!breakdown || !breakdown.length) {
        grid.innerHTML = `<div class="empty-state col-span-full"><p class="text-slate-500 text-sm">Add expenses to see breakdown</p></div>`;
        return;
    }

    grid.innerHTML = breakdown.map(b => {
        const emoji = categoryEmoji[b.category] || '📌';
        return `
            <div class="cat-card">
                <div class="text-2xl mb-2">${emoji}</div>
                <div class="text-xs font-semibold text-slate-400 mb-1">${escHtml(b.category)}</div>
                <div class="text-sm font-bold text-slate-200 font-mono">₹${parseFloat(b.total).toFixed(0)}</div>
            </div>`;
    }).join('');
}

// ─── Budget ──────────────────────────────────────
async function loadBudget() {
    const month = document.getElementById('budgetMonth')?.value || getCurrentMonth();
    const data  = await api(`api/budget/get.php?month=${month}`);
    renderBudgetCards(data.budgets, month);
}

function renderBudgetCards(budgets, month) {
    const container = document.getElementById('budgetContainer');
    if (!container) return;

    // Always show all expense categories, merge with real data
    const allExpenseCategories = categories.expense.map(c => c.name);
    const budgetMap = {};
    budgets.forEach(b => { budgetMap[b.category] = b; });

    const html = allExpenseCategories.map(cat => {
        const b       = budgetMap[cat] || { category: cat, limit: 0, spent: 0, percent: 0, over: false };
        const emoji   = categoryEmoji[cat] || '📌';
        const percent = b.percent || 0;
        const spent   = parseFloat(b.spent || 0);
        const limit   = parseFloat(b.limit || 0);

        let barColor = 'linear-gradient(90deg,#6366f1,#818cf8)';
        let pctColor = 'text-brand-400';
        if (percent >= 90) { barColor = 'linear-gradient(90deg,#ef4444,#f87171)'; pctColor = 'text-rose-400'; }
        else if (percent >= 70) { barColor = 'linear-gradient(90deg,#f59e0b,#fbbf24)'; pctColor = 'text-amber-400'; }
        else if (percent >= 1) { barColor = 'linear-gradient(90deg,#10b981,#34d399)'; pctColor = 'text-emerald-400'; }

        return `
            <div class="budget-card">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">${emoji}</span>
                        <span class="text-sm font-semibold text-slate-300">${cat}</span>
                    </div>
                    <span class="text-xs font-mono font-bold ${pctColor}">${percent}%</span>
                </div>
                <div class="budget-bar-track">
                    <div class="budget-bar-fill" style="width:${percent}%; background:${barColor}"></div>
                </div>
                <div class="flex items-center justify-between mt-2">
                    <p class="text-xs text-slate-500 font-mono">₹${spent.toFixed(0)} / ₹${limit > 0 ? limit.toFixed(0) : '—'}</p>
                    <button onclick="openSetBudget('${cat}', ${limit}, '${month}')"
                        class="text-xs text-brand-400 hover:text-brand-300 transition-colors font-semibold">
                        ${limit > 0 ? 'Edit' : 'Set limit'}
                    </button>
                </div>
                ${b.over ? '<p class="text-xs text-rose-400 mt-1 font-semibold">⚠️ Over budget!</p>' : ''}
            </div>`;
    }).join('');

    container.innerHTML = html;
}

function openSetBudget(category, currentLimit, month) {
    const limit = prompt(`Set monthly budget limit for "${category}" (₹):`, currentLimit || '');
    if (limit === null) return;
    const amount = parseFloat(limit);
    if (isNaN(amount) || amount < 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    saveBudget(category, amount, month);
}

async function saveBudget(category, limit, month) {
    await api('api/budget/save.php', {
        method: 'POST',
        body: JSON.stringify({ category, limit, month })
    });
    showToast(`Budget set for ${category}`, 'success');
    await loadBudget();
}

function getCurrentMonth() {
    return new Date().toISOString().slice(0, 7);
}

// ─── Navigation ──────────────────────────────────
const pageTitles = {
    dashboard:    { title: 'Financial Dashboard',  sub: 'Welcome back — here\'s your overview' },
    transactions: { title: 'Transactions',          sub: 'All your recorded transactions' },
    analytics:    { title: 'Analytics',             sub: 'Insights into your spending patterns' },
    budget:       { title: 'Budget',                sub: 'Track your spending limits' },
};

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', async e => {
            e.preventDefault();
            const page = link.dataset.page;

            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(page).classList.add('active');

            const info = pageTitles[page];
            if (info) {
                document.getElementById('pageTitle').textContent    = info.title;
                document.getElementById('pageSubtitle').textContent = info.sub;
            }

            lucide.createIcons();

            if (page === 'analytics') await loadAnalyticsCharts();
            if (page === 'budget')    await loadBudget();
            if (page === 'transactions') await loadTransactions(currentFilter);
        });
    });
}

// ─── Modal ───────────────────────────────────────
function openAddModal() {
    document.getElementById('addModal').classList.add('active');
    setType('expense', document.querySelector('.type-btn[data-type="expense"]'));
    lucide.createIcons();
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('addModal').querySelector('form').reset();
    document.getElementById('date').valueAsDate = new Date();
    setType('expense', document.querySelector('.type-btn[data-type="expense"]'));
    updateCategories();
}

window.addEventListener('click', e => {
    if (e.target === document.getElementById('addModal')) closeAddModal();
});

// ─── Type Toggle ─────────────────────────────────
function setType(type, btn) {
    document.getElementById('transactionType').value = type;
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateCategories();
}

function updateCategories() {
    const type = document.getElementById('transactionType').value || 'expense';
    const sel  = document.getElementById('category');
    sel.innerHTML = '<option value="">Select category</option>';
    (categories[type] || []).forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = `${cat.emoji} ${cat.name}`;
        sel.appendChild(opt);
    });
}

// ─── Stat Bar Animation ──────────────────────────
function animateStatBars() {
    document.querySelectorAll('.stat-bar-fill, .budget-bar-fill').forEach(bar => {
        const target = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = target; }, 100);
    });
}

// ─── Counter Animation ───────────────────────────
function animateCounter(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const start    = parseFloat(el.textContent.replace(/,/g, '')) || 0;
    const duration = 800;
    const startTime = performance.now();

    function update(now) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = start + (value - start) * eased;
        el.textContent = Math.round(current).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ─── Page Loader ─────────────────────────────────
function showPageLoader(show) {
    let loader = document.getElementById('pageLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'pageLoader';
        loader.style.cssText = `
            position:fixed;top:0;left:0;right:0;height:2px;
            background:linear-gradient(90deg,#6366f1,#ec4899);
            z-index:9999;transition:opacity 0.3s;
            animation:shimmerBar 1s linear infinite;`;
        document.head.insertAdjacentHTML('beforeend',
            '<style>@keyframes shimmerBar{0%{background-position:-200% 0}100%{background-position:200% 0}}</style>');
        document.body.appendChild(loader);
    }
    loader.style.opacity = show ? '1' : '0';
}

// ─── Toast ───────────────────────────────────────
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast     = document.createElement('div');
    const icon      = type === 'success' ? 'check-circle' : 'x-circle';
    const color     = type === 'success' ? '#34d399' : '#f87171';

    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i data-lucide="${icon}" style="width:16px;height:16px;color:${color};flex-shrink:0"></i>
        <span>${message}</span>`;

    container.appendChild(toast);
    lucide.createIcons({ nodes: [toast] });

    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─── Utility ─────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
