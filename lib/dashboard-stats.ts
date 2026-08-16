import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";

export async function getDashboardStats(userId: string) {
  const visible = visibleToWhere(userId);

  const [
    taskTotal,
    taskDone,
    budgetPlanned,
    expenseSpent,
    guestTotals,
    guestConfirmed,
    vendorTotal,
    vendorBooked,
  ] = await Promise.all([
    prisma.checklistTask.count({ where: visible }),
    prisma.checklistTask.count({ where: { AND: [visible, { done: true }] } }),
    prisma.budgetCategory.aggregate({ _sum: { estimatedAmount: true } }),
    prisma.expense.aggregate({ where: visible, _sum: { amount: true } }),
    prisma.guest.aggregate({ where: visible, _sum: { headcount: true } }),
    prisma.guest.aggregate({
      where: { AND: [visible, { rsvpStatus: "CONFIRMED" }] },
      _sum: { headcount: true },
    }),
    prisma.vendor.count({ where: visible }),
    prisma.vendor.count({
      where: { AND: [visible, { status: { in: ["BOOKED", "PAID", "COMPLETED"] } }] },
    }),
  ]);

  return {
    tasks: { done: taskDone, total: taskTotal },
    budget: {
      spent: Number(expenseSpent._sum.amount ?? 0),
      planned: Number(budgetPlanned._sum.estimatedAmount ?? 0),
    },
    guests: {
      confirmed: guestConfirmed._sum.headcount ?? 0,
      total: guestTotals._sum.headcount ?? 0,
    },
    vendors: { booked: vendorBooked, total: vendorTotal },
  };
}
