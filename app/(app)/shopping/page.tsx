import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShoppingItemRow } from "@/components/shopping/ShoppingItemRow";
import { AddShoppingItemForm } from "@/components/shopping/AddShoppingItemForm";

export default async function ShoppingPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [members, items] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.shoppingItem.findMany({
      where: visibleToWhere(userId),
      orderBy: { id: "asc" },
      include: { sharedWith: { select: { id: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Shopping List" subtitle="Everything left to buy before the big day." />

      <div className="mb-5">
        <AddShoppingItemForm />
      </div>

      {items.length === 0 ? (
        <EmptyState title="Nothing on the list yet" hint="Add your first item above." />
      ) : (
        <Card className="flex flex-col gap-1">
          {items.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={{
                id: item.id,
                item: item.item,
                category: item.category,
                budgetEstimate:
                  item.budgetEstimate === null ? null : Number(item.budgetEstimate),
                bought: item.bought,
                ownerId: item.ownerId,
                visibility: item.visibility,
                sharedWith: item.sharedWith,
              }}
              members={members}
              currentUserId={userId}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
