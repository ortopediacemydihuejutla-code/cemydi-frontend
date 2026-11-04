import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { CustomerNotificationRedirect } from "@/components/account/CustomerNotifications";

export default async function NotificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <CustomerAccountShell>
      <CustomerNotificationRedirect id={id} />
    </CustomerAccountShell>
  );
}
