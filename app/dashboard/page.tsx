import { getProjects } from "@/actions/project.actions";
import { DashboardClient } from "./dashboard-client";

// Per-user, auth-dependent page: never statically prerender it.
// Without this Next.js tried to build it at compile time, where there is
// no request context — surfacing as a DYNAMIC_SERVER_USAGE error and a
// failed build (and, worse, risking a cached shell of one user's data).
export const dynamic = "force-dynamic";

export type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: Date;
  ownerId: string;
};

export default async function DashboardPage() {
  const projects = await getProjects();

  const mapped = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    updatedAt: p.updatedAt,
    ownerId: p.ownerId,
  }));

  return <DashboardClient initialProjects={mapped} />;
}
