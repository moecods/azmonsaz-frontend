"use client";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import QuizIcon from "@mui/icons-material/Quiz";
import { useRouter } from "next/navigation";
import type { Group } from "@/services/groups/GroupService";
import { getGroupMemberCount } from "@/lib/groups-list-utils";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { GroupPersonStack } from "@/components/groups/GroupPersonStack";

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const memberCount = getGroupMemberCount(group);
  const teachers = group.teachers ?? [];
  const memberPreview =
    group.member_preview?.length ? group.member_preview : group.users ?? [];

  const openDetail = () => router.push(`/groups/${group.id}`);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2.5,
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
      }}
    >
      <CardActionArea onClick={openDetail} sx={{ height: "100%", alignItems: "stretch" }}>
        <CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <GroupAvatar
              name={group.name}
              avatarUrl={group.avatar_url}
              sx={{ width: 52, height: 52, borderRadius: 2, fontSize: "1.2rem", flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={800} noWrap title={group.name}>
                {group.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.45,
                  minHeight: 42,
                }}
              >
                {group.description?.trim() || "بدون توضیحات"}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mt: 1.5, color: "text.secondary" }}
          >
            <PeopleIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {memberCount.toLocaleString("fa-IR")} عضو
            </Typography>
            {(group.exams_count ?? 0) > 0 && (
              <>
                <Typography variant="caption" color="text.disabled">
                  ·
                </Typography>
                <QuizIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {group.exams_count!.toLocaleString("fa-IR")} آزمون
                </Typography>
              </>
            )}
          </Stack>

          {memberPreview.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <GroupPersonStack
                people={memberPreview}
                maxVisible={5}
                size={30}
                totalCount={memberCount}
              />
            </Box>
          )}

          {teachers.length > 0 && (
            <Box
              sx={{
                mt: "auto",
                pt: 1.5,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <GroupPersonStack people={teachers} maxVisible={4} size={28} />
            </Box>
          )}

          {memberPreview.length === 0 && teachers.length === 0 && (
            <Box
              sx={{
                mt: "auto",
                pt: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.warning.main, 0.08),
              }}
            >
              <Typography variant="caption" color="text.secondary">
                هنوز عضوی اضافه نشده — برای مدیریت کلیک کنید
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
