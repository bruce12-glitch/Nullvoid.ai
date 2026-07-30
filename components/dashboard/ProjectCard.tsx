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

  const handleUpdate = (data: { title: string }) => {
    startTransition(async () => {
      try {
        await updateProject(id, data);
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <div className="group flex flex-col bg-card/60 backdrop-blur-md border border-border/40 hover:border-primary/50 transition-all duration-300 rounded-xl shadow-xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
      {/* 3D Grid Thumbnail Preview */}
      <Link href={`/canvas/${id}`} className="relative h-40 bg-black/40 overflow-hidden block">
        {/* Abstract representation of 3D grid/canvas */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            transform: 'perspective(500px) rotateX(45deg) translateY(-20px) scale(1.5)',
            transformOrigin: 'top center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-border/40 rounded-md text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          3D Canvas
        </div>
      </Link>
      
      {/* Card Body */}
      <div className="flex flex-col p-4 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col overflow-hidden">
            <Link href={`/canvas/${id}`} className="hover:underline">
              <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
            </Link>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {description || "No description provided."}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" />}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/80 backdrop-blur-xl border-border/40">
              <DropdownMenuItem render={<Link href={`/canvas/${id}`} className="cursor-pointer" />}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Open Canvas</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => {
                const newTitle = prompt("Enter new title:", title);
                if (newTitle && newTitle !== title) handleUpdate({ title: newTitle });
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
        
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Edited {updatedAt}</span>
          <span className="font-mono text-[10px] opacity-50 uppercase">{id.split("-")[1]}</span>
        </div>
      </div>
    </div>
  );
}
