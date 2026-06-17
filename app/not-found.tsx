import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary px-8 py-3 rounded-xl inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
}
