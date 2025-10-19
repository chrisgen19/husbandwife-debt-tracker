import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isPaid } = body;

    if (isPaid === undefined) {
      return NextResponse.json(
        { error: 'Missing isPaid field' },
        { status: 400 }
      );
    }

    const debt = await prisma.debtItem.update({
      where: { id },
      data: {
        isPaid,
        paidAt: isPaid ? new Date() : null,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.debtItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
