export default function WingHinges() {
  return (
    <div className="nx-wing-hinges" aria-hidden="true">
      {/* Connecting hinges between left wing and main frame */}
      <span className="nx-hinge nx-hinge-left nx-hinge-top" />
      <span className="nx-hinge nx-hinge-left nx-hinge-bottom" />

      {/* Connecting hinges between main frame and right wing */}
      <span className="nx-hinge nx-hinge-right nx-hinge-top" />
      <span className="nx-hinge nx-hinge-right nx-hinge-bottom" />

      {/* Outer floating glass clips on outer edges (matching image.png) */}
      <span className="nx-glass-clip nx-glass-clip-left" />
      <span className="nx-glass-clip nx-glass-clip-right-top" />
      <span className="nx-glass-clip nx-glass-clip-right-bottom" />
    </div>
  );
}
