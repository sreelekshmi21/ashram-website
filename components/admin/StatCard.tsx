import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  accentColor?: "gold" | "saffron" | "forest" | "emerald" | "rose" | "blue" | "purple";
  subtitle?: string;
}

const accentMap: Record<string, { bg: string; iconBg: string; border: string }> = {
  gold: {
    bg: "rgba(201, 168, 76, 0.06)",
    iconBg: "rgba(201, 168, 76, 0.12)",
    border: "rgba(201, 168, 76, 0.12)",
  },
  saffron: {
    bg: "rgba(232, 117, 26, 0.06)",
    iconBg: "rgba(232, 117, 26, 0.12)",
    border: "rgba(232, 117, 26, 0.12)",
  },
  forest: {
    bg: "rgba(61, 122, 83, 0.08)",
    iconBg: "rgba(61, 122, 83, 0.15)",
    border: "rgba(61, 122, 83, 0.12)",
  },
  emerald: {
    bg: "rgba(52, 211, 153, 0.06)",
    iconBg: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.1)",
  },
  rose: {
    bg: "rgba(244, 63, 94, 0.05)",
    iconBg: "rgba(244, 63, 94, 0.12)",
    border: "rgba(244, 63, 94, 0.1)",
  },
  blue: {
    bg: "rgba(59, 130, 246, 0.06)",
    iconBg: "rgba(59, 130, 246, 0.12)",
    border: "rgba(59, 130, 246, 0.1)",
  },
  purple: {
    bg: "rgba(139, 92, 246, 0.06)",
    iconBg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.1)",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  href,
  accentColor = "gold",
  subtitle,
}: StatCardProps) {
  const accent = accentMap[accentColor];

  const card = (
    <div
      className={`admin-stat-card ${href ? "admin-stat-card--clickable" : ""}`}
      style={{
        background: accent.bg,
        borderColor: accent.border,
      }}
    >
      <div
        className="admin-stat-card__icon"
        style={{ background: accent.iconBg }}
      >
        {icon}
      </div>
      <div className="admin-stat-card__content">
        <p className="admin-stat-card__title">{title}</p>
        <p className="admin-stat-card__value">{value}</p>
        {subtitle && (
          <p className="admin-stat-card__subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="admin-stat-card__link">
        {card}
      </Link>
    );
  }

  return card;
}
