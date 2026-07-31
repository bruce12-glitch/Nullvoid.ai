import { getProjects } from "@/actions/project.actions";
import { DashboardClient } from "./dashboard-client";

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
