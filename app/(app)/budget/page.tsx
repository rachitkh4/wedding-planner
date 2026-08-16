import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCategorySpend } from "@/lib/budget-stats";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/Card";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryRow } from "@/components/budget/CategoryRow";
import { AddCategoryForm } from "@/components/budget/AddCategoryForm";

export default async function BudgetPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [categories, spendMap] = await Promise.all([
    prisma.budgetCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    getCategorySpend(userId),
  ]);

  const totalPlanned = categories.reduce((sum, c) => sum + Number(c.estimatedAmount), 0);
  const totalSpent = categories.reduce((sum, c) => sum + (spendMap.get(c.id) ?? 0), 0);

  return (
    <div>
      <PageHeader title="Budget" subtitle="Estimated vs. actual, by category." />

      <Card className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink/70">Overall</span>
          <span className="text-ink/60">
            {formatINR(totalSpent)} of {formatINR(totalPlanned)}
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar ratio={totalPlanned > 0 ? totalSpent / totalPlanned : 0} />
        </div>
      </Card>

      {categories.length === 0 ? (
        <EmptyState title="No budget categories yet" hint="Add one below to get started." />
      ) : (
        <Card className="flex flex-col gap-1">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={{ id: c.id, name: c.name, estimatedAmount: Number(c.estimatedAmount) }}
              spent={spendMap.get(c.id) ?? 0}
            />
          ))}
        </Card>
      )}

      <div className="mt-5">
        <AddCategoryForm />
      </div>
    </div>
  );
}
