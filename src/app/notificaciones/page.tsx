import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { CustomerNotifications } from "@/components/account/CustomerNotifications";

export default function NotificationsPage() {
  return (
    <CustomerAccountShell mainClassName="flex flex-1 flex-col">
      <CustomerNotifications />
    </CustomerAccountShell>
  );
}
