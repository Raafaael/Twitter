import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { BackHeader } from "@/components/back-header";
import { PostCard } from "@/components/post-card";
import { postInclude, shapePost } from "@/lib/posts";

export default async function BookmarksPage() {
  const me = await requireUser();

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    include: { post: { include: postInclude(me.id) } },
  });

  return (
    <>
      <BackHeader title="Itens salvos" subtitle={`@${me.username}`} />
      {bookmarks.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold">Você ainda não salvou nada</h2>
          <p className="text-muted mt-2">
            Toque no ícone de bookmark em qualquer postagem para guardar aqui.
          </p>
        </div>
      ) : (
        bookmarks.map((b) => (
          <PostCard key={b.post.id} post={shapePost(b.post, me.id)} currentUserId={me.id} />
        ))
      )}
    </>
  );
}
