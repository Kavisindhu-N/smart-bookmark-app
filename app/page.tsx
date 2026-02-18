import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import BookmarkManager from "@/app/components/BookmarkManager";
import MobileAddBookmark from "@/app/components/MobileAddBookmark";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 pt-14 pb-10 flex justify-center">
        <BookmarkManager userId={user.id} />
      </main>

      {/* Mobile FAB and Modal */}
      <MobileAddBookmark userId={user.id} />
    </div>
  );
}
