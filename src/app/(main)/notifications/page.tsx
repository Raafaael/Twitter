import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { FollowButton } from "@/components/follow-button";
import { timeAgo } from "@/lib/format";

export default async function NotificationsPage() {
  const me = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { id: true, name: true, username: true, avatarUrl: true } },
      space: { select: { id: true, title: true, status: true } },
    },
  });

  const followingIds = (
    await prisma.follow.findMany({
      where: { followerId: me.id },
      select: { followingId: true },
    })
  ).map((f) => f.followingId);

  await prisma.notification.updateMany({
    where: { userId: me.id, read: false },
    data: { read: true },
  });

  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur bg-bg/70 border-b border-border">
        <h1 className="text-xl font-bold px-4 py-4">Notificações</h1>
      </header>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted">
          Nada por aqui ainda. Quando alguém seguir você, vai aparecer nesta página.
        </div>
      ) : (
        <>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-3 px-4 py-3 border-b border-border ${
                !n.read ? "bg-accent/5" : ""
              }`}
            >
              <Link href={`/${n.actor.username}`} className="shrink-0">
                <Avatar name={n.actor.name} src={n.actor.avatarUrl} />
              </Link>
              <div className="flex-1 min-w-0">
                {n.type === "FOLLOW" ? (
                  <p className="text-[15px]">
                    <Link
                      href={`/${n.actor.username}`}
                      className="font-bold hover:underline"
                    >
                      {n.actor.name}
                    </Link>{" "}
                    <span className="text-muted">@{n.actor.username}</span> começou a seguir você
                  </p>
                ) : n.type === "SPACE" && n.space ? (
                  <Link
                    href={`/spaces/${n.space.id}`}
                    className="text-[15px] block hover:underline"
                  >
                    <span className="font-bold">{n.actor.name}</span>{" "}
                    <span className="text-muted">@{n.actor.username}</span> iniciou um Space:{" "}
                    <span className="font-bold">{n.space.title}</span>
                    {n.space.status === "ENDED" && (
                      <span className="text-muted"> (encerrado)</span>
                    )}
                  </Link>
                ) : null}
                <span className="text-muted text-sm block mt-1">
                  {timeAgo(n.createdAt)}
                </span>
              </div>
              {n.type === "FOLLOW" && (
                <FollowButton
                  targetId={n.actor.id}
                  isFollowing={followingIds.includes(n.actor.id)}
                  compact
                />
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}