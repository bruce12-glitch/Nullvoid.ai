import { currentUser } from "@clerk/nextjs/server";
import { getLiveblocks, getUserColor } from "@/lib/liveblocks";
import { prisma } from "@/lib/prisma";
import { isEmailCollaborator } from "@/lib/project-collaborators";

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user || !user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  let room: string;
  try {
    const body = await request.json();
    room = body.room;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!room || typeof room !== "string") {
    return new Response("Bad Request", { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: room },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return new Response("Forbidden", { status: 403 });
  }

  const isOwner = project.ownerId === user.id;
  const email = user.primaryEmailAddress?.emailAddress;
  const isCollab = !isOwner && email ? await isEmailCollaborator(room, email) : false;

  if (!isOwner && !isCollab) {
    return new Response("Forbidden", { status: 403 });
  }

  const lb = getLiveblocks();

  try {
    await lb.getOrCreateRoom(room, { defaultAccesses: [] });
  } catch {
    return new Response("Failed to access Liveblocks room", { status: 502 });
  }

  const name =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Anonymous";
  const avatar = user?.imageUrl ?? "";
  const color = getUserColor(user.id);

  const session = lb.prepareSession(user.id, {
    userInfo: { name, avatar, color },
  });

  session.allow(room, session.FULL_ACCESS);

  try {
    const { status, body } = await session.authorize();
    return new Response(body, { status });
  } catch {
    return new Response("Authorization failed", { status: 502 });
  }
}
