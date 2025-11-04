"use client";
import { easeInOut, motion } from "framer-motion";

const glowAnimation = {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.05, 1],
    transition: {
        duration: 3,
        repeat: Infinity,
        ease: easeInOut,
    },
};

const HeroBg = ({ children }: { children: React.ReactNode }) => {
    return (
        <section className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-black py-16 text-white sm:px-6 lg:px-8 lg:py-2">
            <div className="absolute inset-0 z-0 h-full w-full items-center px-5 py-24 opacity-80 [background:radial-gradient(125%_125%_at_50%_100%,#000_40%,#63e_100%)]"></div>
            <svg
                id="noice"
                className="absolute inset-0 z-10 h-full w-full opacity-30"
            >
                <filter id="noise-filter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="1.34"
                        numOctaves="4"
                        stitchTiles="stitch"
                    ></feTurbulence>
                    <feColorMatrix type="saturate" values="0"></feColorMatrix>
                    <feComponentTransfer>
                        <feFuncR type="linear" slope="0.46"></feFuncR>
                        <feFuncG type="linear" slope="0.46"></feFuncG>
                        <feFuncB type="linear" slope="0.47"></feFuncB>
                        <feFuncA type="linear" slope="0.37"></feFuncA>
                    </feComponentTransfer>
                    <feComponentTransfer>
                        <feFuncR type="linear" slope="1.47" intercept="-0.23" />
                        <feFuncG type="linear" slope="1.47" intercept="-0.23" />
                        <feFuncB type="linear" slope="1.47" intercept="-0.23" />
                    </feComponentTransfer>
                </filter>
                <rect
                    width="100%"
                    height="100%"
                    filter="url(#noise-filter)"
                ></rect>
            </svg>
            {/* Background effects */}
            <div className="absolute inset-0 z-0">
                {/* Radial gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-black/70 to-gray-950 blur-3xl"></div>

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                </div>

                {/* Enhanced glow spots */}
                <div className="absolute top-20 -left-20 h-60 w-60 rounded-full bg-purple-600/20 blur-[100px]"></div>
                <div className="absolute -right-20 bottom-20 h-60 w-60 rounded-full bg-blue-600/20 blur-[100px]"></div>
                <motion.div
                    animate={glowAnimation}
                    className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-indigo-500/10 blur-[80px]"
                ></motion.div>
                <motion.div
                    animate={glowAnimation}
                    className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full bg-purple-500/10 blur-[80px]"
                ></motion.div>

                {/* Particle effects - subtle dots */}
                <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute h-1 w-1 rounded-full bg-white"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>
            </div>
            {children}
        </section>
    );
};

export default HeroBg;
