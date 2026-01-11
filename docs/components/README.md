# Component Documentation

This document describes the React components used in the CRM application.

---

## Table of Contents

- [UI Components](#ui-components)
  - [Button](#button)
  - [Input](#input)
  - [Label](#label)
  - [Textarea](#textarea)
  - [Select](#select)
  - [Card](#card)
  - [Badge](#badge)
- [Contact Components](#contact-components)
  - [ContactList](#contactlist)
  - [ContactForm](#contactform)
  - [ContactDetail](#contactdetail)
  - [ActivityTimeline](#activitytimeline)
  - [TagBadge](#tagbadge)

---

## UI Components

Base UI primitives following shadcn/ui patterns.

### Button

**Location:** `src/components/ui/button.tsx`

A versatile button component with multiple variants and sizes.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` | Visual style |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Button size |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `ButtonHTMLAttributes` | - | Native button props |

#### Usage

```tsx
import { Button } from "@/components/ui/button";

// Default button
<Button>Click me</Button>

// Destructive variant
<Button variant="destructive">Delete</Button>

// Small outline button
<Button variant="outline" size="sm">Cancel</Button>

// Icon button
<Button variant="ghost" size="icon">
  <PlusIcon />
</Button>
```

---

### Input

**Location:** `src/components/ui/input.tsx`

A styled text input field.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | `"text"` | Input type |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `InputHTMLAttributes` | - | Native input props |

#### Usage

```tsx
import { Input } from "@/components/ui/input";

<Input placeholder="Enter email" type="email" />
<Input disabled value="Read only" />
```

---

### Label

**Location:** `src/components/ui/label.tsx`

A styled form label with Radix UI accessibility.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `htmlFor` | `string` | - | ID of associated input |
| `className` | `string` | - | Additional CSS classes |

#### Usage

```tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

---

### Textarea

**Location:** `src/components/ui/textarea.tsx`

A styled multi-line text input.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `...props` | `TextareaHTMLAttributes` | - | Native textarea props |

#### Usage

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="Enter notes..." rows={4} />
```

---

### Select

**Location:** `src/components/ui/select.tsx`

A styled native select dropdown.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `...props` | `SelectHTMLAttributes` | - | Native select props |

#### Usage

```tsx
import { Select } from "@/components/ui/select";

<Select>
  <option value="">Select status</option>
  <option value="LEAD">Lead</option>
  <option value="CUSTOMER">Customer</option>
</Select>
```

---

### Card

**Location:** `src/components/ui/card.tsx`

A container component for grouping content.

#### Sub-components

| Component | Description |
|-----------|-------------|
| `Card` | Main container |
| `CardHeader` | Header section |
| `CardTitle` | Title text |
| `CardDescription` | Subtitle/description |
| `CardContent` | Main content area |
| `CardFooter` | Footer section |

#### Usage

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Contact Details</CardTitle>
    <CardDescription>View and edit contact information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

---

### Badge

**Location:** `src/components/ui/badge.tsx`

A small status indicator label.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "destructive" \| "success" \| "warning" \| "outline"` | `"default"` | Visual style |
| `className` | `string` | - | Additional CSS classes |

#### Usage

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Error</Badge>
```

---

## Contact Components

Domain-specific components for contact management.

### ContactList

**Location:** `src/components/contacts/ContactList.tsx`

Displays a paginated, filterable list of contacts.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contacts` | `Contact[]` | Required | Array of contact objects |
| `isLoading` | `boolean` | `false` | Show loading state |
| `onContactClick` | `(id: string) => void` | - | Click handler |

#### Features

- Search by name/email
- Filter by status and source
- Pagination controls
- Empty state handling
- Loading skeleton

#### Usage

```tsx
import { ContactList } from "@/components/contacts/ContactList";

<ContactList
  contacts={contacts}
  isLoading={isLoading}
  onContactClick={(id) => router.push(`/contacts/${id}`)}
/>
```

---

### ContactForm

**Location:** `src/components/contacts/ContactForm.tsx`

A form for creating or editing contacts.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialData` | `Partial<Contact>` | - | Pre-fill form for editing |
| `onSubmit` | `(data: CreateContactInput) => Promise<void>` | Required | Submit handler |
| `isSubmitting` | `boolean` | `false` | Disable form while saving |

#### Features

- Zod validation with React Hook Form
- Real-time field validation
- Tag selection with autocomplete
- Loading state during submission

#### Usage

```tsx
import { ContactForm } from "@/components/contacts/ContactForm";

// Create mode
<ContactForm onSubmit={handleCreate} />

// Edit mode
<ContactForm
  initialData={contact}
  onSubmit={handleUpdate}
  isSubmitting={isUpdating}
/>
```

---

### ContactDetail

**Location:** `src/components/contacts/ContactDetail.tsx`

Displays full contact information with activity timeline.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contact` | `ContactWithRelations` | Required | Contact with tags and activities |
| `onEdit` | `() => void` | - | Edit button handler |
| `onDelete` | `() => void` | - | Delete button handler |

#### Features

- Contact info display
- Tag badges with colors
- Activity timeline
- Edit/delete actions

#### Usage

```tsx
import { ContactDetail } from "@/components/contacts/ContactDetail";

<ContactDetail
  contact={contact}
  onEdit={() => router.push(`/contacts/${id}/edit`)}
  onDelete={handleDelete}
/>
```

---

### ActivityTimeline

**Location:** `src/components/contacts/ActivityTimeline.tsx`

Displays a chronological list of contact activities.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activities` | `Activity[]` | Required | Array of activity objects |

#### Activity Types

| Type | Description |
|------|-------------|
| `CONTACT_CREATED` | Contact was created |
| `CONTACT_UPDATED` | Contact was modified |
| `NOTE_ADDED` | Note was added |
| `EMAIL_SENT` | Email was sent |
| `STATUS_CHANGED` | Status was changed |

#### Usage

```tsx
import { ActivityTimeline } from "@/components/contacts/ActivityTimeline";

<ActivityTimeline activities={contact.activities} />
```

---

### TagBadge

**Location:** `src/components/contacts/TagBadge.tsx`

Displays a colored tag with optional remove button.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | Required | Tag display name |
| `color` | `string` | Required | Hex color (e.g., "#FF5733") |
| `onRemove` | `() => void` | - | Remove button handler |
| `className` | `string` | - | Additional CSS classes |

#### Features

- Dynamic text color for contrast (dark text on light bg, light text on dark bg)
- Optional remove button
- Consistent styling

#### Usage

```tsx
import { TagBadge } from "@/components/contacts/TagBadge";

// Read-only
<TagBadge name="VIP" color="#FF5733" />

// With remove button
<TagBadge
  name="Newsletter"
  color="#3498DB"
  onRemove={() => handleRemoveTag(tag.id)}
/>
```

---

## Utility Function

### cn()

**Location:** `src/lib/utils.ts`

Merges class names with Tailwind CSS conflict resolution.

```tsx
import { cn } from "@/lib/utils";

// Merge classes
cn("px-4 py-2", "bg-blue-500")
// → "px-4 py-2 bg-blue-500"

// Conditional classes
cn("base", isActive && "active")
// → "base active" or "base"

// Override conflicting Tailwind classes
cn("px-2", "px-4")
// → "px-4" (tailwind-merge resolves conflict)
```
