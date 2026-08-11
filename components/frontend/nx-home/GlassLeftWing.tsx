import {
  Search,
  Compass,
  Grid2X2,
  BadgePercent,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const items = [
  { label: "Explore", icon: Compass },
  { label: "Categories", icon: Grid2X2 },
  { label: "Offers", icon: BadgePercent },
  { label: "Discover", icon: Sparkles },
];

export default function GlassLeftWing() {
  return (
    <aside className="nx-glass-wing nx-left-wing">
      <div className="nx-wing-header">
        <span className="nx-wing-badge">NX</span>
        <strong>Glassmorphism</strong>
      </div>

      <div className="nx-wing-search">
        <Search />
        <span>Search</span>
      </div>

      <div className="nx-wing-list">
        {items.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            type="button"
            className={`nx-wing-item ${
              index === 1 ? "is-selected" : ""
            }`}
          >
            <span className="nx-wing-item-icon">
              {index === 1 ? <span className="nx-wing-dot" /> : <Icon />}
            </span>
            <span className="nx-wing-item-label">{label}</span>
            <ChevronRight className="nx-wing-chevron" />
          </button>
        ))}
      </div>

      <div className="nx-wing-footer">
        <span>Marketplace</span>
      </div>
    </aside>
  );
}


