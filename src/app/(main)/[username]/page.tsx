import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { BackHeader } from "@/components/back-header";
import { FollowButton } from "@/components/follow-button";
import { PostCard } from "@/components/post-card";
import { postInclude, shapePost } from "@/lib/posts";
import { fmtDate } from "@/lib/format";
import Link from "next/link";

type Params = { params: Promise<{ username: string }> };

export default async function ProfilePage({ params }: Params) {
  const { username } = await params;
  const me = await requireUser();

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });
  if (!user) notFound();

  const [isFollowing, posts] = await Promise.all([
    user.id === me.id
      ? Promise.resolve(false)
      : prisma.follow
          .findUnique({
            where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
          })
          .then((f) => !!f),
    prisma.post.findMany({
      where: { authorId: user.id, parentId: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: postInclude(me.id),
    }),
  ]);

  return (
    <>
      <BackHeader title={user.name} subtitle={`${user._count.posts} postagens`} />

      <div className="h-48 bg-gradient-to-br from-accent/30 via-purple-700/30 to-pink-500/30" />

      <div className="px-4 -mt-16 relative">
        <div className="flex items-end justify-between">
          <div className="rounded-full border-4 border-bg">
            <Avatar name={user.name} src={user.avatarUrl} size={128} />
          </div>
          {user.id === me.id ? (
            <button
              type="button"
              className="px-4 h-9 rounded-full border border-border font-bold text-[15px] hover:bg-white/5"
            >
              Editar perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                href={`/messages/${user.id}`}
                className="px-4 h-9 rounded-full border border-border font-bold text-[15px] hover:bg-white/5 inline-flex items-center"
              >
                Mensagem
              </Link>
              <FollowButton targetId={user.id} isFollowing={isFollowing} />
            </div>
          )}
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-muted text-[15px]">@{user.username}</p>
          {user.bio && <p className="mt-3 text-[15px] whitespace-pre-wrap">{user.bio}</p>}
          <div className="flex items-center gap-2 text-muted text-[15px] mt-3">
            <CalendarDays className="w-4 h-4" />
            <span>Ingressou em {fmtDate(user.createdAt).split(",")[0]}</span>
          </div>
          <div className="flex gap-5 mt-3 text-[15px]">
            <span>
              <span className="font-bold">{user._count.following}</span>{" "}
              <span className="text-muted">Seguindo</span>
            </span>
            <span>
              <span className="font-bold">{user._count.followers}</span>{" "}
              <span className="text-muted">Seguidores</span>
            </span>
          </div>
        </div>
      </div>

      <nav className="border-b border-border mt-4 flex">
        <button className="flex-1 py-4 font-bold text-[15px] border-b-4 border-accent">
          Postagens
        </button>
      </nav>

      {posts.length === 0 ? (
        <div className="p-8 text-center text-muted">Sem postagens ainda</div>
      ) : (
        posts.map((p) => (
          <PostCard key={p.id} post={shapePost(p, me.id)} currentUserId={me.id} />
        ))
      )}
    </>
  );
}
