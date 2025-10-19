import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, action } = body; // action: "accept" or "reject"

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be either "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Get the connection request
    const connectionRequest = await prisma.connectionRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!connectionRequest) {
      return NextResponse.json(
        { error: 'Connection request not found' },
        { status: 404 }
      );
    }

    if (connectionRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      );
    }

    if (action === 'reject') {
      // Just update the request status to rejected
      await prisma.connectionRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      return NextResponse.json({
        message: 'Connection request rejected'
      });
    }

    // Accept the request - connect both users
    await prisma.$transaction([
      // Update sender's partnerId
      prisma.user.update({
        where: { id: connectionRequest.senderId },
        data: { partnerId: connectionRequest.receiverId },
      }),
      // Update receiver's partnerId
      prisma.user.update({
        where: { id: connectionRequest.receiverId },
        data: { partnerId: connectionRequest.senderId },
      }),
      // Update request status
      prisma.connectionRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' },
      }),
    ]);

    // Return updated user (receiver) with partner info
    const updatedUser = await prisma.user.findUnique({
      where: { id: connectionRequest.receiverId },
      include: {
        partner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Partner response error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
