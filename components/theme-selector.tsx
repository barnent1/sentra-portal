"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themes = [
  { name: "Violet", value: "violet", color: "bg-violet-500" },
  { name: "Slate", value: "slate", color: "bg-slate-500" },
  { name: "Blue", value: "blue", color: "bg-blue-500" },
  { name: "Green", value: "green", color: "bg-green-500" },
  { name: "Orange", value: "orange", color: "bg-orange-500" },
  { name: "Red", value: "red", color: "bg-red-500" },
  { name: "Rose", value: "rose", color: "bg-rose-500" },
  { name: "Zinc", value: "zinc", color: "bg-zinc-500" },
];

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = React.useState("violet");

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    // Update CSS variables based on theme
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center">
              <div
                className={cn(
                  "mr-2 h-4 w-4 rounded-full",
                  theme.color
                )}
              />
              {theme.name}
            </span>
            {selectedTheme === theme.value && (
              <span className="text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}