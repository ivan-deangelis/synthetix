const HowItWorks = () => {
    return (
              <div id="how-it-works" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Go from idea to production API in three simple steps. No coding required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0" />

            {/* Step 1 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-black/40 rounded-2xl border border-zinc-800 flex items-center justify-center mb-8 relative z-10 group-hover:border-indigo-500/50 transition-colors shadow-lg shadow-black/50">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl font-bold text-zinc-700 group-hover:text-indigo-500 transition-colors">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Describe</h3>
              <p className="text-zinc-400 text-center leading-relaxed">
                Simply describe the data you need in plain English. "A list of 50 tech startup employees with salaries and roles."
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-black/40 rounded-2xl border border-zinc-800 flex items-center justify-center mb-8 relative z-10 group-hover:border-purple-500/50 transition-colors shadow-lg shadow-black/50">
                <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl font-bold text-zinc-700 group-hover:text-purple-500 transition-colors">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Generate</h3>
              <p className="text-zinc-400 text-center leading-relaxed">
                Our AI analyzes your request, builds a schema, and generates realistic, context-aware mock data instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-black/40 rounded-2xl border border-zinc-800 flex items-center justify-center mb-8 relative z-10 group-hover:border-emerald-500/50 transition-colors shadow-lg shadow-black/50">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl font-bold text-zinc-700 group-hover:text-emerald-500 transition-colors">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Integrate</h3>
              <p className="text-zinc-400 text-center leading-relaxed">
                Get a production-ready REST API endpoint. Use it in your frontend, mobile app, or testing environment immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
}

export default HowItWorks;