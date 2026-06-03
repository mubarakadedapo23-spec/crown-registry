import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";

// GET /api/messages — list conversations
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: session.user.id, leftAt: null } },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, avatar: true, isOnline: true, lastSeenAt: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true, content: true, messageType: true,
          createdAt: true, senderId: true,
        },
      },
    },
  });

  // Annotate with unread count for current user
  const annotated = conversations.map((conv) => {
    const me = conv.participants.find((p) => p.userId === session.user!.id);
    const others = conv.participants.filter((p) => p.userId !== session.user!.id);
    return {
      ...conv,
      unreadCount: me?.unreadCount ?? 0,
      otherParticipants: others.map((p) => p.user),
    };
  });

  return NextResponse.json(annotated);
}

// POST /api/messages — start a new conversation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await rateLimit(`msg-create:${session.user.id}`, 20, 60);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await req.json();
  const { recipientId, listingId, message } = body;

  if (!recipientId || !message) {
    return NextResponse.json({ error: "recipientId and message are required" }, { status: 400 });
  }

  if (recipientId === session.user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Check if conversation already exists between these two users for this listing
  const existing = await prisma.conversation.findFirst({
    where: {
      ...(listingId ? { listingId } : {}),
      participants: {
        every: { userId: { in: [session.user.id, recipientId] } },
      },
    },
    include: { participants: true },
  });

  if (existing && existing.participants.length === 2) {
    // Add message to existing conversation
    await prisma.message.create({
      data: {
        conversationId: existing.id,
        senderId: session.user.id,
        content: message,
        messageType: "text",
      },
    });
    await prisma.conversation.update({
      where: { id: existing.id },
      data: { lastMessageAt: new Date() },
    });
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: existing.id, userId: recipientId },
      data: { unreadCount: { increment: 1 } },
    });
    return NextResponse.json({ conversationId: existing.id });
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      listingId: listingId ?? null,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: session.user.id },
          { userId: recipientId, unreadCount: 1 },
        ],
      },
      messages: {
        create: {
          senderId: session.user.id,
          content: message,
          messageType: "text",
        },
      },
    },
  });

  // Notify recipient
  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "message",
      title: "New Message",
      body: "You have a new message",
      data: { conversationId: conversation.id },
    },
  });

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
