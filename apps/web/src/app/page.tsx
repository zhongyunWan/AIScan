import { redirect } from "next/navigation";

import { toDateKey } from "@/lib/utils/date";

export default function HomePage() {
  redirect(`/date/${toDateKey(new Date())}`);
}
