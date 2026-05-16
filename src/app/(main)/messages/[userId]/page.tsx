import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { BackHeader } from "@/components/back-header";
import { MessageComposer } from "@/components/message-composer";
import { fmtDate } from "@/lib/format";

type Params = { params: Promise<{ userId: string }> };

export default async function ConversationPage({ params }: Params) {
  const { userId } = await params;
  const me = await requireUser();

  if (userId === me.id) notFound();

  const other = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, avatarUrl: true, bio: true },
  });
  if (!other) notFound();

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me.id, receiverId: other.id },
        { senderId: other.id, receiverId: me.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <div className="flex flex-col h-screen">
      <BackHeader title={other.name} subtitle={`@${other.username}`} />

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1">
        <Link
          href={`/${other.username}`}
          className="flex flex-col items-center gap-2 py-6 border-b border-border mb-3 hover:bg-white/[0.02] -mx-4 px-4"
        >
          <Avatar name={other.name} src={other.avatarUrl} size={64} />
          <div className="font-bold">{other.name}</div>
          <div className="text-muted text-sm">@{other.username}</div>
          {other.bio && (
            <p className="text-muted text-sm text-center max-w-xs">{other.bio}</p>
          )}
        </Link>

        {messages.length === 0 ? (
          <p className="text-center text-muted py-6">Nenhuma mensagem ainda. Diga oi!</p>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === me.id;
            const prev = messages[i - 1];
            const showTime =
              !prev || m.createdAt.getTime() - prev.createdAt.getTime() > 5 * 60 * 1000;
            return (
              <div key={m.id}>
                {showTime && (
                  <p className="text-center text-muted text-xs my-3">
                    {fmtDate(m.createdAt)}
                  </p>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-[15px] break-words ${
                      mine
                        ? "bg-accent text-white rounded-br-sm"
                        : "bg-panel text-text rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageComposer receiverId={other.id} />
    </div>
  );
}
