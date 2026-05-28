import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';

export default function SynapseDrawer({
  isOpen,
  onClose,
  title = "AI Assistant",
  description = "Intelligent legal insights and automation",
  children
}) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-black">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
