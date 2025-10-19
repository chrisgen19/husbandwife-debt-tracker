# Debt Tracker

A simple Next.js app for tracking debts between you and your wife.

## Features

- User authentication (2 users: husband and wife)
- Add debt/expense entries with description and amount
- Track who paid and who owes
- View current balance summary
- Mark items as paid
- View payment history
- Responsive design

## Getting Started

### Prerequisites

- Node.js installed
- PostgreSQL database running on `localhost:5432`
- Database named `debttracker` created
- PostgreSQL user with credentials: `myuser` / `mypassword`

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your database connection in `.env`:
```
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/debttracker"
```

3. Run database migrations:
```bash
npx prisma migrate deploy
```

4. Seed the database with initial users:
```bash
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Login Credentials

**Husband:**
- Username: `husband`
- Password: `password123`

**Wife:**
- Username: `wife`
- Password: `password123`

## How to Use

1. Log in with your credentials
2. View your current balance (how much you owe or are owed)
3. Click "Add New" to record a new expense:
   - Enter description (e.g., "Groceries", "Dinner")
   - Enter amount
   - Select who paid for it
4. View all unpaid items in the main section
5. Click "Mark Paid" when an item is settled
6. Check payment history at the bottom

## Database

This app uses PostgreSQL with Prisma ORM. The database schema includes:

- **User** table: Stores user credentials and information
- **DebtItem** table: Stores all debt/expense entries

### Database Commands

- **Reset database**: `npx prisma migrate reset` (drops all data and re-runs migrations)
- **Generate Prisma client**: `npx prisma generate`
- **Open Prisma Studio**: `npx prisma studio` (GUI to view/edit database)
- **Seed database**: `npm run db:seed`

## Notes

- Currency is displayed in Philippine Peso (₱) with comma formatting
- Data is persisted in PostgreSQL database
- In production, use proper password hashing (bcrypt, argon2) and session management
- Consider using environment variables for different database connections (dev/prod)
