"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { EmptyProjects } from "@/components/dashboard/EmptyProjects";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prisma } from "@/app/generated/prisma/client";

type ProjectType = {
  id: string;
  title: string;
  description: string | null;
  isStarred: boolean;
  isArchived: boolean;
  updatedAt: Date;
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
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Tab filter
      let matchesTab = true;
      if (activeTab === "starred") matchesTab = project.isStarred;
      else if (activeTab === "archived") matchesTab = project.isArchived;
      else if (activeTab === "all") matchesTab = !project.isArchived; 
      else if (activeTab === "recent") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchesTab = new Date(project.updatedAt) > oneWeekAgo && !project.isArchived;
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
      <div className="flex flex-col space-y-8">
        
        {/* Tab Filters */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground tracking-tight hidden md:block">Workspace</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto overflow-x-auto">
            <TabsList className="bg-card/60 border border-border/40">
              <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">All Projects</TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Recent</TabsTrigger>
              <TabsTrigger value="starred" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Starred</TabsTrigger>
              <TabsTrigger value="archived" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Project Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description || ""}
                updatedAt={new Date(project.updatedAt).toLocaleDateString()}
              />
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
