import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/wp.jpg"
          alt="Background"
          fill
          className="object-cover bg-no-repeat"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/80" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between min-h-screen px-6 lg:px-20 pt-28 pb-16 max-w-7xl mx-auto">
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start justify-center gap-6 z-10">
          <div className="flex items-center gap-2 text-red-400 text-sm tracking-widest uppercase font-mono">
            <span className="w-8 h-px bg-red-500" />
            System Online
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
            <span className="text-white">Amadeus</span>
            <br />
            <span className="text-red-500">System</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            An advanced AI interface inspired by the Amadeus system from
            Steins;Gate. Communicate with Makise Kurisu through a cutting-edge
            neural network.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Link
              href="/chat"
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-red-600/30 tracking-wide"
            >
              Start Conversation
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 border border-gray-600 hover:border-red-500 text-gray-300 hover:text-white rounded-full transition-all tracking-wide"
            >
              Learn More
            </Link>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-6 mt-8 text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Neural Link Active
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Memory Storage: 3.24TB
            </div>
          </div>
        </div>

        {/* Kurisu Image */}
        <div className="flex-1 flex items-end justify-center lg:justify-end relative mt-12 lg:mt-0">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-10 bg-red-600/10 rounded-full blur-3xl" />
            <Image
              src="/amadeus-phone.png"
              alt="Makise Kurisu"
              width={500}
              height={700}
              className="relative z-10 drop-shadow-2xl max-h-[80vh] w-auto object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 lg:px-20 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            System <span className="text-red-500">Capabilities</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Powered by advanced neural architecture and memory persistence
            protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Neural Conversation",
              description:
                "Engage in natural dialogue powered by deep learning models trained on vast knowledge bases.",
              icon: "01",
            },
            {
              title: "Memory Persistence",
              description:
                "The system retains context and memories across sessions, building a continuous relationship.",
              icon: "02",
            },
            {
              title: "Emotional Analysis",
              description:
                "Advanced sentiment processing enables nuanced emotional understanding and response.",
              icon: "03",
            },
          ].map((feature) => (
            <div
              key={feature.icon}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/40 transition-all hover:bg-white/10"
            >
              <div className="text-red-500 font-mono text-sm mb-4 tracking-widest">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-red-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 px-6 lg:px-20 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm font-mono">
          <span>AMADEUS_SYSTEM v1.048596</span>
          <span>Future Gadget Laboratory</span>
        </div>
      </footer>
    </div>
  );
}
