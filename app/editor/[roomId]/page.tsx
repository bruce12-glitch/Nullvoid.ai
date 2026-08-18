import { redirect } from "next/navigation"
import { AccessDenied } from "@/components/editor/access-denied"
import { EditorWorkspaceClient } from "@/components/editor/editor-workspace-client"
import { getProjectsForUser } from "@/lib/projects"
import {
  getAccessibleProject,
  getCurrentProjectIdentity,
} from "@/lib/project-access"

// Per-user, auth-dependent page: never statically prerender it.
// Without this Next.js tried to build it at compile time, where there is
// no request context — surfacing as a DYNAMIC_SERVER_USAGE error and a
// failed build (and, worse, risking a cached shell of one user's data).
export const dynamic = "force-dynamic";

export default async function EditorWorkspacePage(
  props: { params: Promise<{ roomId: string }> }
) {
  const identity = await getCurrentProjectIdentity()

  if (!identity.userId) redirect("/sign-in")

  const { roomId } = await props.params
  const project = await getAccessibleProject(roomId, identity)

  if (!project) {
    return <AccessDenied />
  }

  const { owned, shared } = await getProjectsForUser(identity.userId, identity.primaryEmailAddress)

  return (
    <EditorWorkspaceClient
      currentProject={{ id: project.id, name: project.name }}
      ownedProjects={owned.map((item) => ({ id: item.id, name: item.name }))}
      sharedProjects={shared.map((item) => ({ id: item.id, name: item.name }))}
      roomId={roomId}
    />
  )
}
