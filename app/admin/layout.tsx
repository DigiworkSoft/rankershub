export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        footer {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
