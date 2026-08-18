import { getLiveblocks, getUserColor } from "@/lib/liveblocks";
import { prisma } from "@/lib/prisma";
import { isEmailCollaborator } from "@/lib/project-collaborators";
import { getCurrentProjectIdentity } from "@/lib/project-access";
import { hasClerk } from "@/lib/runtime";

export async function POST(request: Request) {
  const identity = await getCurrentProjectIdentity();

  if (!identity.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Resolve display info — Clerk when configured, guest identity otherwise.
  let name = identity.primaryEmailAddress ?? "Guest";
  let avatar = "";
  if (hasClerk()) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      name = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? name;
      avatar = user?.imageUrl ?? "";
    } catch {
      // fall through with identity defaults
    }
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

  const isOwner = project.ownerId === identity.userId;
  const email = identity.primaryEmailAddress;
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

  const color = getUserColor(identity.userId);

  const session = lb.prepareSession(identity.userId, {
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
