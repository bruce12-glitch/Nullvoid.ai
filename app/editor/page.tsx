import { redirect } from "next/navigation"
import { getProjectsForUser } from "@/lib/projects"
import { getCurrentProjectIdentity } from "@/lib/project-access"
import { EditorHomeClient } from "@/components/editor/editor-home-client"

// Per-user, auth-dependent page: never statically prerender it.
// Without this Next.js tried to build it at compile time, where there is
// no request context — surfacing as a DYNAMIC_SERVER_USAGE error and a
// failed build (and, worse, risking a cached shell of one user's data).
export const dynamic = "force-dynamic";

export default async function EditorPage() {
  const identity = await getCurrentProjectIdentity()
  if (!identity.userId) redirect("/sign-in")

  const { owned, shared } = await getProjectsForUser(identity.userId, identity.primaryEmailAddress)

  return (
    <EditorHomeClient
      ownedProjects={owned.map((p) => ({ id: p.id, name: p.name }))}
      sharedProjects={shared.map((p) => ({ id: p.id, name: p.name }))}
    />
  )
}
