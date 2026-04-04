import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const templates = await prisma.template.findMany();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-2">Choose your template</h1>
      <p className="text-gray-400 mb-8">
        Select a template to start building your resume
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-700 rounded-xl p-6 hover:border-white cursor-pointer transition-colors"
          >
            <div className="h-48 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-500">Preview</span>
            </div>
            <h2 className="text-xl font-semibold">{template.name}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {template.isPremium ? "Premium" : "Free"}
            </p>
            <button className="mt-4 w-full bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-100">
              Use this template
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
