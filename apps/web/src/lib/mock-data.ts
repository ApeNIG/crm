// Mock data for UI preview when database is not available

export const mockTags = [
  { id: "tag-1", name: "VIP", color: "#8B5CF6", createdAt: new Date(), updatedAt: new Date() },
  { id: "tag-2", name: "Newsletter", color: "#3B82F6", createdAt: new Date(), updatedAt: new Date() },
  { id: "tag-3", name: "Partner", color: "#10B981", createdAt: new Date(), updatedAt: new Date() },
  { id: "tag-4", name: "Hot Lead", color: "#EF4444", createdAt: new Date(), updatedAt: new Date() },
];

export const mockContacts = [
  {
    id: "contact-1",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@techcorp.com",
    phone: "+1 (555) 123-4567",
    source: "WEBSITE" as const,
    status: "CUSTOMER" as const,
    ownerUserId: null,
    marketingOptIn: true,
    marketingOptInAt: new Date("2024-06-15"),
    emailStatus: "VALID" as const,
    notes: "Key decision maker at TechCorp. Interested in premium package.",
    deletedAt: null,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-12-20"),
    tags: [
      { tag: mockTags[0] }, // VIP
      { tag: mockTags[1] }, // Newsletter
    ],
    activities: [
      {
        id: "act-1",
        contactId: "contact-1",
        type: "CONTACT_CREATED" as const,
        description: "Contact Sarah Chen was created",
        metadata: {},
        createdAt: new Date("2024-03-10"),
      },
      {
        id: "act-2",
        contactId: "contact-1",
        type: "STATUS_CHANGED" as const,
        description: "Status changed from LEAD to CUSTOMER",
        metadata: { from: "LEAD", to: "CUSTOMER" },
        createdAt: new Date("2024-06-15"),
      },
    ],
  },
  {
    id: "contact-2",
    firstName: "Marcus",
    lastName: "Williams",
    email: "marcus.w@designstudio.io",
    phone: "+1 (555) 234-5678",
    source: "REFERRAL" as const,
    status: "PROSPECT" as const,
    ownerUserId: null,
    marketingOptIn: false,
    marketingOptInAt: null,
    emailStatus: "VALID" as const,
    notes: "Referred by Sarah Chen. Looking for branding services.",
    deletedAt: null,
    createdAt: new Date("2024-08-22"),
    updatedAt: new Date("2024-12-18"),
    tags: [
      { tag: mockTags[3] }, // Hot Lead
    ],
    activities: [
      {
        id: "act-3",
        contactId: "contact-2",
        type: "CONTACT_CREATED" as const,
        description: "Contact Marcus Williams was created",
        metadata: {},
        createdAt: new Date("2024-08-22"),
      },
    ],
  },
  {
    id: "contact-3",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@startup.co",
    phone: "+1 (555) 345-6789",
    source: "EVENT" as const,
    status: "LEAD" as const,
    ownerUserId: null,
    marketingOptIn: true,
    marketingOptInAt: new Date("2024-11-05"),
    emailStatus: "VALID" as const,
    notes: "Met at Tech Conference 2024. Interested in consulting.",
    deletedAt: null,
    createdAt: new Date("2024-11-05"),
    updatedAt: new Date("2024-11-05"),
    tags: [
      { tag: mockTags[1] }, // Newsletter
    ],
    activities: [
      {
        id: "act-4",
        contactId: "contact-3",
        type: "CONTACT_CREATED" as const,
        description: "Contact Emily Rodriguez was created",
        metadata: {},
        createdAt: new Date("2024-11-05"),
      },
    ],
  },
  {
    id: "contact-4",
    firstName: "David",
    lastName: "Kim",
    email: "d.kim@enterprise.com",
    phone: "+1 (555) 456-7890",
    source: "SOCIAL_MEDIA" as const,
    status: "CUSTOMER" as const,
    ownerUserId: null,
    marketingOptIn: true,
    marketingOptInAt: new Date("2024-02-10"),
    emailStatus: "VALID" as const,
    notes: "Enterprise client. Annual contract renewal in March.",
    deletedAt: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-12-01"),
    tags: [
      { tag: mockTags[0] }, // VIP
      { tag: mockTags[2] }, // Partner
    ],
    activities: [
      {
        id: "act-5",
        contactId: "contact-4",
        type: "CONTACT_CREATED" as const,
        description: "Contact David Kim was created",
        metadata: {},
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "act-6",
        contactId: "contact-4",
        type: "NOTE_ADDED" as const,
        description: "Note added about contract renewal",
        metadata: {},
        createdAt: new Date("2024-12-01"),
      },
    ],
  },
  {
    id: "contact-5",
    firstName: "Jessica",
    lastName: "Thompson",
    email: "jthompson@agency.net",
    phone: null,
    source: "OTHER" as const,
    status: "CHURNED" as const,
    ownerUserId: null,
    marketingOptIn: false,
    marketingOptInAt: null,
    emailStatus: "UNSUBSCRIBED" as const,
    notes: "Previous client. Contract ended Q2 2024.",
    deletedAt: null,
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2024-06-30"),
    tags: [],
    activities: [
      {
        id: "act-7",
        contactId: "contact-5",
        type: "CONTACT_CREATED" as const,
        description: "Contact Jessica Thompson was created",
        metadata: {},
        createdAt: new Date("2023-06-01"),
      },
      {
        id: "act-8",
        contactId: "contact-5",
        type: "STATUS_CHANGED" as const,
        description: "Status changed from CUSTOMER to CHURNED",
        metadata: { from: "CUSTOMER", to: "CHURNED" },
        createdAt: new Date("2024-06-30"),
      },
    ],
  },
];

export function getMockContacts(params: {
  search?: string;
  status?: string;
  source?: string;
  page?: number;
  limit?: number;
}) {
  let filtered = [...mockContacts];

  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
    );
  }

  if (params.status) {
    filtered = filtered.filter((c) => c.status === params.status);
  }

  if (params.source) {
    filtered = filtered.filter((c) => c.source === params.source);
  }

  const page = params.page || 1;
  const limit = params.limit || 20;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    contacts: paged,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function getMockContact(id: string) {
  return mockContacts.find((c) => c.id === id) || null;
}

// ============================================
// ENQUIRY MOCK DATA
// ============================================

export const mockEnquiries = [
  {
    id: "enquiry-1",
    contactId: "contact-1",
    enquiryType: "SERVICE" as const,
    message: "Interested in the premium consulting package for our Q2 expansion",
    preferredDate: new Date("2025-01-20"),
    preferredTime: "10:00 AM",
    estimatedValue: 15000,
    stage: "QUALIFIED" as const,
    nextActionAt: new Date("2025-01-15"),
    sourceUrl: "https://website.com/services",
    deletedAt: null,
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-10"),
    contact: mockContacts[0],
    activities: [
      {
        id: "enq-act-1",
        enquiryId: "enquiry-1",
        type: "ENQUIRY_CREATED" as const,
        payload: { enquiryType: "SERVICE", contactName: "Sarah Chen" },
        createdAt: new Date("2025-01-05"),
      },
      {
        id: "enq-act-2",
        enquiryId: "enquiry-1",
        type: "STAGE_CHANGED" as const,
        payload: { from: "NEW", to: "CONTACTED" },
        createdAt: new Date("2025-01-06"),
      },
      {
        id: "enq-act-3",
        enquiryId: "enquiry-1",
        type: "STAGE_CHANGED" as const,
        payload: { from: "CONTACTED", to: "QUALIFIED" },
        createdAt: new Date("2025-01-10"),
      },
    ],
  },
  {
    id: "enquiry-2",
    contactId: "contact-2",
    enquiryType: "GENERAL" as const,
    message: "Question about pricing for branding services",
    preferredDate: null,
    preferredTime: null,
    estimatedValue: 3500,
    stage: "NEW" as const,
    nextActionAt: new Date("2025-01-12"),
    sourceUrl: null,
    deletedAt: null,
    createdAt: new Date("2025-01-09"),
    updatedAt: new Date("2025-01-09"),
    contact: mockContacts[1],
    activities: [
      {
        id: "enq-act-4",
        enquiryId: "enquiry-2",
        type: "ENQUIRY_CREATED" as const,
        payload: { enquiryType: "GENERAL", contactName: "Marcus Williams" },
        createdAt: new Date("2025-01-09"),
      },
    ],
  },
  {
    id: "enquiry-3",
    contactId: "contact-3",
    enquiryType: "SERVICE" as const,
    message: "Follow up from Tech Conference - interested in consulting",
    preferredDate: new Date("2025-01-25"),
    preferredTime: "Afternoon",
    estimatedValue: 8000,
    stage: "AUTO_RESPONDED" as const,
    nextActionAt: new Date("2025-01-11"),
    sourceUrl: "https://techconference.com/booth/42",
    deletedAt: null,
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-08"),
    contact: mockContacts[2],
    activities: [
      {
        id: "enq-act-5",
        enquiryId: "enquiry-3",
        type: "ENQUIRY_CREATED" as const,
        payload: { enquiryType: "SERVICE", contactName: "Emily Rodriguez" },
        createdAt: new Date("2025-01-08"),
      },
      {
        id: "enq-act-6",
        enquiryId: "enquiry-3",
        type: "STAGE_CHANGED" as const,
        payload: { from: "NEW", to: "AUTO_RESPONDED" },
        createdAt: new Date("2025-01-08"),
      },
    ],
  },
  {
    id: "enquiry-4",
    contactId: "contact-4",
    enquiryType: "PARTNERSHIP" as const,
    message: "Proposal for enterprise partnership renewal with expanded scope",
    preferredDate: new Date("2025-02-01"),
    preferredTime: "9:00 AM",
    estimatedValue: 50000,
    stage: "PROPOSAL_SENT" as const,
    nextActionAt: new Date("2025-01-18"),
    sourceUrl: null,
    deletedAt: null,
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2025-01-08"),
    contact: mockContacts[3],
    activities: [
      {
        id: "enq-act-7",
        enquiryId: "enquiry-4",
        type: "ENQUIRY_CREATED" as const,
        payload: { enquiryType: "PARTNERSHIP", contactName: "David Kim" },
        createdAt: new Date("2024-12-15"),
      },
      {
        id: "enq-act-8",
        enquiryId: "enquiry-4",
        type: "STAGE_CHANGED" as const,
        payload: { from: "NEW", to: "PROPOSAL_SENT" },
        createdAt: new Date("2025-01-08"),
      },
    ],
  },
  {
    id: "enquiry-5",
    contactId: "contact-1",
    enquiryType: "PRODUCT" as const,
    message: "Purchased annual subscription - thank you!",
    preferredDate: null,
    preferredTime: null,
    estimatedValue: 12000,
    stage: "BOOKED_PAID" as const,
    nextActionAt: null,
    sourceUrl: "https://website.com/checkout",
    deletedAt: null,
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-15"),
    contact: mockContacts[0],
    activities: [
      {
        id: "enq-act-9",
        enquiryId: "enquiry-5",
        type: "ENQUIRY_CREATED" as const,
        payload: { enquiryType: "PRODUCT", contactName: "Sarah Chen" },
        createdAt: new Date("2024-11-01"),
      },
      {
        id: "enq-act-10",
        enquiryId: "enquiry-5",
        type: "STAGE_CHANGED" as const,
        payload: { from: "QUALIFIED", to: "BOOKED_PAID" },
        createdAt: new Date("2024-11-15"),
      },
    ],
  },
  {
    id: "enquiry-6",
    contactId: "contact-2",
    enquiryType: "SERVICE" as const,
    message: "Initial call scheduled to discuss needs",
    preferredDate: new Date("2025-01-14"),
    preferredTime: "2:00 PM",
    estimatedValue: 5000,
    stage: "CONTACTED" as const,
    nextActionAt: new Date("2025-01-14"),
    sourceUrl: null,
    deletedAt: null,
    createdAt: new Date("2025-01-07"),
    updatedAt: new Date("2025-01-09"),
    contact: mockContacts[1],
    activities: [
      {
        id: "enq-act-11",
        enquiryId: "enquiry-6",
        type: "ENQUIRY_CREATED" as const,
        payload: { enquiryType: "SERVICE", contactName: "Marcus Williams" },
        createdAt: new Date("2025-01-07"),
      },
      {
        id: "enq-act-12",
        enquiryId: "enquiry-6",
        type: "STAGE_CHANGED" as const,
        payload: { from: "NEW", to: "CONTACTED" },
        createdAt: new Date("2025-01-09"),
      },
    ],
  },
  {
    id: "enquiry-7",
    contactId: "contact-4",
    enquiryType: "GENERAL" as const,
    message: "Budget constraints - unable to proceed at this time",
    preferredDate: null,
    preferredTime: null,
    estimatedValue: 7500,
    stage: "LOST" as const,
    nextActionAt: null,
    sourceUrl: null,
    deletedAt: null,
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-20"),
    contact: mockContacts[3],
    activities: [
      {
        id: "enq-act-13",
        enquiryId: "enquiry-7",
        type: "ENQUIRY_CREATED" as const,
        payload: { enquiryType: "GENERAL", contactName: "David Kim" },
        createdAt: new Date("2024-10-01"),
      },
      {
        id: "enq-act-14",
        enquiryId: "enquiry-7",
        type: "STAGE_CHANGED" as const,
        payload: { from: "PROPOSAL_SENT", to: "LOST" },
        createdAt: new Date("2024-10-20"),
      },
    ],
  },
];

export function getMockEnquiries(params: {
  search?: string;
  stage?: string;
  contactId?: string;
  enquiryType?: string;
  page?: number;
  limit?: number;
}) {
  let filtered = [...mockEnquiries];

  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.contact.firstName.toLowerCase().includes(search) ||
        e.contact.lastName.toLowerCase().includes(search) ||
        e.contact.email.toLowerCase().includes(search) ||
        e.message?.toLowerCase().includes(search)
    );
  }

  if (params.stage) {
    filtered = filtered.filter((e) => e.stage === params.stage);
  }

  if (params.contactId) {
    filtered = filtered.filter((e) => e.contactId === params.contactId);
  }

  if (params.enquiryType) {
    filtered = filtered.filter((e) => e.enquiryType === params.enquiryType);
  }

  const page = params.page || 1;
  const limit = params.limit || 100;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    enquiries: paged,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function getMockEnquiry(id: string) {
  return mockEnquiries.find((e) => e.id === id) || null;
}

// ============================================
// SERVICE TYPE MOCK DATA
// ============================================

export const mockServiceTypes = [
  {
    id: "service-type-1",
    name: "1-Hour Session",
    description: "Standard one-hour consultation or service session",
    durationMinutes: 60,
    price: 150,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "service-type-2",
    name: "Half-Day Workshop",
    description: "Intensive half-day workshop covering advanced topics",
    durationMinutes: 240,
    price: 450,
    isActive: true,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "service-type-3",
    name: "Wedding Package",
    description: "Full-day coverage for wedding events including preparation and ceremony",
    durationMinutes: 480,
    price: 2500,
    isActive: true,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-09-15"),
  },
  {
    id: "service-type-4",
    name: "Consultation",
    description: "Initial consultation to discuss requirements and expectations",
    durationMinutes: 30,
    price: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "service-type-5",
    name: "Corporate Event",
    description: "Corporate event coverage or training session",
    durationMinutes: 180,
    price: 800,
    isActive: true,
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-10-01"),
  },
  {
    id: "service-type-6",
    name: "Quick Session",
    description: "Short 15-minute session for quick tasks or follow-ups",
    durationMinutes: 15,
    price: 50,
    isActive: true,
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-05-15"),
  },
  {
    id: "service-type-7",
    name: "Legacy Package",
    description: "Old package no longer offered",
    durationMinutes: 120,
    price: 200,
    isActive: false,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-06-01"),
  },
];

export function getMockServiceTypes(params: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  let filtered = [...mockServiceTypes];

  if (params.isActive !== undefined) {
    filtered = filtered.filter((s) => s.isActive === params.isActive);
  }

  const page = params.page || 1;
  const limit = params.limit || 50;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    serviceTypes: paged,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function getMockServiceType(id: string) {
  return mockServiceTypes.find((s) => s.id === id) || null;
}

// ============================================
// BOOKING MOCK DATA
// ============================================

export const mockBookings = [
  {
    id: "booking-1",
    contactId: "contact-1",
    serviceTypeId: "service-type-1",
    enquiryId: "enquiry-1",
    startAt: new Date("2025-01-15T10:00:00Z"),
    endAt: new Date("2025-01-15T11:00:00Z"),
    status: "CONFIRMED" as const,
    location: "Main Office - Room A",
    virtualLink: null,
    notes: "Client prefers morning appointments",
    depositPaid: true,
    depositPaidAt: new Date("2025-01-10T14:00:00Z"),
    deletedAt: null,
    createdAt: new Date("2025-01-05T09:00:00Z"),
    updatedAt: new Date("2025-01-10T14:00:00Z"),
    contact: mockContacts[0],
    serviceType: mockServiceTypes[0],
    enquiry: mockEnquiries[0],
    activities: [
      {
        id: "book-act-1",
        bookingId: "booking-1",
        type: "BOOKING_CREATED" as const,
        payload: { serviceTypeName: "1-Hour Session", startAt: "2025-01-15T10:00:00Z", contactName: "Sarah Chen" },
        createdAt: new Date("2025-01-05T09:00:00Z"),
      },
      {
        id: "book-act-2",
        bookingId: "booking-1",
        type: "BOOKING_STATUS_CHANGED" as const,
        payload: { from: "REQUESTED", to: "CONFIRMED" },
        createdAt: new Date("2025-01-10T14:00:00Z"),
      },
    ],
  },
  {
    id: "booking-2",
    contactId: "contact-2",
    serviceTypeId: "service-type-2",
    enquiryId: null,
    startAt: new Date("2025-01-16T13:00:00Z"),
    endAt: new Date("2025-01-16T17:00:00Z"),
    status: "PENDING_DEPOSIT" as const,
    location: null,
    virtualLink: "https://zoom.us/j/123456789",
    notes: "Virtual workshop - team training",
    depositPaid: false,
    depositPaidAt: null,
    deletedAt: null,
    createdAt: new Date("2025-01-08T11:00:00Z"),
    updatedAt: new Date("2025-01-08T11:00:00Z"),
    contact: mockContacts[1],
    serviceType: mockServiceTypes[1],
    enquiry: null,
    activities: [
      {
        id: "book-act-3",
        bookingId: "booking-2",
        type: "BOOKING_CREATED" as const,
        payload: { serviceTypeName: "Half-Day Workshop", startAt: "2025-01-16T13:00:00Z", contactName: "Marcus Williams" },
        createdAt: new Date("2025-01-08T11:00:00Z"),
      },
    ],
  },
  {
    id: "booking-3",
    contactId: "contact-3",
    serviceTypeId: "service-type-4",
    enquiryId: "enquiry-3",
    startAt: new Date("2025-01-14T15:00:00Z"),
    endAt: new Date("2025-01-14T15:30:00Z"),
    status: "REQUESTED" as const,
    location: "Coffee Shop - Downtown",
    virtualLink: null,
    notes: "Initial consultation to discuss project scope",
    depositPaid: false,
    depositPaidAt: null,
    deletedAt: null,
    createdAt: new Date("2025-01-09T16:00:00Z"),
    updatedAt: new Date("2025-01-09T16:00:00Z"),
    contact: mockContacts[2],
    serviceType: mockServiceTypes[3],
    enquiry: mockEnquiries[2],
    activities: [
      {
        id: "book-act-4",
        bookingId: "booking-3",
        type: "BOOKING_CREATED" as const,
        payload: { serviceTypeName: "Consultation", startAt: "2025-01-14T15:00:00Z", contactName: "Emily Rodriguez" },
        createdAt: new Date("2025-01-09T16:00:00Z"),
      },
    ],
  },
  {
    id: "booking-4",
    contactId: "contact-4",
    serviceTypeId: "service-type-3",
    enquiryId: "enquiry-4",
    startAt: new Date("2025-02-14T08:00:00Z"),
    endAt: new Date("2025-02-14T16:00:00Z"),
    status: "CONFIRMED" as const,
    location: "Grand Ballroom - Riverside Hotel",
    virtualLink: null,
    notes: "Corporate annual event - full day coverage",
    depositPaid: true,
    depositPaidAt: new Date("2025-01-12T10:00:00Z"),
    deletedAt: null,
    createdAt: new Date("2025-01-06T14:00:00Z"),
    updatedAt: new Date("2025-01-12T10:00:00Z"),
    contact: mockContacts[3],
    serviceType: mockServiceTypes[2],
    enquiry: mockEnquiries[3],
    activities: [
      {
        id: "book-act-5",
        bookingId: "booking-4",
        type: "BOOKING_CREATED" as const,
        payload: { serviceTypeName: "Wedding Package", startAt: "2025-02-14T08:00:00Z", contactName: "David Kim" },
        createdAt: new Date("2025-01-06T14:00:00Z"),
      },
      {
        id: "book-act-6",
        bookingId: "booking-4",
        type: "BOOKING_STATUS_CHANGED" as const,
        payload: { from: "PENDING_DEPOSIT", to: "CONFIRMED" },
        createdAt: new Date("2025-01-12T10:00:00Z"),
      },
    ],
  },
  {
    id: "booking-5",
    contactId: "contact-1",
    serviceTypeId: "service-type-5",
    enquiryId: null,
    startAt: new Date("2025-01-20T09:00:00Z"),
    endAt: new Date("2025-01-20T12:00:00Z"),
    status: "CONFIRMED" as const,
    location: "TechCorp HQ - Conference Room B",
    virtualLink: null,
    notes: "Follow-up corporate training session",
    depositPaid: true,
    depositPaidAt: new Date("2025-01-11T09:00:00Z"),
    deletedAt: null,
    createdAt: new Date("2025-01-07T10:00:00Z"),
    updatedAt: new Date("2025-01-11T09:00:00Z"),
    contact: mockContacts[0],
    serviceType: mockServiceTypes[4],
    enquiry: null,
    activities: [
      {
        id: "book-act-7",
        bookingId: "booking-5",
        type: "BOOKING_CREATED" as const,
        payload: { serviceTypeName: "Corporate Event", startAt: "2025-01-20T09:00:00Z", contactName: "Sarah Chen" },
        createdAt: new Date("2025-01-07T10:00:00Z"),
      },
      {
        id: "book-act-8",
        bookingId: "booking-5",
        type: "BOOKING_STATUS_CHANGED" as const,
        payload: { from: "REQUESTED", to: "CONFIRMED" },
        createdAt: new Date("2025-01-11T09:00:00Z"),
      },
    ],
  },
  {
    id: "booking-6",
    contactId: "contact-2",
    serviceTypeId: "service-type-6",
    enquiryId: "enquiry-6",
    startAt: new Date("2025-01-13T14:00:00Z"),
    endAt: new Date("2025-01-13T14:15:00Z"),
    status: "COMPLETED" as const,
    location: null,
    virtualLink: "https://meet.google.com/abc-defg-hij",
    notes: "Quick check-in call",
    depositPaid: false,
    depositPaidAt: null,
    deletedAt: null,
    createdAt: new Date("2025-01-10T08:00:00Z"),
    updatedAt: new Date("2025-01-13T14:20:00Z"),
    contact: mockContacts[1],
    serviceType: mockServiceTypes[5],
    enquiry: mockEnquiries[5],
    activities: [
      {
        id: "book-act-9",
        bookingId: "booking-6",
        type: "BOOKING_CREATED" as const,
        payload: { serviceTypeName: "Quick Session", startAt: "2025-01-13T14:00:00Z", contactName: "Marcus Williams" },
        createdAt: new Date("2025-01-10T08:00:00Z"),
      },
      {
        id: "book-act-10",
        bookingId: "booking-6",
        type: "BOOKING_STATUS_CHANGED" as const,
        payload: { from: "CONFIRMED", to: "COMPLETED" },
        createdAt: new Date("2025-01-13T14:20:00Z"),
      },
    ],
  },
  {
    id: "booking-7",
    contactId: "contact-3",
    serviceTypeId: "service-type-1",
    enquiryId: null,
    startAt: new Date("2025-01-10T11:00:00Z"),
    endAt: new Date("2025-01-10T12:00:00Z"),
    status: "NO_SHOW" as const,
    location: "Main Office - Room A",
    virtualLink: null,
    notes: "Client did not arrive - attempted to call",
    depositPaid: false,
    depositPaidAt: null,
    deletedAt: null,
    createdAt: new Date("2025-01-03T15:00:00Z"),
    updatedAt: new Date("2025-01-10T12:15:00Z"),
    contact: mockContacts[2],
    serviceType: mockServiceTypes[0],
    enquiry: null,
    activities: [
      {
        id: "book-act-11",
        bookingId: "booking-7",
        type: "BOOKING_CREATED" as const,
        payload: { serviceTypeName: "1-Hour Session", startAt: "2025-01-10T11:00:00Z", contactName: "Emily Rodriguez" },
        createdAt: new Date("2025-01-03T15:00:00Z"),
      },
      {
        id: "book-act-12",
        bookingId: "booking-7",
        type: "BOOKING_STATUS_CHANGED" as const,
        payload: { from: "CONFIRMED", to: "NO_SHOW" },
        createdAt: new Date("2025-01-10T12:15:00Z"),
      },
    ],
  },
  {
    id: "booking-8",
    contactId: "contact-4",
    serviceTypeId: "service-type-1",
    enquiryId: null,
    startAt: new Date("2025-01-08T16:00:00Z"),
    endAt: new Date("2025-01-08T17:00:00Z"),
    status: "CANCELLED" as const,
    location: "Main Office - Room B",
    virtualLink: null,
    notes: "Cancelled by client - rescheduling for next week",
    depositPaid: false,
    depositPaidAt: null,
    deletedAt: null,
    createdAt: new Date("2025-01-02T09:00:00Z"),
    updatedAt: new Date("2025-01-07T11:00:00Z"),
    contact: mockContacts[3],
    serviceType: mockServiceTypes[0],
    enquiry: null,
    activities: [
      {
        id: "book-act-13",
        bookingId: "booking-8",
        type: "BOOKING_CREATED" as const,
        payload: { serviceTypeName: "1-Hour Session", startAt: "2025-01-08T16:00:00Z", contactName: "David Kim" },
        createdAt: new Date("2025-01-02T09:00:00Z"),
      },
      {
        id: "book-act-14",
        bookingId: "booking-8",
        type: "BOOKING_STATUS_CHANGED" as const,
        payload: { from: "CONFIRMED", to: "CANCELLED" },
        createdAt: new Date("2025-01-07T11:00:00Z"),
      },
    ],
  },
];

export function getMockBookings(params: {
  search?: string;
  status?: string;
  contactId?: string;
  serviceTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  let filtered = [...mockBookings];

  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.contact.firstName.toLowerCase().includes(search) ||
        b.contact.lastName.toLowerCase().includes(search) ||
        b.contact.email.toLowerCase().includes(search) ||
        b.serviceType.name.toLowerCase().includes(search) ||
        b.notes?.toLowerCase().includes(search) ||
        b.location?.toLowerCase().includes(search)
    );
  }

  if (params.status) {
    filtered = filtered.filter((b) => b.status === params.status);
  }

  if (params.contactId) {
    filtered = filtered.filter((b) => b.contactId === params.contactId);
  }

  if (params.serviceTypeId) {
    filtered = filtered.filter((b) => b.serviceTypeId === params.serviceTypeId);
  }

  if (params.dateFrom) {
    const dateFrom = new Date(params.dateFrom);
    filtered = filtered.filter((b) => b.startAt >= dateFrom);
  }

  if (params.dateTo) {
    const dateTo = new Date(params.dateTo);
    filtered = filtered.filter((b) => b.startAt <= dateTo);
  }

  // Sort by startAt ascending
  filtered.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const page = params.page || 1;
  const limit = params.limit || 100;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    bookings: paged,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function getMockBooking(id: string) {
  return mockBookings.find((b) => b.id === id) || null;
}

export function getMockCalendarBookings(startDate: Date, endDate: Date) {
  // Find bookings that overlap with the date range
  // A booking overlaps if: booking.startAt < endDate AND booking.endAt > startDate
  const filtered = mockBookings.filter(
    (b) => b.startAt < endDate && b.endAt > startDate && b.deletedAt === null
  );

  // Sort by startAt ascending
  filtered.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  return { bookings: filtered };
}
