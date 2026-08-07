"use client";

import { ChevronDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImportReviewExportMenuProps {
  disabled?: boolean;
  labels: {
    export: string;
    excel: string;
    csv: string;
    googleSheets: string;
    pdf: string;
  };
  onExportExcel: () => void;
}

export function ImportReviewExportMenu({
  disabled = false,
  labels,
  onExportExcel,
}: ImportReviewExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={disabled}
          className="h-11 w-full touch-manipulation sm:w-auto"
        >
          <Download className="h-4 w-4" />
          {labels.export}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          className="min-h-10 cursor-pointer"
          onSelect={() => onExportExcel()}
        >
          {labels.excel}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="min-h-10">
          {labels.csv}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="min-h-10">
          {labels.googleSheets}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="min-h-10">
          {labels.pdf}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
