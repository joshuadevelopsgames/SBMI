import { redirect } from "next/navigation";

/** SOW US18: For non-administrators, "View reports" is limited to Payment History. */
export default function ReportsPage() {
  redirect("/dashboard/payments#history");
}
