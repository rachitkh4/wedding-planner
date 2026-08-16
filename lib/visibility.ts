/**
 * Reused by every visibility-enabled model (ChecklistTask, Expense, Guest,
 * Vendor, ShoppingItem) — a row is visible to `userId` if they own it, it's
 * shared with everyone, or it's shared with a select list that includes them.
 * Spread the result into that model's `where.AND` alongside any other filters.
 */
export function visibleToWhere(userId: string) {
  return {
    OR: [
      { ownerId: userId },
      { visibility: "EVERYONE" as const },
      { visibility: "SELECTED" as const, sharedWith: { some: { id: userId } } },
    ],
  };
}

export type SimpleUser = { id: string; displayName: string | null; email: string };
