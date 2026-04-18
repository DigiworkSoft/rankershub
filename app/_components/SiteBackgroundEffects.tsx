export default function SiteBackgroundEffects() {
  const symbols = [
    { text: "x^2", top: "12%", left: "8%", delay: "0s", duration: "15s" },
    { text: "A+", top: "20%", left: "78%", delay: "1.5s", duration: "18s" },
    { text: "abc", top: "32%", left: "16%", delay: "0.8s", duration: "16s" },
    { text: "E=mc2", top: "40%", left: "70%", delay: "2.2s", duration: "20s" },
    { text: "Q1", top: "55%", left: "10%", delay: "1.2s", duration: "17s" },
    { text: "notes", top: "66%", left: "82%", delay: "2.8s", duration: "19s" },
    { text: "1/2", top: "78%", left: "24%", delay: "0.4s", duration: "14s" },
    { text: "sum", top: "84%", left: "68%", delay: "1.9s", duration: "16s" },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="edu-paper-bg absolute inset-0" />
      <div className="edu-notebook-lines absolute inset-0" />
      <div className="edu-margin-line absolute inset-y-0 left-[12%] hidden md:block" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(79,70,229,0.10),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.08),transparent_45%),radial-gradient(circle_at_50%_85%,rgba(250,204,21,0.08),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.05)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />

      {symbols.map((symbol) => (
        <span
          key={`${symbol.text}-${symbol.top}-${symbol.left}`}
          className="edu-symbol hidden md:block"
          style={{
            top: symbol.top,
            left: symbol.left,
            animationDelay: symbol.delay,
            animationDuration: symbol.duration,
          }}
        >
          {symbol.text}
        </span>
      ))}

      <div className="bg-orb bg-orb-one" />
      <div className="bg-orb bg-orb-two" />
      <div className="bg-orb bg-orb-three" />
    </div>
  );
}
