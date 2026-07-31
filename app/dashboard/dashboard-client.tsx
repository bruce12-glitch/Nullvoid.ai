"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RobotHero } from "@/components/dashboard/RobotHero";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { EmptyProjects } from "@/components/dashboard/EmptyProjects";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProjectType = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: Date;
  ownerId: string;
};

interface DashboardClientProps {
  initialProjects: ProjectType[];
}

export function DashboardClient({ initialProjects }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter projects based on search query and active tab
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // Search filter
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Tab filter
      let matchesTab = true;
      if (activeTab === "starred") matchesTab = false;
      else if (activeTab === "archived") matchesTab = project.status === "ARCHIVED";
      else if (activeTab === "all") matchesTab = project.status !== "ARCHIVED";
      else if (activeTab === "recent") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchesTab = new Date(project.updatedAt) > oneWeekAgo && project.status !== "ARCHIVED";
      }
      
      return matchesSearch && matchesTab;
    });
  }, [initialProjects, searchQuery, activeTab]);

  return (
    <DashboardLayout 
      searchQuery={searchQuery} 
      onSearchChange={setSearchQuery}
      onCreateProjectClick={() => setIsModalOpen(true)}
    >
      <div className="flex flex-col space-y-6">
        
        {/* 3D Robot Hero Banner */}
        <RobotHero />

        {/* Header and Tab Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Workspace</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              {activeTab !== 'all' ? ` · ${activeTab}` : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="overflow-x-auto">
              <TabsList className="bg-card/60 border border-border/40 p-0.5">
                <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs py-1.5">All</TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs py-1.5">Recent</TabsTrigger>
                <TabsTrigger value="starred" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs py-1.5">Starred</TabsTrigger>
                <TabsTrigger value="archived" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-xs py-1.5">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Project Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
            {filteredProjects.map((project, i) => (
              <div key={project.id} className="animate-in fade-in duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                <ProjectCard 
                  id={project.id}
                  title={project.name}
                  description={project.description || ""}
                  updatedAt={new Date(project.updatedAt).toLocaleDateString()}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyProjects isSearch={searchQuery.length > 0} onCreateProject={() => setIsModalOpen(true)} />
        )}

      </div>
      
      {/* Create Project Dialog */}
      <CreateProjectModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </DashboardLayout>
  );
}
