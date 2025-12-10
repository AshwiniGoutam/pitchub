// DashboardHeader.tsx
"use client";

import { useState } from "react";
import { Calendar, Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type Email = {
  id: string;
  subject: string;
  from: string;
  relevanceScore?: number;
  status: string;
};

interface DashboardHeaderProps {
  pendingEmails: Email[];
}

export default function DashboardHeader({
  pendingEmails,
  title,
}: DashboardHeaderProps) {
  console.log("pendingEmails", pendingEmails);

  const [open, setOpen] = useState(false);

  const pendingCount = pendingEmails.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="flex h-16 items-center justify-between px-8">
          <h1 className="text-2xl font-bold">{title || 'Dashboard'}</h1>
          <div className="flex items-center gap-4">
            {/* <Button variant="outline" className="gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button> */}

            {/* Bell + notification dot */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Notification Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pending Emails</DialogTitle>
            <DialogDescription>
              These emails are currently marked as{" "}
              <span className="font-semibold">Pending</span>. No action is
              required from your side right now.
            </DialogDescription>
          </DialogHeader>

          {pendingCount === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No pending emails at the moment.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{pendingCount} email(s) in pending state</span>
              </div>

              <ScrollArea className="max-h-80 overflow-y-scroll pr-2">
                <div className="space-y-2">
                  {pendingEmails && pendingEmails?.map((email) => (
                    <div
                      key={email.id}
                      className="flex gap-3 rounded-md border bg-muted/40 p-3 text-sm"
                    >
                      <div className="mt-0.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium line-clamp-1">
                            {email.subject || "(No subject)"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          From: {email.from || "Unknown"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-[#F7CB73] text-dark"
                          >
                            Pending
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(email.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
