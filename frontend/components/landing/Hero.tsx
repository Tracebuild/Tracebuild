import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="max-w-xl text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto mb-8 flex items-center justify-center">
          <span className="text-white font-bold text-xl">TB</span>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4">TraceBuild</h1>

        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          KI-gestützte Prüfung von Bauplänen gegen Normen und Vorschriften –
          automatisch, präzise und nachvollziehbar.
        </p>

        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Login
        </Link>
      </div>
    </section>
  );
}
