import { getProjects } from "@/actions/project.actions";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const projects = await getProjects();

  return <DashboardClient initialProjects={projects} />;
}
