import type {
  Contact,
  Tag,
  Activity,
  ContactSource,
  ContactStatus,
  EmailStatus,
  ActivityType,
} from "@prisma/client";

// Re-export enums for convenience
export type { ContactSource, ContactStatus, EmailStatus, ActivityType };

// Contact with relations
export type ContactWithTags = Contact & {
  tags: { tag: Tag }[];
};

export type ContactWithActivities = Contact & {
  activities: Activity[];
};

export type ContactWithAll = Contact & {
  tags: { tag: Tag }[];
  activities: Activity[];
};

// API response types
export type ContactListResponse = {
  contacts: ContactWithTags[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ContactDetailResponse = ContactWithAll;

// Form types
export type CreateContactInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: ContactSource;
  status?: ContactStatus;
  marketingOptIn?: boolean;
  notes?: string;
  tagIds?: string[];
};

export type UpdateContactInput = Partial<CreateContactInput>;

// Query filters
export type ContactFilters = {
  search?: string;
  status?: ContactStatus;
  source?: ContactSource;
  tagId?: string;
  page?: number;
  limit?: number;
};

// Activity payload types
export type ContactCreatedPayload = {
  source: string;
};

export type ContactUpdatedPayload = {
  changes: Record<string, { from: unknown; to: unknown }>;
};

export type NoteAddedPayload = {
  preview: string;
};

export type TagAddedPayload = {
  tagId: string;
  tagName: string;
};

export type TagRemovedPayload = {
  tagId: string;
  tagName: string;
};
