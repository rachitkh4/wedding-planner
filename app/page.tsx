import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getGuest } from "@/lib/guest-session";

// The one link shared with guests is the site root: send each visitor to the
// right side of the app.
export default async function RootPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  if (await getGuest()) redirect("/g/home");
  redirect("/g");
}
