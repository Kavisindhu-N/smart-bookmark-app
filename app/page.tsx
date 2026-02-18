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

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user.user_metadata?.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Your bookmarks sync in real-time across all your devices.
          </p>
        </div>

        {/* Add Bookmark */}
        <div className="mb-8">
          <AddBookmarkForm userId={user.id} />
        </div>

        {/* Bookmark List */}
        <BookmarkList userId={user.id} />
      </main>
    </div>
  );
}
