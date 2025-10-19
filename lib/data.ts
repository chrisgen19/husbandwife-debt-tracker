export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
}

export interface DebtItem {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // user id who paid
  owedBy: string; // user id who owes
  isPaid: boolean;
  createdAt: Date;
  paidAt?: Date;
}

// Simple in-memory storage (for demo purposes)
// In production, you'd use a real database
let users: User[] = [
  {
    id: '1',
    name: 'Husband',
    username: 'husband',
    password: 'password123', // In production, use hashed passwords
  },
  {
    id: '2',
    name: 'Wife',
    username: 'wife',
    password: 'password123',
  },
];

let debtItems: DebtItem[] = [];
let nextId = 1;

export const db = {
  // User operations
  getUsers: () => users,
  getUserByUsername: (username: string) =>
    users.find(u => u.username === username),
  getUserById: (id: string) =>
    users.find(u => u.id === id),

  // Debt operations
  getDebts: () => debtItems,
  getUnpaidDebts: () => debtItems.filter(d => !d.isPaid),
  addDebt: (debt: Omit<DebtItem, 'id' | 'createdAt'>) => {
    const newDebt: DebtItem = {
      ...debt,
      id: (nextId++).toString(),
      createdAt: new Date(),
    };
    debtItems.push(newDebt);
    return newDebt;
  },
  markAsPaid: (id: string) => {
    const debt = debtItems.find(d => d.id === id);
    if (debt) {
      debt.isPaid = true;
      debt.paidAt = new Date();
    }
    return debt;
  },
  markAsUnpaid: (id: string) => {
    const debt = debtItems.find(d => d.id === id);
    if (debt) {
      debt.isPaid = false;
      debt.paidAt = undefined;
    }
    return debt;
  },
  deleteDebt: (id: string) => {
    debtItems = debtItems.filter(d => d.id !== id);
  },
};

export function calculateBalance(userId: string): number {
  return debtItems.reduce((balance, debt) => {
    if (debt.isPaid) return balance;

    if (debt.paidBy === userId) {
      return balance + debt.amount; // They are owed
    } else if (debt.owedBy === userId) {
      return balance - debt.amount; // They owe
    }
    return balance;
  }, 0);
}
