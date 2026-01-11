# Pipeline & Deals (Enquiry Management)

## Overview

The Pipeline feature provides a visual Kanban board for managing sales enquiries from initial contact through to completion. Users can create enquiries linked to contacts, track them through customizable stages, and maintain a complete activity history of all changes.

The pipeline uses drag-and-drop functionality to move enquiries between stages, with optimistic updates for a responsive user experience. Each enquiry maintains a relationship with a contact and automatically logs all significant events for audit and review purposes.

## User Stories

- As a sales user, I can view all enquiries organized by stage on a Kanban board so that I can see my pipeline at a glance
- As a sales user, I can drag an enquiry to a new stage so that I can update its progress without navigating away
- As a sales user, I can create an enquiry linked to an existing contact so that I can track their interest
- As a sales user, I can view the full history of an enquiry so that I can understand how it progressed
- As a sales user, I can filter enquiries by type, stage, or contact so that I can focus on specific deals
- As a sales user, I can set an estimated value on an enquiry so that I can prioritize high-value opportunities
- As a sales user, I can set a next action date so that I remember to follow up

## Technical Overview

### Entry Points

| Type | Path | Purpose |
|------|------|---------|
| Page | `/pipeline` | Kanban board view of all enquiries |
| Page | `/pipeline/new` | Create new enquiry form |
| Page | `/pipeline/[id]` | Enquiry detail view with activity timeline |
| Page | `/pipeline/[id]/edit` | Edit enquiry form |
| API | `/api/enquiries` | List/create enquiries |
| API | `/api/enquiries/[id]` | Get/update/delete single enquiry |
| API | `/api/enquiries/[id]/stage` | Optimized stage update for drag-drop |

### Key Components

- `EnquiryKanban.tsx` - Main Kanban board with drag-and-drop using dnd-kit
- `EnquiryColumn.tsx` - Single stage column with drop zone
- `EnquiryCard.tsx` - Individual enquiry card displayed in columns
- `EnquiryForm.tsx` - Create/edit form with contact selection
- `EnquiryDetail.tsx` - Full enquiry view with delete action
- `EnquiryActivityTimeline.tsx` - Chronological list of enquiry events
- `stageConfig.ts` - Stage order, labels, and styling configuration

### Data Flow

1. **Kanban Board Load**
   - `useEnquiries` hook fetches all enquiries with contacts
   - `useMemo` groups enquiries by stage for column rendering
   - Each column receives its enquiries array

2. **Drag and Drop**
   - User drags card from one column to another
   - `handleDragEnd` extracts source and destination stages
   - Optimistic update immediately moves card in UI
   - `useUpdateEnquiryStage` mutation calls `/api/enquiries/[id]/stage`
   - On success: UI already updated; on failure: rollback via query invalidation

3. **Create Enquiry**
   - User selects contact and fills form
   - Form validates with Zod schema
   - `useCreateEnquiry` mutation POSTs to `/api/enquiries`
   - Server creates enquiry and logs ENQUIRY_CREATED activity
   - Redirect to pipeline page on success

4. **Activity Logging**
   - All significant changes automatically logged in `enquiry_activities`
   - Activity types: ENQUIRY_CREATED, STAGE_CHANGED, ENQUIRY_UPDATED, NOTE_ADDED
   - Payload stores context (stage from/to, field changes)

### Database Tables

- `enquiries` - Core enquiry data with stage, type, estimated value, and timestamps
- `enquiry_activities` - Audit trail of all enquiry events with JSON payload
- `contacts` - Referenced for contact relationship (existing table)

### Pipeline Stages

| Stage | Label | Description |
|-------|-------|-------------|
| NEW | New | Fresh enquiry, not yet reviewed |
| AUTO_RESPONDED | Auto-Responded | Automated response sent |
| CONTACTED | Contacted | Manual outreach made |
| QUALIFIED | Qualified | Lead is qualified and interested |
| PROPOSAL_SENT | Proposal Sent | Proposal or quote delivered |
| BOOKED_PAID | Booked/Paid | Deal closed successfully |
| LOST | Lost | Deal did not close |

### Enquiry Types

| Type | Description |
|------|-------------|
| GENERAL | General enquiry (default) |
| SERVICE | Service-related enquiry |
| PRODUCT | Product-related enquiry |
| PARTNERSHIP | Partnership opportunity |

## Configuration

### Stage Configuration

Stage order, labels, and colors are defined in `src/components/pipeline/stageConfig.ts`:

```typescript
import { STAGE_ORDER, STAGE_CONFIG, getStageLabel, getStageColor } from '@/components/pipeline/stageConfig';

// Get all stages in order
STAGE_ORDER; // ['NEW', 'AUTO_RESPONDED', ...]

// Get config for a stage
STAGE_CONFIG['NEW']; // { key, label, color, bgColor }

// Helper functions
getStageLabel('NEW'); // 'New'
getStageColor('NEW'); // 'text-blue-700'
getStageBgColor('NEW'); // 'bg-blue-50'
```

### Validation Schemas

Enquiry validation is defined in `src/lib/validations/enquiry.ts`:

- `createEnquirySchema` - Validates new enquiry creation
- `updateEnquirySchema` - Validates partial updates
- `updateEnquiryStageSchema` - Validates stage-only updates
- `enquiryQuerySchema` - Validates list query parameters

### Default Values

| Field | Default |
|-------|---------|
| Stage | NEW |
| Enquiry Type | GENERAL |
| Page | 1 |
| Limit | 100 (max 200) |

## How to Extend

### Adding a New Stage

1. Add the stage to the `EnquiryStage` enum in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Add the stage to `STAGE_ORDER` array in `stageConfig.ts`
4. Add stage configuration to `STAGE_CONFIG` object with label, color, and bgColor
5. Update validation schema in `enquiry.ts` if using Zod enum

### Adding a New Enquiry Type

1. Add the type to the `EnquiryType` enum in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Update the `enquiryTypeEnum` in `src/lib/validations/enquiry.ts`
4. Update the form dropdown in `EnquiryForm.tsx`
5. Update card styling if type-specific styling is desired

### Adding a New Activity Type

1. Add the type to `EnquiryActivityType` enum in `prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Add icon and color configuration in `EnquiryActivityTimeline.tsx`
4. Add rendering logic for the new activity type

### Adding New Enquiry Fields

1. Add the field to the `Enquiry` model in `prisma/schema.prisma`
2. Create a migration with `npx prisma migrate dev`
3. Add field to `createEnquirySchema` and `updateEnquirySchema`
4. Add field to `EnquiryForm.tsx`
5. Display field in `EnquiryCard.tsx` and/or `EnquiryDetail.tsx`

## Related Documentation

- [Enquiries API](/workspace/crm/docs/api/enquiries.md) - API endpoint reference
- [Contact Database](/workspace/crm/docs/features/contacts.md) - Contact management feature
- [Database Schema](/workspace/crm/docs/database/schema.md) - Full database schema
