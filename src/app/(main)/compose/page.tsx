import { requireUser } from "@/lib/auth";
import { Composer } from "@/components/composer";
import { BackHeader } from "@/components/back-header";

export default async function ComposePage() {
  const user = await requireUser();
  return (
    <>
      <BackHeader title="Nova postagem" />
      <Composer user={user} autoFocus />
    </>
  );
}
