import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/format";

export default async function MessagesPage() {
  const me = await requireUser();

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: me.id }, { receiverId: me.id }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, username: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });

  const seen = new Set<string>();
  const conversations = [];
  for (const m of messages) {
    const other = m.senderId === me.id ? m.receiver : m.sender;
    if (seen.has(other.id)) continue;
    seen.add(other.id);
    conversations.push({ other, last: m });
  }

  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur bg-bg/70 border-b border-border">
        <h1 className="text-xl font-bold px-4 py-4">Mensagens</h1>
      </header>

      {conversations.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold">Bem-vindo às suas mensagens</h2>
          <p className="text-muted mt-2">
            Visite o perfil de alguém e clique em "Mensagem" para iniciar uma conversa.
          </p>
        </div>
      ) : (
        conversations.map(({ other, last }) => (
          <Link
            key={other.id}
            href={`/messages/${other.id}`}
            className="flex gap-3 px-4 py-3 border-b border-border hover:bg-white/[0.03] transition"
          >
            <Avatar name={other.name} src={other.avatarUrl} size={48} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="font-bold truncate">{other.name}</span>
                <span className="text-muted text-[15px] truncate">@{other.username}</span>
                <span className="text-muted text-[15px]">·</span>
                <span className="text-muted text-[15px]">{timeAgo(last.createdAt)}</span>
              </div>
              <p className="text-muted text-[15px] truncate">
                {last.senderId === me.id ? "Você: " : ""}
                {last.content}
              </p>
            </div>
          </Link>
        ))
      )}
    </>
  );
}
