"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useContact, useUpdateContact, useTags } from "@/hooks/useContacts";
import type { CreateContactInput } from "@/lib/validations/contact";

interface EditContactPageProps {
  params: Promise<{ id: string }>;
}

export default function EditContactPage({ params }: EditContactPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: contact, isLoading: contactLoading } = useContact(id);
  const { data: tags, isLoading: tagsLoading } = useTags();
  const updateMutation = useUpdateContact();

  const handleSubmit = async (data: CreateContactInput) => {
    await updateMutation.mutateAsync({ id, data: data as Record<string, unknown> });
    router.push(`/contacts/${id}`);
  };

  if (contactLoading || tagsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Contact not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Contact"
        subtitle={`Editing ${contact.firstName} ${contact.lastName}`}
      />
      <div className="max-w-2xl">
        <ContactForm
          contact={contact}
          tags={tags || []}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
