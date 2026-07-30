"use client";

import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Settings } from "lucide-react";
import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";

export function UserButtonWrapper() {
  const { openSettings } = useCanvasPreferences();

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-8 h-8 rounded-lg border border-border/40",
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="Dashboard"
          href="/dashboard"
          labelIcon={<LayoutDashboard className="w-4 h-4" />}
        />
        <UserButton.Action 
          label="Settings" 
          labelIcon={<Settings className="w-4 h-4" />} 
          onClick={openSettings} 
        />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
