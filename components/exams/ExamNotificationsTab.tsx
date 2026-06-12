"use client";

import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useExamNotifications, useSendExamNotification } from "@/hooks/useNotifications";
import { ExamNotificationComposer } from "@/components/exams/notifications/ExamNotificationComposer";
import { ExamNotificationHistory } from "@/components/exams/notifications/ExamNotificationHistory";

interface ExamNotificationsTabProps {
  examId: number;
  participants: Array<{
    id: number;
    user?: {
      id: number;
      name: string;
      phone_number?: string | null;
      email?: string | null;
    } | null;
  }>;
  isPublished?: boolean;
}

export default function ExamNotificationsTab({
  examId,
  participants,
  isPublished = false,
}: ExamNotificationsTabProps) {
  const [message, setMessage] = useState("");
  const [recipientSelection, setRecipientSelection] = useState<number[] | "all">("all");

  const { data: notifications, isLoading, error } = useExamNotifications(examId);
  const sendMutation = useSendExamNotification(examId);

  const participantOptions = useMemo(
    () =>
      participants
        .filter((p) => p.user)
        .map((p) => ({
          id: p.user!.id,
          name: p.user!.name,
          phone_number: p.user!.phone_number,
          email: p.user!.email,
        })),
    [participants]
  );

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(
      {
        message: message.trim(),
        send_to_all: recipientSelection === "all",
        recipient_ids: recipientSelection === "all" ? undefined : recipientSelection,
      },
      {
        onSuccess: () => {
          setMessage("");
          setRecipientSelection("all");
        },
      }
    );
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1.1fr)" },
        gap: { xs: 2, lg: 3 },
        alignItems: "start",
      }}
    >
      <ExamNotificationComposer
        message={message}
        onMessageChange={setMessage}
        recipientSelection={recipientSelection}
        onRecipientChange={setRecipientSelection}
        participants={participantOptions}
        isPublished={isPublished}
        isPending={sendMutation.isPending}
        isError={sendMutation.isError}
        errorMessage={
          sendMutation.error instanceof Error ? sendMutation.error.message : undefined
        }
        onSend={handleSend}
        onResetError={() => sendMutation.reset()}
      />

      <ExamNotificationHistory
        notifications={notifications}
        isLoading={isLoading}
        error={error}
        participants={participants}
      />
    </Box>
  );
}
