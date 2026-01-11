"use client";

import Link from "next/link";
import { UserPlus, MessageSquarePlus, Calendar, FilePlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/contacts/new"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        New Contact
      </Link>
      <Link
        href="/pipeline?new=true"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <MessageSquarePlus className="mr-2 h-4 w-4" />
        New Enquiry
      </Link>
      <Link
        href="/calendar"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Calendar
      </Link>
      <Link
        href="/invoices/new"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <FilePlus className="mr-2 h-4 w-4" />
        New Invoice
      </Link>
    </div>
  );
}
