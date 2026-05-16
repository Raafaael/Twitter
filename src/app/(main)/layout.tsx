import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { RightRail } from "@/components/right-rail";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-[1290px] flex">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0 border-x border-border min-h-screen max-w-[600px] w-full mx-auto sm:mx-0">
        {children}
      </main>
      <RightRail currentUserId={user.id} />
    </div>
  );
}
