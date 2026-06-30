export default function Features() {
  return (
    <section className="bg-gray-50 py-24 px-6 border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Features</h2>
        <p className="text-sm text-gray-400 text-center mb-12">Weitere Informationen folgen.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {["Feature 1", "Feature 2", "Feature 3"].map((label) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-200 p-8 h-36"
            >
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
