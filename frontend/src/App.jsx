import { useEffect, useMemo, useState, useCallback } from 'react'
import { financeApi } from './services/api'

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Housing', 'Food & Dining', 'Groceries', 'Transport',
  'Entertainment', 'Subscriptions', 'Salary', 'Other',
]

const CATEGORY_ICONS = {
  Housing:         'home',
  'Food & Dining': 'restaurant',
  Groceries:       'shopping_cart',
  Transport:       'directions_car',
  Entertainment:   'movie',
  Subscriptions:   'subscriptions',
  Salary:          'payments',
  Other:           'category',
}

const TODAY = new Date()
const CURRENT_MONTH = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}`
const GREETING = (() => {
  const h = TODAY.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})()

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)

const fmtDate = (v) => {
  try {
    return new Date(`${v}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return v }
}

const getInitial = (str) => (str || '?').charAt(0).toUpperCase()

const getBudgetStatus = (pct) => {
  if (pct >= 100) return { label: 'Over Budget', cls: 'over',     fill: 'over'    }
  if (pct >= 80)  return { label: 'Warning',     cls: 'warning',  fill: 'warning' }
  return               { label: 'On Track',      cls: 'on-track', fill: 'safe'    }
}

// ─── Material Symbol Icon ─────────────────────────────────────────────────────
function Icon({ name, style, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined${className ? ' ' + className : ''}`}
      style={style}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}

// ─── Theme hook ──────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('flo-theme') === 'dark' } catch { return false }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('flo-theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  return [dark, () => setDark(d => !d)]
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, toggleTheme] = useTheme()
  const [appState, setAppState] = useState(() => financeApi.getState())
  const [authed, setAuthed]     = useState(() => financeApi.getSession())
  const [tab, setTab]           = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [txModal, setTxModal]         = useState(false)
  const [budgetModal, setBudgetModal] = useState(false)
  const [search, setSearch]           = useState('')
  const [typeFilter, setTypeFilter]   = useState('all')

  const refresh = useCallback(async () => {
    setAppState(await financeApi.loadState())
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const goTab = (t) => { setTab(t); setSidebarOpen(false) }

  // ── Not authenticated → show auth screen ────────────────────────────────
  if (!authed) {
    return (
      <AuthScreen
        dark={dark}
        toggleTheme={toggleTheme}
        onLogin={async (email, password) => {
          try { await financeApi.login(email, password); setAuthed(true); return null }
          catch (err) { return err.message }
        }}
        onRegister={async (name, email, password) => {
          try { await financeApi.register(name, email, password); setAuthed(true); return null }
          catch (err) { return err.message }
        }}
      />
    )
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const currentMonth = appState.transactions.filter(t => t.date.startsWith(CURRENT_MONTH))
  const income   = currentMonth.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0)
  const expenses = currentMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savings  = income - expenses
  const balance  = 24580.20 + income - expenses

  const filteredTx = appState.transactions.filter(t =>
    (typeFilter === 'all' || t.type === typeFilter) &&
    `${t.merchant} ${t.category}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteTx = async (id) => { await financeApi.deleteTransaction(id); refresh() }
  const handleAddTx    = async (item) => { await financeApi.addTransaction(item); await refresh(); setTxModal(false) }
  const handleAddBudget = async (item) => { await financeApi.saveBudget(item); await refresh(); setBudgetModal(false) }

  return (
    <div className="flo-app">

      {/* ── Sidebar ── */}
      <Sidebar
        tab={tab}
        goTab={goTab}
        isOpen={sidebarOpen}
        dark={dark}
        toggleTheme={toggleTheme}
        user={appState.user}
        onAddTx={() => setTxModal(true)}
        onLogout={() => { financeApi.logout(); setAuthed(false) }}
      />

      {/* Scrim (mobile) */}
      {sidebarOpen && (
        <button
          className="flo-scrim"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* ── Mobile header ── */}
      <header className="flo-mobile-header">
        <button className="flo-icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
          <Icon name="menu" />
        </button>
        <div className="flo-mobile-brand">
          <div style={{ width: 26, height: 26, background: 'var(--color-primary)', color: 'var(--color-on-primary)', display: 'grid', placeItems: 'center', fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 14 }}>F</div>
          Flo Finance
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="flo-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <Icon name={dark ? 'light_mode' : 'dark_mode'} />
          </button>
          <button className="flo-btn-primary" onClick={() => setTxModal(true)} style={{ padding: '6px 10px' }}>
            <Icon name="add" style={{ fontSize: 18 }} />
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flo-main">
        <div className="flo-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />
        <div className="flo-main-inner" style={{ position: 'relative', zIndex: 1 }}>

          {tab === 'dashboard' && (
            <DashboardPage
              user={appState.user}
              income={income}
              expenses={expenses}
              savings={savings}
              balance={balance}
              budgets={appState.budgets}
              transactions={appState.transactions}
              currentMonth={currentMonth}
              onAddTx={() => setTxModal(true)}
              onDelete={handleDeleteTx}
              goTab={goTab}
            />
          )}

          {tab === 'transactions' && (
            <TransactionsPage
              transactions={filteredTx}
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              onAddTx={() => setTxModal(true)}
              onDelete={handleDeleteTx}
            />
          )}

          {tab === 'budgets' && (
            <BudgetsPage
              budgets={appState.budgets}
              transactions={currentMonth}
              onAdd={() => setBudgetModal(true)}
            />
          )}

          {tab === 'analytics' && (
            <AnalyticsPage
              income={income}
              expenses={expenses}
              transactions={appState.transactions}
            />
          )}

        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="flo-mobile-nav" aria-label="Main navigation">
        <div className="flo-mobile-nav-inner">
          {[
            ['dashboard',    'dashboard',              'Dashboard'],
            ['transactions', 'receipt_long',           'Transactions'],
            ['budgets',      'account_balance_wallet', 'Budgets'],
            ['analytics',    'analytics',              'Analytics'],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              className={`flo-mobile-nav-item${tab === id ? ' active' : ''}`}
              onClick={() => goTab(id)}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Modals ── */}
      {txModal     && <TransactionModal onClose={() => setTxModal(false)}     onSave={handleAddTx} />}
      {budgetModal && <BudgetModal      onClose={() => setBudgetModal(false)} onSave={handleAddBudget} />}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ tab, goTab, isOpen, dark, toggleTheme, user, onAddTx, onLogout }) {
  const NAV = [
    ['dashboard',    'dashboard',              'Dashboard'],
    ['transactions', 'receipt_long',           'Transactions'],
    ['budgets',      'account_balance_wallet', 'Budgets'],
    ['analytics',    'analytics',              'Analytics'],
  ]

  return (
    <aside className={`flo-sidebar${isOpen ? ' mobile-open' : ''}`}>
      {/* Brand */}
      <div className="flo-sidebar-brand">
        <div className="flo-sidebar-logo">F</div>
        <div>
          <div className="flo-sidebar-brand-name">Flo Finance</div>
          <div className="flo-sidebar-brand-sub">Personal Finance</div>
        </div>
      </div>

      {/* Add Transaction CTA */}
      <button className="flo-add-btn" onClick={onAddTx}>
        <Icon name="add" style={{ fontSize: 16 }} />
        Add Transaction
      </button>

      {/* Navigation */}
      <nav className="flo-sidebar-nav" aria-label="Main navigation">
        {NAV.map(([id, icon, label]) => (
          <button
            key={id}
            className={`flo-nav-item${tab === id ? ' active' : ''}`}
            onClick={() => goTab(id)}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}

        <div className="flo-nav-section">
          <button className="flo-nav-item" onClick={toggleTheme}>
            <Icon name={dark ? 'light_mode' : 'dark_mode'} />
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="flo-nav-item" onClick={onLogout}>
            <Icon name="logout" />
            Logout
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="flo-sidebar-footer">
        <div className="flo-user-row">
          <div className="flo-user-avatar">{getInitial(user?.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flo-user-name">{user?.name || 'User'}</div>
            <div className="flo-user-email">{user?.email || ''}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, iconColor, footer }) {
  return (
    <div className="flo-stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="flo-stat-label">{label}</span>
        <Icon name={icon} className="flo-stat-icon" style={iconColor ? { color: iconColor } : {}} />
      </div>
      <div className="flo-stat-amount">{value}</div>
      {footer && <div style={{ marginTop: 10 }}>{footer}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PANEL
// ─────────────────────────────────────────────────────────────────────────────
function Panel({ title, action, onAction, children, style }) {
  return (
    <div className="flo-panel" style={style}>
      {title && (
        <div className="flo-panel-header">
          <span className="flo-panel-title">{title}</span>
          {action && (
            <button className="flo-text-btn" onClick={onAction}>
              {action} <Icon name="chevron_right" style={{ fontSize: 14 }} />
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
function DashboardPage({ user, income, expenses, savings, balance, budgets, transactions, currentMonth, onAddTx, onDelete, goTab }) {
  const firstName = user?.name?.split(' ')[0] || 'there'

  // Build 6-month bar chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - (5 - i), 1)
      const ms = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const txMonth = transactions.filter(t => t.date.startsWith(ms))
      return {
        label:   d.toLocaleDateString('en-US', { month: 'short' }),
        income:  txMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    })
  }, [transactions])

  const maxChartVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1)
  const recentTx = transactions.slice(0, 5)
  const savingsPct = income > 0 ? Math.max(0, Math.round((savings / income) * 100)) : 0

  return (
    <>
      {/* Header */}
      <div className="flo-page-header">
        <div>
          <div className="flo-eyebrow">
            {TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="flo-page-title">{GREETING}, {firstName}</h1>
          <p className="flo-page-subtitle">
            Here's your financial overview for {TODAY.toLocaleDateString('en-US', { month: 'long' })}.
          </p>
        </div>
        {/* Hidden on mobile (mobile has header button) */}
        <button
          className="flo-btn-primary"
          onClick={onAddTx}
          style={{ flexShrink: 0 }}
        >
          <Icon name="add" style={{ fontSize: 16 }} />
          Add Transaction
        </button>
      </div>

      {/* Stats grid */}
      <div className="flo-stats-grid">
        <StatCard
          label="Total Balance"
          value={fmt(balance)}
          icon="account_balance_wallet"
          footer={
            <span className="flo-stat-badge neutral">
              <Icon name="radio_button_checked" style={{ fontSize: 10 }} /> As of today
            </span>
          }
        />
        <StatCard
          label="Income"
          value={fmt(income)}
          icon="arrow_upward"
          iconColor="#10B981"
          footer={
            <span className="flo-stat-badge positive">
              <Icon name="trending_up" style={{ fontSize: 10 }} /> This month
            </span>
          }
        />
        <StatCard
          label="Expenses"
          value={fmt(expenses)}
          icon="arrow_downward"
          iconColor="#EF4444"
          footer={
            <span className="flo-stat-badge negative">
              <Icon name="trending_down" style={{ fontSize: 10 }} /> This month
            </span>
          }
        />
        <StatCard
          label="Savings"
          value={fmt(Math.max(0, savings))}
          icon="savings"
          footer={
            <div>
              <div className="flo-progress-track" style={{ marginBottom: 4 }}>
                <div className="flo-progress-fill safe" style={{ width: `${Math.min(100, savingsPct)}%` }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-secondary)', textAlign: 'right', fontWeight: 500 }}>
                {savingsPct}% of income
              </div>
            </div>
          }
        />
      </div>

      {/* Charts row */}
      <div className="flo-charts-grid">
        {/* Bar chart */}
        <Panel title="Income vs Expenses">
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div className="flo-legend-item">
                <div className="flo-legend-dot" style={{ background: 'var(--color-primary)' }} /> Income
              </div>
              <div className="flo-legend-item">
                <div className="flo-legend-dot" style={{ background: 'var(--color-outline-variant)', border: '1px solid var(--color-outline)' }} /> Expenses
              </div>
            </div>
            <div className="flo-bar-chart">
              {chartData.map((d, i) => (
                <div key={i} className="flo-bar-group">
                  <div className="flo-bar-pair">
                    <div
                      className="flo-bar income"
                      style={{ height: d.income > 0 ? `${Math.max(4, (d.income / maxChartVal) * 100)}%` : '2px' }}
                      title={`Income: ${fmt(d.income)}`}
                    />
                    <div
                      className="flo-bar expense"
                      style={{ height: d.expense > 0 ? `${Math.max(4, (d.expense / maxChartVal) * 100)}%` : '2px' }}
                      title={`Expenses: ${fmt(d.expense)}`}
                    />
                  </div>
                  <div className="flo-bar-label">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Budget snapshot */}
        <Panel title="Budget Overview" action="View all" onAction={() => goTab('budgets')}>
          {budgets.length === 0 ? (
            <div className="flo-empty" style={{ padding: '32px 20px' }}>
              <Icon name="account_balance_wallet" />
              <p>No budgets yet</p>
            </div>
          ) : (
            <div>
              {budgets.slice(0, 5).map(budget => {
                const spent = currentMonth
                  .filter(t => t.category === budget.category && t.type === 'expense')
                  .reduce((s, t) => s + t.amount, 0)
                const pct = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0
                const { fill } = getBudgetStatus(pct)
                return (
                  <div key={budget.id} style={{ padding: '11px 20px', borderBottom: '1px solid var(--color-outline-variant)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-on-surface)' }}>
                        {budget.category}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(spent)} / {fmt(budget.limit_amount)}
                      </span>
                    </div>
                    <div className="flo-progress-track">
                      <div className={`flo-progress-fill ${fill}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* Recent transactions */}
      <Panel title="Recent Transactions" action="View all" onAction={() => goTab('transactions')}>
        {recentTx.length === 0 ? (
          <div className="flo-empty">
            <Icon name="receipt_long" />
            <h3>No transactions yet</h3>
            <p>Add your first transaction to get started.</p>
          </div>
        ) : (
          <div className="flo-table-wrap">
            <table className="flo-table">
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <TxRow key={tx.id} tx={tx} onDelete={onDelete} showDelete={false} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSACTION ROW
// ─────────────────────────────────────────────────────────────────────────────
function TxRow({ tx, onDelete, showDelete }) {
  const isIncome = tx.type === 'income'
  return (
    <tr>
      <td>
        <div className="flo-merchant-cell">
          <div className={`flo-merchant-avatar${isIncome ? ' income' : ''}`}>
            {isIncome
              ? <Icon name="payments" style={{ fontSize: 14 }} />
              : getInitial(tx.merchant)
            }
          </div>
          <span className="flo-merchant-name">{tx.merchant}</span>
        </div>
      </td>
      <td>
        <span className={`flo-category-badge${isIncome ? ' income' : ''}`}>
          {tx.category}
        </span>
      </td>
      <td>
        <span className="flo-date-cell">{fmtDate(tx.date)}</span>
      </td>
      <td>
        <span className={`flo-amount${isIncome ? ' income' : ' expense'}`}>
          {isIncome ? '+' : '-'}{fmt(tx.amount)}
        </span>
      </td>
      {showDelete && (
        <td style={{ width: 44, textAlign: 'center' }}>
          <button
            className="flo-btn-danger"
            onClick={() => onDelete(tx.id)}
            aria-label={`Delete ${tx.merchant}`}
          >
            <Icon name="delete" style={{ fontSize: 16 }} />
          </button>
        </td>
      )}
    </tr>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSACTIONS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function TransactionsPage({ transactions, search, setSearch, typeFilter, setTypeFilter, onAddTx, onDelete }) {
  return (
    <>
      <div className="flo-page-header">
        <div>
          <h1 className="flo-page-title">Transactions</h1>
          <p className="flo-page-subtitle">Manage and track all your financial activity.</p>
        </div>
        <button className="flo-btn-primary" onClick={onAddTx} style={{ flexShrink: 0 }}>
          <Icon name="add" style={{ fontSize: 16 }} />
          Add Transaction
        </button>
      </div>

      <div className="flo-panel">
        {/* Toolbar */}
        <div className="flo-toolbar">
          <div className="flo-search">
            <Icon name="search" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions…"
            />
          </div>
          <select
            className="flo-filter-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-secondary)', fontWeight: 500, letterSpacing: '0.04em' }}>
            {transactions.length} ENTR{transactions.length !== 1 ? 'IES' : 'Y'}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="flo-empty">
            <Icon name="search_off" />
            <h3>No transactions found</h3>
            <p>{search ? 'Try a different search term.' : 'Add your first transaction above.'}</p>
          </div>
        ) : (
          <div className="flo-table-wrap">
            <table className="flo-table">
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th style={{ width: 44 }}></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <TxRow key={tx.id} tx={tx} onDelete={onDelete} showDelete />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUDGETS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function BudgetsPage({ budgets, transactions, onAdd }) {
  const totalAllocated = budgets.reduce((s, b) => s + b.limit_amount, 0)
  const totalSpent = budgets.reduce((s, b) => {
    return s + transactions
      .filter(t => t.category === b.category && t.type === 'expense')
      .reduce((ss, t) => ss + t.amount, 0)
  }, 0)
  const remaining  = totalAllocated - totalSpent
  const overallPct = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

  return (
    <>
      <div className="flo-page-header">
        <div>
          <h1 className="flo-page-title">Budgets</h1>
          <p className="flo-page-subtitle">Stay on track with your monthly spending limits.</p>
        </div>
        <button className="flo-btn-primary" onClick={onAdd} style={{ flexShrink: 0 }}>
          <Icon name="add" style={{ fontSize: 16 }} />
          Create Budget
        </button>
      </div>

      {/* Summary strip */}
      {budgets.length > 0 && (
        <div className="flo-budget-summary">
          <div className="flo-budget-summary-grid">
            <div className="flo-budget-summary-item">
              <div className="flo-budget-summary-label">Total Allocated</div>
              <div className="flo-budget-summary-value">{fmt(totalAllocated)}</div>
            </div>
            <div className="flo-budget-summary-item">
              <div className="flo-budget-summary-label">Total Spent</div>
              <div className="flo-budget-summary-value">{fmt(totalSpent)}</div>
            </div>
            <div className="flo-budget-summary-item">
              <div className="flo-budget-summary-label">Remaining</div>
              <div className={`flo-budget-summary-value${remaining >= 0 ? ' positive' : ''}`}>
                {fmt(Math.abs(remaining))}
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--color-secondary)', fontWeight: 500 }}>
              <span>{Math.round(overallPct)}% of total budget spent</span>
            </div>
            <div className="flo-progress-track" style={{ height: 6 }}>
              <div
                className={`flo-progress-fill ${overallPct >= 100 ? 'over' : overallPct >= 80 ? 'warning' : 'safe'}`}
                style={{ width: `${Math.min(100, overallPct)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div className="flo-panel">
          <div className="flo-empty">
            <Icon name="account_balance_wallet" />
            <h3>No budgets yet</h3>
            <p>Create your first budget to start tracking spending.</p>
          </div>
        </div>
      ) : (
        <div className="flo-budgets-grid">
          {budgets.map(budget => {
            const spent = transactions
              .filter(t => t.category === budget.category && t.type === 'expense')
              .reduce((s, t) => s + t.amount, 0)
            const pct  = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0
            const left = budget.limit_amount - spent
            const { label, cls, fill } = getBudgetStatus(pct)

            return (
              <div key={budget.id} className="flo-budget-card">
                <div className="flo-budget-card-header">
                  <div className="flo-budget-category">
                    <div className="flo-budget-icon">
                      <Icon name={CATEGORY_ICONS[budget.category] || 'category'} />
                    </div>
                    <span className="flo-budget-name">{budget.category}</span>
                  </div>
                  <span className={`flo-budget-status ${cls}`}>{label}</span>
                </div>

                <div className="flo-budget-amounts">
                  <span className={`flo-budget-spent${cls === 'over' ? ' over' : ''}`}>
                    {fmt(spent)}
                  </span>
                  <span className="flo-budget-limit">/ {fmt(budget.limit_amount)}</span>
                </div>

                <div className="flo-progress-track">
                  <div className={`flo-progress-fill ${fill}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>

                <div className="flo-budget-footer">
                  <span>{Math.round(pct)}% spent</span>
                  <span style={{ color: left < 0 ? '#EF4444' : 'var(--color-on-surface)', fontWeight: 600 }}>
                    {left >= 0 ? `${fmt(left)} left` : `${fmt(Math.abs(left))} over`}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Add placeholder */}
          <button className="flo-budget-add-card" onClick={onAdd}>
            <Icon name="add" />
            <span>Add Category Budget</span>
          </button>
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  ANALYTICS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function AnalyticsPage({ income, expenses, transactions }) {
  const currentMonthTransactions = useMemo(() =>
    transactions.filter(t => t.date && t.date.startsWith(CURRENT_MONTH))
  , [transactions])

  const byCategory = useMemo(() =>
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => ({ ...acc, [t.category]: (acc[t.category] || 0) + Number(t.amount || 0) }), {})
  , [currentMonthTransactions])

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const maxCat = sorted[0]?.[1] || 1

  const trend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - (5 - i), 1)
      const ms = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const txMonth = transactions.filter(t => t.date && t.date.startsWith(ms))
      return {
        label:   d.toLocaleDateString('en-US', { month: 'short' }),
        income:  txMonth.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0),
        expense: txMonth.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0),
      }
    })
  }, [transactions])

  const maxTrend = Math.max(...trend.map(d => Math.max(d.income, d.expense)), 1)

  return (
    <>
      <div className="flo-page-header">
        <div>
          <h1 className="flo-page-title">Analytics</h1>
          <p className="flo-page-subtitle">Understand your spending patterns over time.</p>
        </div>
      </div>

      <div className="flo-analytics-grid">
        {/* Health callout */}
        <div className="flo-analytics-callout">
          <div className="flo-eyebrow" style={{ color: 'inherit', opacity: 0.7 }}>Financial health</div>
          <h2>{income >= expenses ? 'You are on track.' : 'Time to review spending.'}</h2>
          <p>
            Your income is {fmt(Math.abs(income - expenses))}{' '}
            {income >= expenses ? 'higher' : 'lower'} than your expenses this month.
          </p>
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Income', income], ['Expenses', expenses]].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.7, marginBottom: 4, textTransform: 'uppercase' }}>
                  {label}
                </div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {fmt(val)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spending by category */}
        <Panel title="Spending by Category">
          <div className="flo-panel-body">
            {sorted.length === 0 ? (
              <div className="flo-empty" style={{ padding: '24px 0' }}>
                <Icon name="pie_chart" />
                <p>No expense data yet for this month</p>
              </div>
            ) : (
              sorted.map(([cat, val]) => (
                <div key={cat} className="flo-analytics-row">
                  <span className="flo-analytics-row-label">{cat}</span>
                  <span className="flo-analytics-row-amount">{fmt(val)}</span>
                  <div className="flo-analytics-row-bar">
                    <div className="flo-analytics-row-fill" style={{ width: `${(val / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* 6-month trend */}
      <Panel title="6-Month Trend" style={{ marginTop: 12 }}>
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <div className="flo-legend-item">
              <div className="flo-legend-dot" style={{ background: 'var(--color-primary)' }} /> Income
            </div>
            <div className="flo-legend-item">
              <div className="flo-legend-dot" style={{ background: 'var(--color-outline-variant)', border: '1px solid var(--color-outline)' }} /> Expenses
            </div>
          </div>
          <div className="flo-bar-chart">
            {trend.map((d, i) => (
              <div key={i} className="flo-bar-group">
                <div className="flo-bar-pair" style={{ height: 160 }}>
                  <div
                    className="flo-bar income"
                    style={{ height: d.income > 0 ? `${Math.max(4, (d.income / maxTrend) * 100)}%` : '2px' }}
                    title={`Income: ${fmt(d.income)}`}
                  />
                  <div
                    className="flo-bar expense"
                    style={{ height: d.expense > 0 ? `${Math.max(4, (d.expense / maxTrend) * 100)}%` : '2px' }}
                    title={`Expenses: ${fmt(d.expense)}`}
                  />
                </div>
                <div className="flo-bar-label">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, onRegister, dark, toggleTheme }) {
  const [isReg,    setIsReg]    = useState(false)
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('mayank@gmail.com')
  const [password, setPassword] = useState('demo')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const submit = async () => {
    setError('')
    if (!email.trim() || !password.trim()) { setError('Please fill in all required fields.'); return }
    if (isReg && !name.trim()) { setError('Please enter your name.'); return }
    setLoading(true)
    const err = isReg
      ? await onRegister(name.trim(), email.trim(), password)
      : await onLogin(email.trim(), password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="flo-auth-screen">
      <button
        className="flo-theme-toggle"
        onClick={toggleTheme}
        style={{ position: 'absolute', top: 20, right: 20 }}
      >
        <Icon name={dark ? 'light_mode' : 'dark_mode'} style={{ fontSize: 15 }} />
        {dark ? 'Light' : 'Dark'}
      </button>

      <div className="flo-auth-card">
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
          <div className="flo-auth-logo">F</div>
          <div>
            <h1 className="flo-auth-title">Flo Finance</h1>
            <p className="flo-auth-subtitle">
              {isReg ? 'Create your account to get started.' : 'Welcome back. Sign in to continue.'}
            </p>
          </div>
        </div>

        {error && <div className="flo-auth-error">{error}</div>}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isReg && (
            <div className="flo-field">
              <label className="flo-label">Full Name</label>
              <input className="flo-input" type="text" value={name}
                onChange={e => setName(e.target.value)} placeholder="e.g. Mayank Dobhal"
                autoComplete="name" onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          )}
          <div className="flo-field">
            <label className="flo-label">Email Address</label>
            <input className="flo-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="user@domain.com"
              autoComplete="email" onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div className="flo-field">
            <label className="flo-label">Password</label>
            <input className="flo-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              autoComplete={isReg ? 'new-password' : 'current-password'}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
        </div>

        <button
          className="flo-btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '13px 18px', fontSize: 13, letterSpacing: '0.08em' }}
          onClick={submit}
          disabled={loading}
        >
          {loading
            ? 'Please wait…'
            : <>{isReg ? 'Create Account' : 'Sign In'} <Icon name="arrow_forward" style={{ fontSize: 16 }} /></>
          }
        </button>

        <button
          className="flo-auth-switch"
          onClick={() => { setIsReg(r => !r); setError('') }}
        >
          {isReg
            ? <>Already have an account? <strong>Sign in</strong></>
            : <>New to Flo? <strong>Create an account</strong></>
          }
        </button>

        {!isReg && (
          <span className="flo-demo-hint">Demo: mayank@gmail.com / any password</span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSACTION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function TransactionModal({ onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    merchant: '', category: 'Food & Dining', amount: '', type: 'expense', date: today,
  })
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.merchant.trim()) { setError('Please enter a merchant name.'); return }
    if (!form.amount || Number(form.amount) <= 0) { setError('Please enter a valid amount.'); return }
    onSave({ ...form, amount: Number(form.amount) })
  }

  return (
    <div className="flo-modal-backdrop" onClick={onClose}>
      <div className="flo-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add Transaction">
        <div className="flo-modal-header">
          <span className="flo-modal-title">Add Transaction</span>
          <button className="flo-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" style={{ fontSize: 20 }} /></button>
        </div>

        <div className="flo-modal-body">
          {error && <div className="flo-auth-error">{error}</div>}

          {/* Type toggle */}
          <div className="flo-field">
            <label className="flo-label">Type</label>
            <div className="flo-type-toggle">
              <button
                className={`flo-type-btn${form.type === 'expense' ? ' active expense' : ''}`}
                onClick={() => set('type', 'expense')}
              >
                <Icon name="arrow_downward" style={{ fontSize: 14, marginRight: 4 }} /> Expense
              </button>
              <button
                className={`flo-type-btn${form.type === 'income' ? ' active income' : ''}`}
                onClick={() => set('type', 'income')}
              >
                <Icon name="arrow_upward" style={{ fontSize: 14, marginRight: 4 }} /> Income
              </button>
            </div>
          </div>

          <div className="flo-field">
            <label className="flo-label">Merchant / Description</label>
            <input className="flo-input" type="text" value={form.merchant}
              onChange={e => set('merchant', e.target.value)} placeholder="e.g. Starbucks" />
          </div>

          <div className="flo-form-row">
            <div className="flo-field">
              <label className="flo-label">Amount</label>
              <input className="flo-input" type="number" min="0" step="0.01"
                value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
            </div>
            <div className="flo-field">
              <label className="flo-label">Date</label>
              <input className="flo-input" type="date" value={form.date}
                onChange={e => set('date', e.target.value)} />
            </div>
          </div>

          <div className="flo-field">
            <label className="flo-label">Category</label>
            <select className="flo-select" value={form.category}
              onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flo-modal-footer">
          <button className="flo-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="flo-btn-primary" onClick={handleSave}>Save Transaction</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUDGET MODAL
// ─────────────────────────────────────────────────────────────────────────────
function BudgetModal({ onClose, onSave }) {
  const [form, setForm] = useState({ category: 'Food & Dining', limit_amount: '' })
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.limit_amount || Number(form.limit_amount) <= 0) {
      setError('Please enter a valid budget limit.')
      return
    }
    onSave({ ...form, limit_amount: Number(form.limit_amount) })
  }

  return (
    <div className="flo-modal-backdrop" onClick={onClose}>
      <div className="flo-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create Budget">
        <div className="flo-modal-header">
          <span className="flo-modal-title">Create Budget</span>
          <button className="flo-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" style={{ fontSize: 20 }} /></button>
        </div>

        <div className="flo-modal-body">
          {error && <div className="flo-auth-error">{error}</div>}

          <div className="flo-field">
            <label className="flo-label">Category</label>
            <select className="flo-select" value={form.category}
              onChange={e => set('category', e.target.value)}>
              {CATEGORIES.filter(c => c !== 'Salary').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="flo-field">
            <label className="flo-label">Monthly Limit</label>
            <input className="flo-input" type="number" min="0" step="0.01"
              value={form.limit_amount} onChange={e => set('limit_amount', e.target.value)} placeholder="0.00" />
          </div>
        </div>

        <div className="flo-modal-footer">
          <button className="flo-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="flo-btn-primary" onClick={handleSave}>Create Budget</button>
        </div>
      </div>
    </div>
  )
}
