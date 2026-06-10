import clsx from "clsx";

export function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Passo ${current} de ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            "h-1.5 rounded-full transition-all",
            i + 1 === current ? "bg-accent w-8" : i + 1 < current ? "bg-accent w-4" : "bg-border w-4",
          )}
        />
      ))}
    </div>
  );
}
