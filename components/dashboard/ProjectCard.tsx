"use client";

import Link from "next/link";
import { MoreVertical, Copy, Edit2, Trash2, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useState, useTransition } from "react";
import { deleteProject, updateProject } from "@/actions/project.actions";

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  updatedAt: string;
}

export function ProjectCard({ id, title, description, updatedAt }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setIsDeleting(true);
    try {
      await deleteProject(id);
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  const handleUpdate = (data: { name: string }) => {
    startTransition(async () => {
      try {
        await updateProject(id, data);
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <div className="group relative flex flex-col bg-gradient-to-b from-card/70 to-card/40 backdrop-blur-md border border-border/40 hover:border-accent-primary/50 transition-all duration-500 rounded-xl shadow-xl overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-accent-primary/10 card-3d">
      {/* Hover glow effect */}
      <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 200, 212, 0.06), transparent 60%)' }} />
      
      {/* 3D Grid Thumbnail Preview */}
      <Link href={`/canvas/${id}`} className="relative h-40 bg-black/50 overflow-hidden block card-3d-inner">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-ai/10 group-hover:opacity-50 transition-opacity duration-500" />
        {/* Grid pattern with 3D perspective */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700 group-hover:scale-105 group-hover:opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-accent-primary) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            transform: 'perspective(500px) rotateX(45deg) translateY(-20px) scale(1.5)',
            transformOrigin: 'top center'
          }}
        />
        {/* Animated gradient sweep */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/5 to-transparent animate-shimmer" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
        </div>
        {/* Floating wireframe preview */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
          <div 
            className="w-24 h-24 border border-accent-primary/40 rounded-lg animate-rotate-slow"
            style={{ animationDuration: '15s' }}
          />
          <div 
            className="absolute w-20 h-20 border border-accent-ai/30 rounded-lg animate-rotate-slow"
            style={{ animationDuration: '20s', animationDirection: 'reverse' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-border/40 rounded-lg text-[10px] font-medium uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/60 animate-glow-pulse" />
          3D Canvas
        </div>
        
        {/* Open indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <div className="px-2 py-1 bg-accent-primary/20 backdrop-blur-md border border-accent-primary/30 rounded-lg text-[10px] font-medium text-accent-primary flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Open
          </div>
        </div>
      </Link>
      
      {/* Card Body */}
      <div className="relative flex flex-col p-4 flex-1 z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col overflow-hidden min-w-0">
            <Link href={`/canvas/${id}`} className="hover:underline decoration-accent-primary/30 underline-offset-2">
              <h3 className="text-base font-semibold text-foreground truncate group-hover:text-accent-primary transition-colors duration-300">{title}</h3>
            </Link>
            <p className="text-xs text-text-muted mt-1 truncate">
              {description || "No description provided."}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/80 backdrop-blur-xl border-border/40">
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `/canvas/${id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Open Canvas</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => {
                const newTitle = prompt("Enter new title:", title);
                if (newTitle && newTitle !== title) handleUpdate({ name: newTitle });
              }}>
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/20">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-accent-primary/40" />
            Edited {updatedAt}
          </span>
          <span className="font-mono text-[10px] opacity-30 uppercase tracking-wider">{id.slice(0, 6)}</span>
        </div>
      </div>
    </div>
  );
}
