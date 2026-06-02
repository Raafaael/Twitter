import Link from "next/link";
import { Home, Mail, Bookmark, Radio, User as UserIcon, LogOut, Feather } from "lucide-react";
import { Avatar } from "./avatar";
import { logoutAction } from "@/actions/auth";

type SessionUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
};

const NAV: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/spaces", label: "Spaces", icon: Radio },
  { href: "/messages", label: "Mensagens", icon: Mail },
  { href: "/bookmarks", label: "Itens salvos", icon: Bookmark },
];

export function Sidebar({ user }: { user: SessionUser }) {
  return (
    <aside className="hidden sm:flex sticky top-0 h-screen w-[88px] xl:w-[275px] flex-col items-stretch px-2 xl:px-4 py-2 shrink-0">
      <Link
        href="/"
        className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition self-start mb-1"
        aria-label="Início"
      >
        <Feather className="w-7 h-7" />
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-5 px-3 py-3 rounded-full hover:bg-white/10 transition self-start"
          >
            <item.icon className="w-7 h-7" />
            <span className="hidden xl:inline text-xl">{item.label}</span>
          </Link>
        ))}
        <Link
          href={`/${user.username}`}
          className="flex items-center gap-5 px-3 py-3 rounded-full hover:bg-white/10 transition self-start"
        >
          <UserIcon className="w-7 h-7" />
          <span className="hidden xl:inline text-xl">Perfil</span>
        </Link>
      </nav>

      <Link
        href="/compose"
        className="mt-4 bg-accent hover:bg-accentHover text-white font-bold rounded-full h-12 xl:h-13 flex items-center justify-center xl:px-6 transition"
      >
        <Feather className="w-6 h-6 xl:hidden" />
        <span className="hidden xl:inline text-lg">Postar</span>
      </Link>

      <div className="mt-auto">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 p-3 rounded-full hover:bg-white/10 transition"
          >
            <Avatar name={user.name} src={user.avatarUrl} size={40} />
            <div className="hidden xl:flex flex-col items-start min-w-0 flex-1">
              <span className="font-bold text-[15px] truncate w-full text-left">{user.name}</span>
              <span className="text-muted text-[15px] truncate w-full text-left">
                @{user.username}
              </span>
            </div>
            <LogOut className="hidden xl:block w-5 h-5 text-muted shrink-0" />
          </button>
        </form>
      </div>
    </aside>
  );
}
