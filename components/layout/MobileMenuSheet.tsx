"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAuth } from "@/hooks";
import { useStartNavigation } from "@/components/layout/NavigationProvider";
import {
  getVisibleSidebarSections,
  resolveActiveMenuPath,
  sidebarMenuItems,
  type SidebarMenuItem,
} from "@/lib/sidebar-nav";
import { getMobileDockQuickPaths } from "@/lib/mobile-bottom-nav";

interface MobileMenuSheetProps {
  onNavigate?: () => void;
}

type GridRow =
  | { kind: "section"; label: string; id: string }
  | { kind: "item"; item: SidebarMenuItem };

function SheetHandle() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 1, pb: 0.5 }}>
      <Box
        sx={{
          width: 40,
          height: 4,
          borderRadius: 2,
          bgcolor: "action.disabled",
        }}
      />
    </Box>
  );
}

function GridNavTile({
  item,
  isActive,
  onNavigate,
  onPending,
}: {
  item: SidebarMenuItem;
  isActive: boolean;
  onNavigate?: () => void;
  onPending: (path: string) => void;
}) {
  const theme = useTheme();
  const pathname = usePathname();
  const startNavigation = useStartNavigation();

  return (
    <Box
      component={Link}
      href={item.path}
      prefetch
      onClick={() => {
        if (item.path !== pathname) {
          onPending(item.path);
          startNavigation();
        }
        onNavigate?.();
      }}
      data-cy={`nav-${item.path.slice(1).replace(/\//g, "-")}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.75,
        py: 1.25,
        px: 0.5,
        minHeight: 84,
        textDecoration: "none",
        color: "inherit",
        borderRadius: 2.5,
        bgcolor: isActive
          ? alpha(theme.palette.primary.main, 0.1)
          : alpha(theme.palette.action.hover, 0.04),
        boxShadow: isActive ? `0 0 0 2px ${theme.palette.primary.main}` : "none",
        transition: "background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease",
        WebkitTapHighlightColor: "transparent",
        "&:active": { transform: "scale(0.96)" },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isActive
            ? alpha(theme.palette.primary.main, 0.18)
            : alpha(theme.palette.primary.main, 0.08),
          color: isActive ? "primary.main" : "text.secondary",
          "& .MuiSvgIcon-root": { fontSize: 24 },
        }}
      >
        {item.icon}
      </Box>
      <Typography
        variant="caption"
        align="center"
        sx={{
          fontSize: "0.7rem",
          fontWeight: isActive ? 700 : 600,
          lineHeight: 1.3,
          color: isActive ? "primary.main" : "text.primary",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          width: "100%",
          px: 0.25,
        }}
      >
        {item.label}
      </Typography>
    </Box>
  );
}

function buildGridRows(
  sections: ReturnType<typeof getVisibleSidebarSections>,
  quickPaths: Set<string>
): GridRow[] {
  const rows: GridRow[] = [];

  for (const section of sections) {
    const items = section.items.filter((item) => !quickPaths.has(item.path));
    if (items.length === 0) continue;

    if (section.label) {
      rows.push({ kind: "section", id: section.id, label: section.label });
    }

    for (const item of items) {
      rows.push({ kind: "item", item });
    }
  }

  return rows;
}

/** Expanded mobile menu: single dense grid (items fill rows, no isolated profile row). */
export default function MobileMenuSheet({ onNavigate }: MobileMenuSheetProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const useFourColumns = useMediaQuery(theme.breakpoints.up(400));
  const columns = useFourColumns ? 4 : 3;

  const sections = useMemo(() => getVisibleSidebarSections(user), [user]);
  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const quickPaths = useMemo(() => getMobileDockQuickPaths(user), [user]);
  const gridRows = useMemo(() => buildGridRows(sections, quickPaths), [sections, quickPaths]);

  const activePath = useMemo(
    () => resolveActiveMenuPath(pathname, flatItems),
    [pathname, flatItems]
  );

  const hasItems = gridRows.some((row) => row.kind === "item");

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    sidebarMenuItems.forEach((item) => {
      try {
        router.prefetch(item.path);
      } catch {
        /* ignore */
      }
    });
  }, [router]);

  return (
    <Box sx={{ pb: 2, bgcolor: "background.default" }}>
      <SheetHandle />

      <Typography
        variant="subtitle2"
        fontWeight={800}
        sx={{ px: 2, pb: 1.25, color: "text.primary" }}
      >
        منوی برنامه
      </Typography>

      {hasItems ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: 1,
            px: 2,
            alignItems: "stretch",
          }}
        >
          {gridRows.map((row, index) => {
            if (row.kind === "section") {
              const isFirstSectionLabel = !gridRows
                .slice(0, index)
                .some((r) => r.kind === "section");

              return (
                <Typography
                  key={`section-${row.id}`}
                  component="div"
                  variant="caption"
                  sx={{
                    gridColumn: "1 / -1",
                    mt: isFirstSectionLabel ? 0 : 1,
                    mb: 0.25,
                    px: 0.5,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: "text.secondary",
                  }}
                >
                  {row.label}
                </Typography>
              );
            }

            return (
              <GridNavTile
                key={row.item.path}
                item={row.item}
                isActive={activePath === row.item.path || pendingPath === row.item.path}
                onNavigate={onNavigate}
                onPending={setPendingPath}
              />
            );
          })}
        </Box>
      ) : (
        <Box
          sx={{
            mx: 2,
            p: 2,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.info.main, 0.06),
            border: "1px dashed",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            میانبرهای اصلی در نوار پایین هستند.
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
            خانه · آزمون‌ها · اعلان
          </Typography>
        </Box>
      )}
    </Box>
  );
}
