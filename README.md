# Flo Finance Tracker

Flo is a full-stack personal finance management application for understanding spending, tracking income, and building healthier monthly money habits. It combines a polished black-and-neutral Shadcn-inspired dashboard with a JWT-secured REST API and persistent finance data.

## Core Functionality

- Secure user registration and login with JWT authentication
- Personalized finance workspace with responsive desktop and mobile navigation
- Dashboard summary for total balance, monthly income, expenses, and savings rate
- Indian rupee (INR) currency formatting throughout the application
- Add and delete income or expense transactions
- Transaction search and filtering by income or expense type
- Categorized transactions with merchant, date, amount, and description details
- Monthly category budgets with spending totals and progress indicators
- Budget creation for housing, food, transport, entertainment, subscriptions, and other categories
- Cash-flow visualization across the previous twelve months
- Spending analytics grouped by category
- Financial health summary based on income and expenses
- Persistent JSON data storage for users, transactions, and budgets
- Responsive layout optimized for desktop and mobile screens

## Application Architecture

### Frontend

The React single-page application provides the authenticated finance workspace, dashboard views, forms, navigation, responsive layouts, and data visualization. The frontend service layer communicates with the backend REST API and supports local fallback data for offline previews.

### Backend

The Express REST API manages authentication, user access, transactions, budgets, and analytics. JWT middleware protects private resources, while bcryptjs handles password hashing. The current persistence layer stores application data in `flo_data.json` through a small Node.js file-storage module.

## Tech Stack

### Frontend

- React 18
- Vite
- JavaScript (JSX)
- Lucide React
- Responsive CSS with design tokens
- Fetch API
- `Intl.NumberFormat` for INR formatting

### Backend

- Node.js
- Express.js
- JSON Web Tokens with `jsonwebtoken`
- Password hashing with `bcryptjs`
- CORS
- Dotenv
- Node.js `fs` file persistence

### Development and Tooling

- npm workspaces-style frontend/backend structure
- Vite production bundling
- Nodemon development server
- Concurrently for running project services

## Project Structure

```text
flo-finance-tracker/
├── backend/
│   ├── config/db.js
│   ├── server.js
│   ├── utils/jwt.js
│   ├── utils/password.js
│   └── package.json
├── frontend/
│   ├── src/App.jsx
│   ├── src/services/api.js
│   ├── src/styles/index.css
│   ├── vite.config.js
│   └── package.json
├── flo_data.json
└── package.json
```