"use client";

import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { ExamCapabilities, ExamWithParticipants } from "@/services/exams/ExamService";

export interface ExamManageActionsMenuProps {
  exam: ExamWithParticipants;
  capabilities: ExamCapabilities;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onPrint: () => void;
  onReleaseResults: () => void;
}

export function ExamManageActionsMenu({
  exam,
  capabilities,
  anchorEl,
  onClose,
  onPublish,
  onUnpublish,
  onActivate,
  onDeactivate,
  onPrint,
  onReleaseResults,
}: ExamManageActionsMenuProps) {
  const questionsCount = exam.questions_count || 0;

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      {capabilities.can_release_results &&
        exam.result_release_requires_manual &&
        exam.status === "published" &&
        !exam.results_released_at && (
          <MenuItem
            onClick={() => {
              onReleaseResults();
              onClose();
            }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>انتشار نتایج</ListItemText>
          </MenuItem>
        )}

      {exam.type === "offline" && (
        <MenuItem
          onClick={() => {
            onPrint();
            onClose();
          }}
        >
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>چاپ برگه امتحان</ListItemText>
        </MenuItem>
      )}

      {(capabilities.can_publish ||
        capabilities.can_activate ||
        capabilities.can_deactivate) && <Divider />}

      {capabilities.can_publish &&
        (exam.status === "published" ? (
          <MenuItem
            onClick={() => {
              onUnpublish();
              onClose();
            }}
          >
            <ListItemIcon>
              <UnpublishedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>لغو انتشار</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onPublish();
              onClose();
            }}
            disabled={questionsCount === 0}
            title={questionsCount === 0 ? "ابتدا حداقل یک سوال اضافه کنید" : ""}
            data-cy="exam-publish-action"
          >
            <ListItemIcon>
              <PublishIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>انتشار آزمون</ListItemText>
          </MenuItem>
        ))}

      {exam.is_active
        ? capabilities.can_deactivate && (
            <MenuItem
              onClick={() => {
                onDeactivate();
                onClose();
              }}
            >
              <ListItemIcon>
                <PowerOffIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>غیرفعال کردن</ListItemText>
            </MenuItem>
          )
        : capabilities.can_activate && (
            <MenuItem
              onClick={() => {
                onActivate();
                onClose();
              }}
            >
              <ListItemIcon>
                <PowerSettingsNewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>فعال کردن</ListItemText>
            </MenuItem>
          )}
    </Menu>
  );
}
