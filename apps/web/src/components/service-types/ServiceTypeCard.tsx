"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceType } from "@/types/service-type";

interface ServiceTypeCardProps {
  serviceType: ServiceType;
  onClick?: () => void;
  selected?: boolean;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

function formatPrice(price: unknown): string {
  if (price === null || price === undefined || price === "") {
    return "Free";
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

export function ServiceTypeCard({
  serviceType,
  onClick,
  selected,
}: ServiceTypeCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? "ring-2 ring-blue-500 bg-blue-50" : ""
      } ${!serviceType.isActive ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{serviceType.name}</CardTitle>
          {!serviceType.isActive && (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {serviceType.description && (
          <p className="text-sm text-gray-600 mb-3">{serviceType.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {formatDuration(serviceType.durationMinutes)}
          </span>
          <Badge variant="outline" className="font-semibold">
            {formatPrice(serviceType.price)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
