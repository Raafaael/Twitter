import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { BackHeader } from "@/components/back-header";
import { PostActions } from "@/components/post-actions";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { postInclude, shapePost } from "@/lib/posts";
import { fmtDate } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Params) {
  const { id } = await params;
  const me = await requireUser();

  const post = await prisma.post.findUnique({
    where: { id },
    include: postInclude(me.id),
  });
  if (!post) notFound();

  const replies = await prisma.post.findMany({
    where: { parentId: id },
    orderBy: { createdAt: "asc" },
    include: postInclude(me.id),
  });

  const liked = post.likes.some((l) => l.userId === me.id);
  const bookmarked = post.bookmarks.some((b) => b.userId === me.id);

  return (
    <>
      <BackHeader title="Postagem" />

      <article className="px-4 pt-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href={`/${post.author.username}`}>
            <Avatar name={post.author.name} src={post.author.avatarUrl} size={48} />
          </Link>
          <div className="min-w-0">
            <Link href={`/${post.author.username}`} className="font-bold hover:underline block truncate">
              {post.author.name}
            </Link>
            <span className="text-muted text-[15px]">@{post.author.username}</span>
          </div>
        </div>

        <p className="mt-3 text-[23px] leading-snug whitespace-pre-wrap break-words">
          {post.content}
        </p>

        <p className="text-muted text-[15px] mt-3">
          {fmtDate(post.createdAt)}
          {post.edited && " · editado"}
        </p>

        {(post._count.likes > 0 || post._count.replies > 0) && (
          <div className="flex gap-5 py-3 mt-3 border-t border-b border-border text-[15px]">
            {post._count.replies > 0 && (
              <span>
                <span className="font-bold">{post._count.replies}</span>{" "}
                <span className="text-muted">Respostas</span>
              </span>
            )}
            {post._count.likes > 0 && (
              <span>
                <span className="font-bold">{post._count.likes}</span>{" "}
                <span className="text-muted">Curtidas</span>
              </span>
            )}
          </div>
        )}

        <PostActions
          postId={post.id}
          liked={liked}
          bookmarked={bookmarked}
          likes={post._count.likes}
          replies={post._count.replies}
        />
      </article>

      <Composer user={me} parentId={post.id} placeholder="Poste sua resposta" />

      {replies.map((r) => (
        <PostCard key={r.id} post={shapePost(r, me.id)} currentUserId={me.id} />
      ))}
    </>
  );
}
