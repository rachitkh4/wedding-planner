import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { VendorRow } from "@/components/vendors/VendorRow";
import { AddVendorForm } from "@/components/vendors/AddVendorForm";

export default async function VendorsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [members, vendors] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vendor.findMany({
      where: visibleToWhere(userId),
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: { sharedWith: { select: { id: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Vendors" subtitle="Everyone you're hiring, in one place." />

      <div className="mb-5">
        <AddVendorForm />
      </div>

      {vendors.length === 0 ? (
        <EmptyState title="No vendors yet" hint="Add your first vendor above." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Vendor</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Quoted</th>
                <th className="px-3 py-3">Advance</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3"></th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <VendorRow
                  key={vendor.id}
                  vendor={{
                    id: vendor.id,
                    category: vendor.category,
                    name: vendor.name,
                    contact: vendor.contact,
                    quotedCost: vendor.quotedCost === null ? null : Number(vendor.quotedCost),
                    advancePaid: Number(vendor.advancePaid),
                    status: vendor.status,
                    ownerId: vendor.ownerId,
                    visibility: vendor.visibility,
                    sharedWith: vendor.sharedWith,
                  }}
                  members={members}
                  currentUserId={userId}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
