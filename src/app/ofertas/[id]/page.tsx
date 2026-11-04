import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { NotificationPromotion } from "@/components/account/CustomerNotifications";

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <CustomerAccountShell>
      <NotificationPromotion id={id} />
    </CustomerAccountShell>
  );
}
