import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { Avatar } from "./avatar";
import { FollowButton } from "./follow-button";

export async function RightRail({ currentUserId }: { currentUserId: string }) {
  const followingIds = (
    await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    })
  ).map((f) => f.followingId);

  const suggested = await prisma.user.findMany({
    where: { id: { notIn: [...followingIds, currentUserId] } },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, username: true, avatarUrl: true },
  });

  return (
    <aside className="hidden lg:block w-[350px] shrink-0 px-6 py-2 sticky top-0 h-screen overflow-y-auto scroll-hide">
      <div className="sticky top-0 bg-black pb-2 z-10">
        <div className="flex items-center gap-3 bg-panel rounded-full px-4 h-11">
          <Search className="w-5 h-5 text-muted" />
          <input
            placeholder="Pesquisar"
            className="bg-transparent outline-none w-full text-[15px]"
          />
        </div>
      </div>

      <section className="bg-panel rounded-2xl mt-4">
        <h2 className="text-xl font-bold px-4 pt-3">Quem seguir</h2>
        <ul>
          {suggested.length === 0 && (
            <li className="px-4 py-3 text-muted text-sm">Nenhuma sugestão por enquanto</li>
          )}
          {suggested.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
            >
              <Link href={`/${u.username}`} className="shrink-0">
                <Avatar name={u.name} src={u.avatarUrl} />
              </Link>
              <Link href={`/${u.username}`} className="flex-1 min-w-0">
                <div className="font-bold truncate hover:underline">{u.name}</div>
                <div className="text-muted text-sm truncate">@{u.username}</div>
              </Link>
              <FollowButton targetId={u.id} isFollowing={false} compact />
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted text-xs px-4 mt-4 leading-relaxed">
        © {new Date().getFullYear()} X · Projeto de disciplina
      </p>
    </aside>
  );
}
