import { redirect } from "next/navigation";

// Templates page is no longer needed — we use a single universal design.
// Redirect to chat page for backwards compatibility with old links.
export default function TemplatesPage() {
  redirect("/chat");
}
