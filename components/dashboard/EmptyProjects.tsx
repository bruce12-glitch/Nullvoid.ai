import { FolderOpen, Plus, Sparkles } from "lucide-react";

interface EmptyProjectsProps {
  isSearch?: boolean;
  onCreateProject?: () => void;
}

export function EmptyProjects({ isSearch = false, onCreateProject }: EmptyProjectsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Animated gradient ring with wireframe */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-accent-ai to-primary opacity-30 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-card/80 backdrop-blur-md border border-border/40 flex items-center justify-center shadow-2xl animate-scale-in">
          {/* Rotating wireframe ring */}
          <div className="absolute inset-0 rounded-2xl border border-accent-primary/20 animate-rotate-slow" />
          <div className="absolute inset-1 rounded-xl border border-accent-ai/15 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
          <FolderOpen className="w-10 h-10 text-muted-foreground" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
        {isSearch ? "No projects found" : "No projects yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {isSearch 
          ? "We couldn't find any projects matching your search query. Try adjusting your filters."
          : "Create your first project to start designing AI architectures on a live 3D canvas."}
      </p>
      
      {!isSearch && onCreateProject && (
        <button
          onClick={onCreateProject}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-primary to-primary/85 text-primary-foreground text-sm font-medium rounded-xl shadow-[0_3px_0_0_rgba(0,0,0,0.25),0_0_15px_rgba(0,200,212,0.2),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:brightness-110 hover:shadow-[0_3px_0_0_rgba(0,0,0,0.25),0_0_25px_rgba(0,200,212,0.4),inset_0_1px_0_0_rgba(255,255,255,0.15)] active:shadow-none active:translate-y-[2px] transition-all animate-scale-in"
          style={{ animationDelay: '0.2s' }}
        >
          <Sparkles className="w-4 h-4" />
          Create your first project
        </button>
      )}
    </div>
  );
}
