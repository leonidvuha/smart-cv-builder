import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect("/auth/signin")

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-6">Welcome, {session.user?.name}!</p>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}