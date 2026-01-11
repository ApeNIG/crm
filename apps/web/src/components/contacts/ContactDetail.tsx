"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagBadge } from "./TagBadge";
import { ActivityTimeline } from "./ActivityTimeline";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react";
import type { ContactWithAll } from "@/types/contact";

interface ContactDetailProps {
  contact: ContactWithAll;
  onDelete: () => Promise<void>;
  isDeleting?: boolean;
}

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  LEAD: "secondary",
  CUSTOMER: "success",
  PAST_CUSTOMER: "default",
  COLD: "warning",
  DO_NOT_CONTACT: "destructive",
};

const statusLabels: Record<string, string> = {
  LEAD: "Lead",
  CUSTOMER: "Customer",
  PAST_CUSTOMER: "Past Customer",
  COLD: "Cold",
  DO_NOT_CONTACT: "Do Not Contact",
};

const sourceLabels: Record<string, string> = {
  INSTAGRAM: "Instagram",
  WEBSITE: "Website",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

export function ContactDetail({
  contact,
  onDelete,
  isDeleting,
}: ContactDetailProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`
      )
    ) {
      await onDelete();
      router.push("/contacts");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {contact.firstName} {contact.lastName}
              </h1>
              <Badge variant={statusColors[contact.status]}>
                {statusLabels[contact.status]}
              </Badge>
            </div>
            <p className="text-gray-500">
              Added {formatDate(contact.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/contacts/${contact.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="col-span-2 space-y-6">
          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Source</p>
                    <p>{sourceLabels[contact.source]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p>{formatDate(contact.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Marketing consent */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Marketing Consent</p>
                {contact.marketingOptIn ? (
                  <Badge variant="success">
                    Opted in on {formatDate(contact.marketingOptInAt!)}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not opted in</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.notes ? (
                <p className="whitespace-pre-wrap">{contact.notes}</p>
              ) : (
                <p className="text-gray-400 italic">No notes added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={contact.activities} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map(({ tag }) => (
                    <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No tags</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Activities</span>
                <span className="font-medium">{contact.activities.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email Status</span>
                <Badge
                  variant={
                    contact.emailStatus === "VALID" ? "success" : "destructive"
                  }
                >
                  {contact.emailStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
