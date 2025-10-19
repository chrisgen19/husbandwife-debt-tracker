import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const debts = await prisma.debtItem.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ debts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount, paidBy, owedBy, paymentTerms, installmentMonths } = body;

    if (!description || !amount || !paidBy || !owedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If payment is straight (not installment), create a single debt item
    if (paymentTerms === 'straight' || !paymentTerms) {
      const debt = await prisma.debtItem.create({
        data: {
          description,
          amount: parseFloat(amount),
          paidBy,
          owedBy,
          isPaid: false,
        },
      });
      return NextResponse.json({ debt });
    }

    // If payment is installment, create multiple debt items
    const months = parseInt(installmentMonths) || 3;
    const totalAmount = parseFloat(amount);
    const amountPerMonth = totalAmount / months;
    const installmentGroup = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const debts = [];
    for (let i = 0; i < months; i++) {
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + i);

      const debt = await prisma.debtItem.create({
        data: {
          description: `${description} (${i + 1}/${months})`,
          amount: amountPerMonth,
          paidBy,
          owedBy,
          isPaid: false,
          isInstallment: true,
          installmentGroup,
          installmentMonth: i + 1,
          totalInstallments: months,
          dueDate,
        },
      });
      debts.push(debt);
    }

    return NextResponse.json({ debts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
