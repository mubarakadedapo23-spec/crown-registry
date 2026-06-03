import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";

// GET /api/messages/[id] — get messages in a conversation
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
  });

  if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark as read
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
    data: { unreadCount: 0, lastReadAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: {
      conversationId: params.id,
      isDeleted: false,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return NextResponse.json({
    messages: messages.reverse(),
    hasMore,
    nextCursor: hasMore ? messages[0]?.createdAt.toISOString() : null,
  });
}

// POST /api/messages/[id] — send message in conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await rateLimit(`msg-send:${session.user.id}`, 30, 60);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
  });

  if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { content, messageType = "text", attachments } = await req.json();

  if (!content && !attachments) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: params.id,
      senderId: session.user.id,
      content,
      messageType,
      attachments,
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  // Update conversation + other participants' unread counts
  await prisma.conversation.update({
    where: { id: params.id },
    data: { lastMessageAt: new Date() },
  });

  await prisma.conversationParticipant.updateMany({
    where: { conversationId: params.id, userId: { not: session.user.id } },
    data: { unreadCount: { increment: 1 } },
  });

  return NextResponse.json(message, { status: 201 });
}
