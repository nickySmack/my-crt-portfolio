// Purely decorative screen effects layered over the whole page: scanlines, a
// slow rolling refresh bar, and a vignette for the curved-glass look.
export default function CRTOverlay() {
  return (
    <div className="crt-overlay" aria-hidden="true">
      <div className="crt-scanlines" />
      <div className="crt-rollbar" />
      <div className="crt-vignette" />
    </div>
  );
}
