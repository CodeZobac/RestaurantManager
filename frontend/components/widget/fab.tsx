"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface FabProps {
  onClick: () => void;
}

export function Fab({ onClick }: FabProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:scale-110 transition-transform duration-300"
    >
      <Calendar className="h-8 w-8" />
    </Button>
  );
}
