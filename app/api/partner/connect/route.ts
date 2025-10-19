import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnerEmail } = body;

    if (!userId || !partnerEmail) {
      return NextResponse.json(
        { error: 'User ID and partner email are required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a partner
    if (user.partnerId) {
      return NextResponse.json(
        { error: 'You are already connected to a partner' },
        { status: 400 }
      );
    }

    // Find partner by email
    const partner = await prisma.user.findUnique({
      where: { email: partnerEmail },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found with that email' },
        { status: 404 }
      );
    }

    // Check if partner already has a connection
    if (partner.partnerId) {
      return NextResponse.json(
        { error: 'This user is already connected to someone else' },
        { status: 400 }
      );
    }

    // Validate last name matches
    if (user.lastName.toLowerCase() !== partner.lastName.toLowerCase()) {
      return NextResponse.json(
        { error: 'Last names do not match. You must have the same last name to connect.' },
        { status: 400 }
      );
    }

    // Check if request already exists
    const existingRequest = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: partner.id },
          { senderId: partner.id, receiverId: userId },
        ],
        status: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A connection request already exists between you and this user' },
        { status: 400 }
      );
    }

    // Create pending connection request
    await prisma.connectionRequest.create({
      data: {
        senderId: userId,
        receiverId: partner.id,
        status: 'pending',
      },
    });

    return NextResponse.json({
      message: `Connection request sent to ${partner.firstName} ${partner.lastName}`
    });
  } catch (error) {
    console.error('Partner connection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
