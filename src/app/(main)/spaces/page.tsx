import Link from "next/link";
import { Radio, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { CreateSpace } from "./create-space";

export default async function SpacesPage() {
  await requireUser();

  const spaces = await prisma.space.findMany({
    where: { status: "LIVE" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      host: { select: { name: true, username: true, avatarUrl: true } },
      _count: { select: { participants: true } },
    },
  });

  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur bg-bg/70 border-b border-border">
        <h1 className="text-xl font-bold px-4 py-4">Spaces</h1>
      </header>

      <CreateSpace />

      {spaces.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold">Nenhum Space ao vivo</h2>
          <p className="text-muted mt-2">Inicie um acima e convide a galera pra ouvir.</p>
        </div>
      ) : (
        spaces.map((s) => (
          <Link
            key={s.id}
            href={`/spaces/${s.id}`}
            className="flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-white/[0.03] transition"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-like text-white text-xs font-bold px-2 py-0.5 rounded">
                  AO VIVO
                </span>
                <span className="text-muted text-sm flex items-center gap-1">
                  <Users className="w-4 h-4" /> {s._count.participants}
                </span>
              </div>
              <p className="font-bold text-[15px] truncate mt-1">{s.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Avatar name={s.host.name} src={s.host.avatarUrl} size={20} />
                <span className="text-muted text-sm truncate">
                  {s.host.name} · @{s.host.username}
                </span>
              </div>
            </div>
          </Link>
        ))
      )}
    </>
  );
}
