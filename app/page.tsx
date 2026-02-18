import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import AddBookmarkForm from "@/app/components/AddBookmarkForm";
import BookmarkList from "@/app/components/BookmarkList";

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
        <div className="flex flex-col lg:flex-row gap-12 items-start w-full">
          <div className="w-full lg:w-[380px] lg:flex-shrink-0 lg:sticky lg:top-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user.user_metadata?.full_name?.split(" ")[0] || "there"}!
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Your bookmarks sync in real-time across all your devices.
              </p>
            </div>
            <AddBookmarkForm userId={user.id} />
          </div>

          <div className="w-full lg:flex-1 min-w-0 backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <BookmarkList userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
