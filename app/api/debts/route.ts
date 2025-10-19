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
    const { description, amount, paidBy, owedBy } = body;

    if (!description || !amount || !paidBy || !owedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
