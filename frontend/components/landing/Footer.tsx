export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm font-semibold text-gray-700">TraceBuild</span>
        <span className="text-xs text-gray-400">
          © {new Date().getFullYear()} TraceBuild. Alle Rechte vorbehalten.
        </span>
      </div>
    </footer>
  );
}
