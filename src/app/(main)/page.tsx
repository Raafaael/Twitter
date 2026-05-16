import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { postInclude, shapePost } from "@/lib/posts";

export default async function HomePage() {
  const user = await requireUser();

  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
  });
  const authorIds = [user.id, ...following.map((f) => f.followingId)];

  const posts = await prisma.post.findMany({
    where: { authorId: { in: authorIds }, parentId: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: postInclude(user.id),
  });

  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur bg-bg/70 border-b border-border">
        <h1 className="text-xl font-bold px-4 py-4">Início</h1>
      </header>

      <Composer user={user} />

      {posts.length === 0 ? (
        <div className="p-8 text-center text-muted">
          Nada ainda. Faça sua primeira postagem ou siga alguém!
        </div>
      ) : (
        posts.map((p) => (
          <PostCard key={p.id} post={shapePost(p, user.id)} currentUserId={user.id} />
        ))
      )}
    </>
  );
}
