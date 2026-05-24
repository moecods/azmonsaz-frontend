import { describe, expect, it } from "vitest";
import {
  filterAndSortGroups,
  getGroupMemberCount,
  computeGroupStats,
} from "@/lib/groups-list-utils";
import type { Group } from "@/services/groups/GroupService";

function group(partial: Partial<Group> & { id: number; name: string }): Group {
  return {
    created_by: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("groups-list-utils", () => {
  it("filters by search in name and members", () => {
    const groups = [
      group({ id: 1, name: "ریاضی", users_count: 5 }),
      group({
        id: 2,
        name: "فیزیک",
        users: [{ id: 10, name: "علی احمدی", phone_number: "09121234567" }],
      }),
    ];
    const result = filterAndSortGroups(groups, {
      search: "علی",
      size: "all",
      sort: "newest",
      creatorId: "",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("filters empty groups", () => {
    const groups = [
      group({ id: 1, name: "A", users_count: 0 }),
      group({ id: 2, name: "B", users_count: 3 }),
    ];
    const result = filterAndSortGroups(groups, {
      search: "",
      size: "empty",
      sort: "newest",
      creatorId: "",
    });
    expect(result.map((g) => g.id)).toEqual([1]);
  });

  it("computes stats", () => {
    const stats = computeGroupStats([
      group({ id: 1, name: "A", users_count: 2 }),
      group({ id: 2, name: "B", users_count: 0 }),
    ]);
    expect(stats.totalGroups).toBe(2);
    expect(stats.totalMembers).toBe(2);
    expect(stats.emptyGroups).toBe(1);
    expect(getGroupMemberCount(group({ id: 3, name: "C", users: [{ id: 1, name: "x", phone_number: "1" }] }))).toBe(1);
  });
});
