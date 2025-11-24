import {
  Wand2,
  Database,
  Rocket,
  Layout,
  Cloud,
  Lock,
} from 'lucide-react';

const features = [
  {
    icon: <Wand2 className="h-6 w-6" />,
    title: 'AI Schema Generation',
    desc: 'Describe your data needs in plain English, and let our AI build the perfect schema for you instantly.',
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: 'Smart Mock Data',
    desc: 'Generate thousands of rows of realistic, context-aware data powered by AI and Faker.js.',
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: 'Instant API Endpoints',
    desc: 'Get a fully functional REST API endpoint immediately. No server setup, no database configuration required.',
  },
  {
    icon: <Layout className="h-6 w-6" />,
    title: 'Visual Builder',
    desc: 'Intuitively design your API structure with our drag-and-drop schema builder. Perfect for rapid prototyping.',
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    title: 'Cloud Sync',
    desc: 'Your schemas and data are automatically saved to the cloud, accessible from anywhere, anytime.',
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: 'Access Control',
    desc: 'Manage visibility with ease. Toggle your APIs between public sharing and private development with a single click.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 bg-[#0a0613]">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="relative mx-auto max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Everything you need to ship faster
            </h3>
            <p className="mt-3 text-zinc-400 text-lg">
              Stop wasting time on backend boilerplate.  gives you powerful tools to prototype, build, and test your ideas in minutes.
            </p>
          </div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                'linear-gradient(152.92deg, rgba(99, 102, 241, 0.2) 4.54%, rgba(168, 85, 247, 0.26) 34.2%, rgba(99, 102, 241, 0.1) 77.55%)',
            }}
          ></div>
        </div>
        
        <div className="relative mt-12">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, idx) => (
              <li
                key={idx}
                className="transform-gpu space-y-3 rounded-2xl border border-zinc-800 bg-black/40 p-6 shadow-lg transition-all hover:border-indigo-500/30 hover:bg-zinc-900/50 hover:shadow-indigo-500/10"
              >
                <div className="text-indigo-400 w-fit transform-gpu rounded-full border border-zinc-800 bg-zinc-900/50 p-4 shadow-inner">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-zinc-100 tracking-tight">
                  {item.title}
                </h4>
                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
