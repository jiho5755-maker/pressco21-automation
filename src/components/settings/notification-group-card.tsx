"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationGroupCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function NotificationGroupCard({
  title,
  description,
  children,
}: NotificationGroupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 pt-0">{children}</CardContent>
    </Card>
  );
}
