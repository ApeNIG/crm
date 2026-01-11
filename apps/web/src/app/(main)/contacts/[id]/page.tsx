"use client";

import { use } from "react";
import { ContactDetail } from "@/components/contacts/ContactDetail";
import { useContact, useDeleteContact } from "@/hooks/useContacts";

interface ContactPageProps {
  params: Promise<{ id: string }>;
}

export default function ContactPage({ params }: ContactPageProps) {
  const { id } = use(params);
  const { data: contact, isLoading, error } = useContact(id);
  const deleteMutation = useDeleteContact();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading contact...</div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Contact not found</div>
      </div>
    );
  }

  return (
    <ContactDetail
      contact={contact}
      onDelete={handleDelete}
      isDeleting={deleteMutation.isPending}
    />
  );
}
