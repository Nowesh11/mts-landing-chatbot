import { ShieldCheck } from "lucide-react";

export function CredentialBadges({ labels }: { labels: string[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-lime/30 px-3 py-1 text-xs font-medium text-lime"
        >
          <ShieldCheck size={14} strokeWidth={2} />
          {label}
        </span>
      ))}
    </div>
  );
}
