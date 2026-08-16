import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";
import { CategoryFilter } from "@/components/expenses/CategoryFilter";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";

const SORT_FIELDS = ["date", "amount", "description"] as const;
type SortField = (typeof SORT_FIELDS)[number];

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const sort: SortField = SORT_FIELDS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : "date";
  const dir: "asc" | "desc" = params.dir === "asc" ? "asc" : "desc";
  const categoryId = params.category || undefined;

  const session = await auth();
  const userId = session!.user.id;

  const [categories, members, expenses] = await Promise.all([
    prisma.budgetCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.expense.findMany({
      where: {
        AND: [visibleToWhere(userId), ...(categoryId ? [{ categoryId }] : [])],
      },
      orderBy: { [sort]: dir },
      include: { sharedWith: { select: { id: true } } },
    }),
  ]);

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  function sortHref(field: SortField) {
    const nextDir = sort === field && dir === "desc" ? "asc" : "desc";
    const search = new URLSearchParams();
    if (categoryId) search.set("category", categoryId);
    search.set("sort", field);
    search.set("dir", nextDir);
    return `/expenses?${search.toString()}`;
  }

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    const active = sort === field;
    return (
      <Link href={sortHref(field)} className="inline-flex items-center gap-1 hover:text-maroon">
        {label}
        {active && (dir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
      </Link>
    );
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Every rupee spent, logged and categorised."
        action={<CategoryFilter categories={categories} />}
      />

      <div className="mb-5">
        <AddExpenseForm categories={categories} />
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="No expenses logged yet" hint="Add your first one above." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                <th className="px-3 py-3">
                  <SortHeader field="date" label="Date" />
                </th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">
                  <SortHeader field="description" label="Description" />
                </th>
                <th className="px-3 py-3">
                  <SortHeader field="amount" label="Amount" />
                </th>
                <th className="px-3 py-3">Paid by</th>
                <th className="px-3 py-3">Method</th>
                <th className="px-3 py-3"></th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <ExpenseRow
                  key={e.id}
                  expense={{
                    id: e.id,
                    date: e.date.toISOString(),
                    categoryId: e.categoryId,
                    description: e.description,
                    amount: Number(e.amount),
                    paidBy: e.paidBy,
                    paymentMethod: e.paymentMethod,
                    ownerId: e.ownerId,
                    visibility: e.visibility,
                    sharedWith: e.sharedWith,
                  }}
                  categories={categories}
                  members={members}
                  currentUserId={userId}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink/10 font-medium">
                <td className="px-3 py-3 text-ink/60" colSpan={3}>
                  Total {categoryId ? `— ${categoryMap.get(categoryId)}` : ""}
                </td>
                <td className="px-3 py-3 text-maroon">{formatINR(total)}</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </Card>
      )}
    </div>
  );
}
