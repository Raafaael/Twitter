import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { BackHeader } from "@/components/back-header";
import { SpaceRoom } from "@/components/space-room";

type Params = { params: Promise<{ id: string }> };

export default async function SpacePage({ params }: Params) {
  const { id } = await params;
  const me = await requireUser();

  const space = await prisma.space.findUnique({
    where: { id },
    include: { host: { select: { name: true, username: true } } },
  });
  if (!space) notFound();

  if (space.status !== "LIVE") {
    return (
      <>
        <BackHeader title="Space encerrado" />
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold">Este Space foi encerrado</h2>
          <p className="text-muted mt-2">"{space.title}" não está mais ao vivo.</p>
          <Link
            href="/spaces"
            className="inline-block mt-4 bg-accent hover:bg-accentHover text-white font-bold rounded-full px-5 h-10 leading-10"
          >
            Ver outros Spaces
          </Link>
        </div>
      </>
    );
  }

  const isHost = space.hostId === me.id;

  return (
    <>
      <BackHeader title={space.title} subtitle={`Space de @${space.host.username}`} />
      <SpaceRoom spaceId={space.id} title={space.title} isHost={isHost} />
    </>
  );
}
