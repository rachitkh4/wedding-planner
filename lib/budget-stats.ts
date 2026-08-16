import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";

export async function getCategorySpend(userId: string): Promise<Map<string, number>> {
  const rows = await prisma.expense.groupBy({
    by: ["categoryId"],
    where: visibleToWhere(userId),
    _sum: { amount: true },
  });
  return new Map(rows.map((r) => [r.categoryId, Number(r._sum.amount ?? 0)]));
}
