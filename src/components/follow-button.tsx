import { toggleFollowAction } from "@/actions/follows";
import clsx from "clsx";

type Props = {
  targetId: string;
  isFollowing: boolean;
  compact?: boolean;
};

export function FollowButton({ targetId, isFollowing, compact }: Props) {
  return (
    <form action={toggleFollowAction}>
      <input type="hidden" name="targetId" value={targetId} />
      <button
        type="submit"
        className={clsx(
          "rounded-full font-bold transition",
          compact ? "px-4 h-8 text-sm" : "px-5 h-9 text-[15px]",
          isFollowing
            ? "bg-transparent border border-border text-text hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 group"
            : "bg-text text-black hover:bg-text/90",
        )}
      >
        <span className={isFollowing ? "group-hover:hidden" : ""}>
          {isFollowing ? "Seguindo" : "Seguir"}
        </span>
        {isFollowing && <span className="hidden group-hover:inline">Deixar de seguir</span>}
      </button>
    </form>
  );
}
