"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
}

function getFileName(path: unknown): string {
  if (typeof path !== "string" || !path) return "";
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function getLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "str_replace_editor") {
    const file = getFileName(args.path);
    switch (args.command) {
      case "create":     return file ? `Creating ${file}`  : "Creating file";
      case "str_replace":
      case "insert":     return file ? `Editing ${file}`   : "Editing file";
      case "view":       return file ? `Reading ${file}`   : "Reading file";
      case "undo_edit":  return file ? `Reverting ${file}` : "Reverting file";
      default:           return file ? `Updating ${file}`  : "Updating file";
    }
  }

  if (toolName === "file_manager") {
    const file = getFileName(args.path);
    switch (args.command) {
      case "delete": return file ? `Deleting ${file}` : "Deleting file";
      case "rename": {
        const newFile = getFileName(args.new_path);
        return file && newFile ? `Renaming ${file} → ${newFile}` : `Renaming ${file || "file"}`;
      }
      default: return file ? `Managing ${file}` : "Managing file";
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const done = state === "result";
  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done
        ? <div className="w-2 h-2 rounded-full bg-emerald-500" />
        : <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
      <span className="text-neutral-700">{getLabel(toolName, args)}</span>
    </div>
  );
}
