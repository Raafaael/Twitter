import { initials } from "@/lib/format";
import clsx from "clsx";

type Props = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ name, src, size = 40, className }: Props) {
  const dim = { width: size, height: size, fontSize: Math.max(12, size * 0.4) };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={dim}
        className={clsx("rounded-full object-cover bg-panel", className)}
      />
    );
  }
  return (
    <div
      style={dim}
      className={clsx(
        "rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center font-bold text-white shrink-0",
        className,
      )}
    >
      {initials(name) || "?"}
    </div>
  );
}
