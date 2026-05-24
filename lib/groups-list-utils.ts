import type { Group } from "@/services/groups/GroupService";

export type GroupSort = "newest" | "oldest" | "name" | "members_desc" | "members_asc";
export type GroupSizeFilter = "all" | "empty" | "small" | "medium" | "large";

export interface GroupsListFilters {
  search: string;
  size: GroupSizeFilter;
  sort: GroupSort;
  creatorId: number | "";
}

export function getGroupMemberCount(group: Group): number {
  return group.users_count ?? group.users?.length ?? 0;
}

export function computeGroupStats(groups: Group[]) {
  const totalMembers = groups.reduce((sum, g) => sum + getGroupMemberCount(g), 0);
  const emptyGroups = groups.filter((g) => getGroupMemberCount(g) === 0).length;
  return {
    totalGroups: groups.length,
    totalMembers,
    emptyGroups,
  };
}

function matchesSize(count: number, size: GroupSizeFilter): boolean {
  switch (size) {
    case "empty":
      return count === 0;
    case "small":
      return count >= 1 && count <= 10;
    case "medium":
      return count >= 11 && count <= 50;
    case "large":
      return count > 50;
    default:
      return true;
  }
}

function matchesSearch(group: Group, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (group.name.toLowerCase().includes(q)) return true;
  if (group.description?.toLowerCase().includes(q)) return true;
  if (group.creator?.name?.toLowerCase().includes(q)) return true;

  if ((group.teachers ?? []).some((t) => t.name?.toLowerCase().includes(q))) return true;

  return (group.users ?? []).some(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.phone_number?.includes(q) ||
      u.national_id?.includes(q)
  );
}

export function filterAndSortGroups(groups: Group[], filters: GroupsListFilters): Group[] {
  let result = groups.filter((group) => {
    if (filters.creatorId !== "" && group.created_by !== filters.creatorId) {
      return false;
    }
    const count = getGroupMemberCount(group);
    if (!matchesSize(count, filters.size)) return false;
    if (!matchesSearch(group, filters.search)) return false;
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "name":
        return a.name.localeCompare(b.name, "fa");
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "members_desc":
        return getGroupMemberCount(b) - getGroupMemberCount(a);
      case "members_asc":
        return getGroupMemberCount(a) - getGroupMemberCount(b);
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return result;
}

export function formatGroupDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Tehran",
    });
  } catch {
    return "—";
  }
}

export function uniqueCreators(groups: Group[]): Array<{ id: number; name: string }> {
  const map = new Map<number, string>();
  for (const g of groups) {
    if (g.creator?.id && g.creator.name) {
      map.set(g.creator.id, g.creator.name);
    }
  }
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));
}
