"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from "@mui/icons-material/Send";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useAuth } from "@/hooks";
import { useGroups } from "@/hooks/useGroups";
import { QuestionBankPageHeader } from "@/components/questions/question-bank";
import {
  NotificationInboxPanel,
  NotificationStatsChips,
  useNotificationStats,
} from "@/components/notifications/NotificationInboxPanel";
import { NotificationSendPanel } from "@/components/notifications/NotificationSendPanel";
import {
  getNotificationSendAccess,
  getSendableGroups,
} from "@/lib/notification-display";
import { hasPermission } from "@/lib/permissions";

type NotificationsTab = "inbox" | "send";

export default function NotificationsPageContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<NotificationsTab>("inbox");
  const { unread } = useNotificationStats();

  const mightSend =
    hasPermission(user?.permissions, "manage users") ||
    hasPermission(user?.permissions, "create exams");

  const { data: groups = [] } = useGroups({ enabled: mightSend });

  const sendAccess = useMemo(() => {
    if (!user) {
      return { canAdminBroadcast: false, canGroupSend: false, showSendTab: false };
    }
    const sendableGroupCount = getSendableGroups(
      groups,
      user.id,
      hasPermission(user.permissions, "manage users")
    ).length;
    return getNotificationSendAccess(user, sendableGroupCount);
  }, [user, groups]);

  useEffect(() => {
    if (!sendAccess.showSendTab && tab === "send") {
      setTab("inbox");
    }
  }, [sendAccess.showSendTab, tab]);

  if (!user) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <QuestionBankPageHeader
        title="اعلان‌ها"
        subtitle="پیام‌ها، یادآوری‌های آزمون و اعلان‌های سیستمی"
        icon={<NotificationsActiveIcon />}
        stats={<NotificationStatsChips unread={unread} />}
      />

      {sendAccess.showSendTab ? (
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2.5,
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value: NotificationsTab) => setTab(value)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<InboxIcon />} iconPosition="start" label="صندوق ورودی" value="inbox" />
            <Tab icon={<SendIcon />} iconPosition="start" label="ارسال پیام" value="send" />
          </Tabs>

          <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
            {tab === "inbox" ? (
              <NotificationInboxPanel />
            ) : (
              <NotificationSendPanel
                userId={user.id}
                canAdminBroadcast={sendAccess.canAdminBroadcast}
                canGroupSend={sendAccess.canGroupSend}
              />
            )}
          </Box>
        </Box>
      ) : (
        <NotificationInboxPanel />
      )}
    </Box>
  );
}
