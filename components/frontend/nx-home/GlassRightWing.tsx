import {
  Menu,
  Heart,
  ShoppingBag,
  Package,
  Headphones,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";

const items = [
  { label: "Wishlist", icon: Heart },
  { label: "Cart", icon: ShoppingBag },
  { label: "Orders", icon: Package },
  { label: "Support", icon: Headphones },
];

export default function GlassRightWing() {
  return (
    <aside className="nx-glass-wing nx-right-wing">
      <div className="nx-wing-header nx-wing-header-right">
        <strong>Glassmorphism</strong>
        <span className="nx-wing-badge">
          <Menu />
        </span>
      </div>

      <div className="nx-wing-search nx-wing-search-right">
        <SlidersHorizontal />
        <span>Quick view</span>
      </div>

      <div className="nx-wing-list">
        {items.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            type="button"
            className={`nx-wing-item nx-wing-item-card ${
              index === 0 ? "is-accent" : ""
            }`}
          >
            <span className="nx-wing-item-icon">
              <Icon />
            </span>
            <span className="nx-wing-item-label">{label}</span>
            <ChevronRight className={`nx-wing-chevron ${index < 2 ? "is-amber" : ""}`} />
          </button>
        ))}
      </div>

      <div className="nx-wing-footer nx-wing-footer-right">
        <span>Secure shopping</span>
      </div>
    </aside>
  );
}


