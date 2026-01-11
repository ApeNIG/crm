"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useCreateContact, useTags } from "@/hooks/useContacts";
import type { CreateContactInput } from "@/lib/validations/contact";

export default function NewContactPage() {
  const router = useRouter();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const createMutation = useCreateContact();

  const handleSubmit = async (data: CreateContactInput) => {
    const contact = await createMutation.mutateAsync(data as Record<string, unknown>);
    router.push(`/contacts/${contact.id}`);
  };

  if (tagsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Contact"
        subtitle="Add a new contact to your database"
      />
      <div className="max-w-2xl">
        <ContactForm
          tags={tags || []}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
