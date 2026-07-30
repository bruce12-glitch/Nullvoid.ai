import { currentUser } from "@clerk/nextjs/server";
import { getLiveblocks, getUserColor } from "@/lib/liveblocks";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user || !user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = await request.json(); // room is the projectId

  if (!room || typeof room !== "string") {
    return new Response("Bad Request", { status: 400 });
  }

  const project = await db.project.findUnique({
    where: { id: room },
  });

  if (!project || project.userId !== user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const lb = getLiveblocks();

  await lb.getOrCreateRoom(room, { defaultAccesses: [] });

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

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
