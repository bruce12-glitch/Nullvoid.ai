"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { createProject } from "@/actions/project.actions";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("blank");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    
    try {
      const project = await createProject({
        title,
        description,
        template
      });
      
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setTemplate("blank");
      
      router.push(`/canvas/${project.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-xl border border-border/30 shadow-2xl shadow-accent-primary/5">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-ai flex items-center justify-center shadow-lg shadow-accent-primary/20">
              <span className="text-bg-base font-bold text-sm">+</span>
            </div>
            <div>
              <DialogTitle className="text-lg text-foreground">New Project</DialogTitle>
              <DialogDescription className="text-text-muted text-sm">
                Initialize a 3D system architecture workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-medium text-foreground/80 tracking-wide uppercase">
              Project Title
            </label>
            <Input
              id="title"
              placeholder="e.g. Core Microservices"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50 border-border/40 focus:border-accent-primary/50 h-10 text-sm"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-medium text-foreground/80 tracking-wide uppercase">
              Description <span className="text-text-faint font-normal">(optional)</span>
            </label>
            <Textarea
              id="description"
              placeholder="What are you designing?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/50 border-border/40 resize-none text-sm"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="template" className="text-xs font-medium text-foreground/80 tracking-wide uppercase">
              Starter Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'blank', label: 'Blank', desc: 'Empty canvas' },
                { value: 'microservices', label: 'Microservices', desc: 'Service-oriented' },
                { value: 'agent', label: 'AI Agent', desc: 'LLM pipeline' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTemplate(opt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-all duration-200 ${
                    template === opt.value
                      ? 'border-accent-primary/50 bg-accent-primary/10 text-accent-primary shadow-sm shadow-accent-primary/10'
                      : 'border-border/40 bg-background/30 text-text-muted hover:border-border/60 hover:bg-background/50'
                  }`}
                >
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span className="text-[10px] opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-text-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()} className="bg-accent-primary text-bg-base hover:bg-accent-primary/90 font-medium">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
