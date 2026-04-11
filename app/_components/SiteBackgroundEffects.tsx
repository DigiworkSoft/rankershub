export default function SiteBackgroundEffects() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(79,70,229,0.10),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.08),transparent_45%),radial-gradient(circle_at_50%_85%,rgba(250,204,21,0.08),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.05)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div className="bg-orb bg-orb-one" />
      <div className="bg-orb bg-orb-two" />
      <div className="bg-orb bg-orb-three" />
    </div>
  );
}
