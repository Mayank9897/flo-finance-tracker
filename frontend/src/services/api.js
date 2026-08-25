const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'flo-auth-token'

const seedState = {
  user: { id: 1, name: 'Mayank Dobhal', email: 'mayank@gmail.com' },
  transactions: [
    { id: 1, type: 'income', merchant: 'Monthly Salary', category: 'Salary', date: '2026-08-01', amount: 65000 },
    { id: 2, type: 'expense', merchant: 'Apartment Rent', category: 'Housing', date: '2026-08-03', amount: 18000 },
    { id: 3, type: 'expense', merchant: 'Supermarket Groceries', category: 'Groceries', date: '2026-08-10', amount: 5400 },
    { id: 4, type: 'expense', merchant: 'Dinner & Cafe', category: 'Food & Dining', date: '2026-08-15', amount: 3200 },
    { id: 5, type: 'expense', merchant: 'Fuel & Commute', category: 'Transport', date: '2026-08-18', amount: 2800 },
    { id: 6, type: 'expense', merchant: 'Software & Streaming', category: 'Subscriptions', date: '2026-08-20', amount: 1499 },

    { id: 7, type: 'income', merchant: 'Monthly Salary', category: 'Salary', date: '2026-07-01', amount: 62000 },
    { id: 8, type: 'expense', merchant: 'Apartment Rent', category: 'Housing', date: '2026-07-03', amount: 18000 },
    { id: 9, type: 'expense', merchant: 'Weekly Groceries', category: 'Groceries', date: '2026-07-12', amount: 4800 },
    { id: 10, type: 'expense', merchant: 'Restaurants', category: 'Food & Dining', date: '2026-07-18', amount: 4100 },

    { id: 11, type: 'income', merchant: 'Monthly Salary', category: 'Salary', date: '2026-06-01', amount: 60000 },
    { id: 12, type: 'expense', merchant: 'Apartment Rent', category: 'Housing', date: '2026-06-03', amount: 18000 },
    { id: 13, type: 'expense', merchant: 'Weekend Trip', category: 'Entertainment', date: '2026-06-15', amount: 6500 },

    { id: 14, type: 'income', merchant: 'Monthly Salary', category: 'Salary', date: '2026-05-01', amount: 60000 },
    { id: 15, type: 'expense', merchant: 'Apartment Rent', category: 'Housing', date: '2026-05-03', amount: 18000 },
    { id: 16, type: 'expense', merchant: 'Monthly Supplies', category: 'Groceries', date: '2026-05-14', amount: 5100 },

    { id: 17, type: 'income', merchant: 'Monthly Salary', category: 'Salary', date: '2026-04-01', amount: 58000 },
    { id: 18, type: 'expense', merchant: 'Apartment Rent', category: 'Housing', date: '2026-04-03', amount: 18000 },

    { id: 19, type: 'income', merchant: 'Monthly Salary', category: 'Salary', date: '2026-03-01', amount: 58000 },
    { id: 20, type: 'expense', merchant: 'Apartment Rent', category: 'Housing', date: '2026-03-03', amount: 18000 }
  ],
  budgets: [
    { id: 1, category: 'Housing', limit_amount: 20000 },
    { id: 2, category: 'Food & Dining', limit_amount: 5000 },
    { id: 3, category: 'Groceries', limit_amount: 7000 },
    { id: 4, category: 'Transport', limit_amount: 4000 },
    { id: 5, category: 'Entertainment', limit_amount: 6000 }
  ]
}

const localState = () => {
  try {
    return JSON.parse(localStorage.getItem('flo-finance-state')) || seedState
  } catch {
    return seedState
  }
}

const saveLocal = state => {
  localStorage.setItem('flo-finance-state', JSON.stringify(state))
  return state
}

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers
    }
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.message || 'Request failed')
  return body
}

const getToken = () => localStorage.getItem(TOKEN_KEY)
const fallback = (operation, localOperation) => operation().catch(() => localOperation())

export const financeApi = {
  getState: () => localState(),
  getSession: () => Boolean(getToken() || localStorage.getItem('flo-finance-session')),
  loadState: () => fallback(async () => {
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const [profile, transactions, budgets] = await Promise.all([
      request('/auth/me'),
      request('/transactions'),
      request(`/budgets?month=${currentMonth}`)
    ])
    return { user: profile.user, transactions, budgets }
  }, async () => localState()),

  login: async (email, password) => fallback(async () => {
    const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem(TOKEN_KEY, result.token)
    return result.user
  }, async () => {
    const state = localState()
    if (email.trim().toLowerCase() !== state.user.email) throw new Error('Use mayank@gmail.com for the demo account.')
    localStorage.setItem('flo-finance-session', 'active')
    return state.user
  }),

  register: async (name, email, password) => fallback(async () => {
    const result = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
    localStorage.setItem(TOKEN_KEY, result.token)
    return result.user
  }, async () => {
    const state = localState()
    state.user = { ...state.user, name: name.trim() || 'New user', email: email.trim().toLowerCase() }
    saveLocal(state)
    localStorage.setItem('flo-finance-session', 'active')
    return state.user
  }),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('flo-finance-session')
  },

  addTransaction: transaction => fallback(
    () => request('/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
    async () => {
      const state = localState()
      const item = { ...transaction, id: Date.now(), amount: Number(transaction.amount) }
      state.transactions.unshift(item)
      saveLocal(state)
      return item
    }
  ),

  deleteTransaction: id => fallback(
    () => request(`/transactions/${id}`, { method: 'DELETE' }),
    async () => {
      const state = localState()
      state.transactions = state.transactions.filter(item => item.id !== id)
      saveLocal(state)
    }
  ),

  saveBudget: budget => fallback(
    () => {
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      return request('/budgets', { method: 'POST', body: JSON.stringify({ ...budget, month: currentMonth }) })
    },
    async () => {
      const state = localState()
      const item = { ...budget, id: Date.now(), limit_amount: Number(budget.limit_amount) }
      state.budgets.unshift(item)
      saveLocal(state)
      return item
    }
  ),
}