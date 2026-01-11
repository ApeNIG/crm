"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceType } from "@/types/service-type";

interface ServiceTypeListProps {
  serviceTypes: ServiceType[];
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

function formatPrice(price: unknown): string {
  if (price === null || price === undefined || price === "") {
    return "-";
  }
  // Handle Prisma Decimal, string, or number
  const numPrice = typeof price === "object" && price !== null && "toNumber" in price
    ? (price as { toNumber: () => number }).toNumber()
    : typeof price === "string"
    ? parseFloat(price)
    : Number(price);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(numPrice);
}

export function ServiceTypeList({
  serviceTypes,
  onDelete,
  isDeleting,
}: ServiceTypeListProps) {
  if (serviceTypes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <p className="mb-2">No service types found.</p>
            <Link href="/settings/services/new">
              <Button>Add Service Type</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium text-gray-500">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Duration</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceTypes.map((serviceType) => (
                <tr
                  key={serviceType.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-medium">{serviceType.name}</p>
                      {serviceType.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {serviceType.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm">
                      {formatDuration(serviceType.durationMinutes)}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm">{formatPrice(serviceType.price)}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge variant={serviceType.isActive ? "success" : "secondary"}>
                      {serviceType.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/settings/services/${serviceType.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      {onDelete && serviceType.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(serviceType.id)}
                          disabled={isDeleting}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
