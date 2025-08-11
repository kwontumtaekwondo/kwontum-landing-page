"use client";
declare global {
    interface Window {
        YT: {
            Player: new (
                elementId: string,
                options: {
                    videoId?: string,
                    playerVars?: Record<string, number | string>,
                    events?: {
                        onReady?: (event: { target: YTPlayer }) => void,
                        onStateChange?: (event: { data: number, target: YTPlayer }) => void
                    }
                }
            ) => YTPlayer
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

interface YTPlayer {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    mute(): void;
    unMute(): void;
    setVolume(volume: number): void;
    getCurrentTime(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    // Add other methods you need
}

import { Button } from "@/components/ui/button";
import { MessageCircle, Award, House, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from 'react';

export default function Home() {
    const playerRef = useRef<YTPlayer | null>(null);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);

        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('kwontum-video', {
                videoId: '64UqK4qLi1M',
                playerVars: {
                    autoplay: 1,
                    playlist: '64UqK4qLi1M',
                    mute: 1,
                    controls: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    loop: 0,
                    rel: 0,
                    playsinline: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    disablekb: 1,
                    width: '100%',
                    height: '100%',
                    // Mobile-specific optimizations
                    enablejsapi: 1,
                    origin: typeof window !== 'undefined' ? window.location.origin : ''
                },
                events: {
                    onReady: (event) => {
                        event.target.playVideo();
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            // Check every 500ms when playing
                            const checkTime = () => {
                                if (playerRef.current) {
                                    const currentTime = playerRef.current.getCurrentTime();
                                    if (currentTime >= 38) {
                                        playerRef.current.seekTo(0, true);
                                        playerRef.current.playVideo();
                                    } else {
                                        setTimeout(checkTime, 500);
                                    }
                                }
                            };
                            checkTime();
                        }
                    }
                },
            });
        };

        return () => {
            playerRef.current = null;
        };
    }, []);

    return (
        <>
            {/* Position the ThemeToggle at the top-right */}
            {/* <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
        </div> */}

            <section className="relative h-auto sm:h-[100vh] w-full overflow-hidden">
                {/* YouTube video placeholder - Mobile Optimized */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div
                        className="min-w-full min-h-full pointer-events-auto"
                        style={{
                            // Mobile-first approach with responsive scaling
                            transform: `
        scale(${typeof window !== 'undefined' && window.innerWidth < 768
                                    ? Math.max(
                                        window.innerHeight / (9 / 16 * window.innerWidth),
                                        1
                                    ) // Scale to fill height without cropping sides
                                    : 1.2 // Normal zoom on desktop
                                })
        translateY(${typeof window !== 'undefined' && window.innerWidth < 768
                                    ? '-5%'  // Slight vertical adjustment on mobile
                                    : '-5%'   // Same adjustment on desktop
                                })
      `,
                            transformOrigin: "center",
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            translate: "-50% -50%",
                            // Mobile-specific aspect ratio handling
                            aspectRatio: typeof window !== 'undefined' && window.innerWidth < 768
                                ? "auto"
                                : "16/9"
                        }}
                        id="kwontum-video"
                    ></div>
                </div>

                {/* Overlay for contrast */}
                <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

                {/* Volume Controls */}
                <div className="absolute bottom-2 right-2 z-30 bg-white text-black p-2 sm:p-3 rounded shadow flex items-center gap-2 sm:gap-4 transition-all text-sm sm:text-base">
                    {/* Mute/Unmute Button */}
                    <button
                        onClick={() => {
                            if (playerRef.current) {
                                if (isMuted) {
                                    playerRef.current.unMute();
                                } else {
                                    playerRef.current.mute();
                                }
                                setIsMuted(!isMuted);
                            }
                        }}
                        className="text-lg sm:text-xl"
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? "🔇" : "🔊"}
                    </button>

                    {/* Volume Slider */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={50}
                        onChange={(e) => {
                            const volume = parseInt(e.target.value, 10);
                            if (playerRef.current) {
                                playerRef.current.setVolume(volume);
                                if (volume === 0 && !isMuted) {
                                    playerRef.current.mute();
                                    setIsMuted(true);
                                } else if (volume > 0 && isMuted) {
                                    playerRef.current.unMute();
                                    setIsMuted(false);
                                }
                            }
                        }}
                        className="w-12 sm:w-28 accent-[#72161D]"
                    />
                </div>



                {/* Foreground content */}
                <div className="relative z-20 flex flex-col justify-center items-center h-full px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl xs:text-7xl lg:text-8xl font-bold font-dolceVita mt-8 mb-4 text-white">
                        WE ARE KWONTUM
                    </h1>
                    <a
                        href="https://wa.me/6584674113?text=Hello%21%20Thank%20You%20For%20Reaching%20Out!"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button
                            size="lg"
                            className="bg-[#C1272D] hover:bg-[#72161D] text-white text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 mt-4 sm:mt-8 mb-4"
                        >
                            Contact Us
                        </Button>

                    </a>
                </div>
            </section>


            <section className="py-12 sm:py-16 lg:py-20 bg-gray-100 dark:bg-gray-800">
                <h2 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-600 font-dolceVita">
                    &quot;DRIVEN BY FUNDAMENTALS,
                    <br></br>
                    DEFINED BY EXCELLENCE&quot;
                </h2>
            </section>

            <section
                id="about"
                className="py-16 sm:py-20 lg:py-30 bg-white dark:bg-gray-950"
            >
                <div className="px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center text-[#72161D] font-dolceVita">
                        We Are
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-10">
                        <div className="flex flex-col  gap-4 py-6 px-10 rounded-2xl border border-kwontum-darkRed border-opacity-50 font-dolceVita font-bold max-w-[400px] shadow-md hover:scale-105 transition-transform dark:bg-gray-900">
                            <Award size={50} className="" />
                            <p className="text-2xl font-bold">PASSION-DRIVEN</p>
                            <p className="text-gray-600 font-nanum">
                                Fueled by dedication to excellence in every
                                class we undertake
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 py-6 px-10 rounded-2xl border border-kwontum-darkRed border-opacity-50 font-dolceVita font-bold max-w-[400px] shadow-lg hover:scale-105 transition-transform dark:bg-gray-900">
                            <House size={50} className="" />
                            <p className="text-2xl font-bold">
                                FAMILY-ORIENTED
                            </p>
                            <p className="text-gray-600 font-nanum">
                                Creating a supportive and nurturing environment
                                for every student
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 py-6 px-10 rounded-2xl border border-kwontum-darkRed border-opacity-50 font-dolceVita font-bold max-w-[400px] shadow-lg hover:scale-105 transition-transform dark:bg-gray-900">
                            <Star size={50} className="" />
                            <p className="text-2xl font-bold">
                                EXCELLENCE-BOUND
                            </p>
                            <p className="text-gray-600 font-nanum">
                                Committed to achieving the highest standards in
                                martial arts training
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Classes Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-100 dark:bg-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center text-[#72161D] font-dolceVita">
                        Our Classes
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="bg-white dark:bg-gray-900 ">
                            <CardHeader>
                                <CardTitle className="text-[#72161D] text-2xl font-dolceVita">
                                    Toddlers & Kids
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 font-nanum">
                                    Learn the basics of Taekwondo, including
                                    stances, blocks, and kicks.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="text-[#72161D] text-2xl font-dolceVita">
                                    Teens & Adults
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 font-nanum">
                                    Advance your skills with more complex
                                    techniques and forms.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="text-[#72161D] text-2xl font-dolceVita">
                                    Competition Class
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 font-nanum">
                                    Master advanced techniques, sparring, and
                                    prepare for black belt.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section
                id="about"
                className="py-12 sm:py-16 lg:py-28 bg-white dark:bg-gray-900"
            >
                <div className="flex flex-col px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center text-gray-600 font-dolceVita">
                        READY TO KICKSTART YOUR JOURNEY?
                    </h2>
                    <a
                        href="https://wa.me/6584674113?text=Hello%21%20Thank%20You%20For%20Reaching%20Out!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center"
                    >
                        <Button className="bg-[#C1272D] hover:bg-[#72161D] text-white border border-[#C1272D] hover:border-[#72161D] text-base sm:text-lg px-6 py-5 mt-5">
                            BOOK FREE TRIAL
                        </Button>
                    </a>
                </div>
            </section>

            <section className="py-12 sm:py-16 lg:py-20 bg-gray-100 dark:bg-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center text-[#72161D] font-dolceVita">
                        TESTIMONIALS
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="bg-white hover:shadow-lg transition-shadow dark:bg-gray-900 border-2 border-[#72161D] rounded-xl">
                            <CardContent className="pt-6">
                                <blockquote className="text-gray-700 dark:text-white italic">
                                    &ldquo;Kwontum feels more like a family than
                                    just a school. Even though I&ldquo;ve only
                                    recently joined, I&ldquo;ve felt so welcomed
                                    and accepted, regardless of age differences
                                    or how short a time I&ldquo;ve been here. I
                                    was genuinely touched when the members came
                                    to support me during NSG. Ben Sir strikes
                                    the perfect balance between humor and
                                    strictness. He&ldquo;s incredibly detailed
                                    and takes the time to explain his training
                                    plans to each student. His personalized
                                    approach and dedication make training both
                                    fun and effective.&ldquo;
                                </blockquote>
                                <footer className="text-left mt-4">
                                    <p className="font-bold text-[#72161D]">
                                        Kallie Tan
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        14 years old
                                    </p>
                                </footer>
                            </CardContent>
                        </Card>

                        <Card className="bg-white hover:shadow-lg transition-shadow dark:bg-gray-900 border-2 border-[#72161D] rounded-xl">
                            <CardContent className="pt-6">
                                <blockquote className="text-gray-700 dark:text-white italic">
                                    &ldquo;I would like to give credit to
                                    Kwontum for its exceptional professional
                                    kyorugi training that is hard to find
                                    elsewhere. One of the standout features is
                                    their ability to match students with
                                    training partners of similar build for
                                    Kallie to ensure she can have effective
                                    practice sessions. Coach Ben&ldquo;s
                                    approach to individualized training
                                    prescriptions is another highlight. His
                                    tailored coaching methods for his student
                                    unique need and strengths set him apart from
                                    others that rely on one-size-fits-all
                                    training programs.&ldquo;
                                </blockquote>
                                <footer className="text-left mt-4">
                                    <p className="font-bold text-[#72161D]">
                                        Nicholas Tan
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Parent of Kallie Tan, 14 years old
                                    </p>
                                </footer>
                            </CardContent>
                        </Card>

                        <Card className="bg-white hover:shadow-lg transition-shadow dark:bg-gray-900 border-2 border-[#72161D] rounded-xl">
                            <CardContent className="pt-6">
                                <blockquote className="text-gray-700 dark:text-white italic">
                                    &ldquo;Coach Ben is great in many ways. He
                                    explains complicated concepts in ways I can
                                    understand and teaches them in a way I’m
                                    able to learn, apply, and practice in
                                    training sessions The people at Kwontum are
                                    also really nice and helpful. They&ldquo;re
                                    all experienced and skillful players.
                                    Everytime I spar or partner with them,
                                    I&ldquo;ll be able to learn with every
                                    engagement.&ldquo;
                                </blockquote>
                                <footer className="text-left mt-4">
                                    <p className="font-bold text-[#72161D]">
                                        Soren Yeow
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        14 years old
                                    </p>
                                </footer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* <TestimonialCarousel /> */}

            {/* Contact Section */}
            <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
                <div className="px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center text-[#72161D] font-dolceVita">
                        Contact Us
                    </h2>

                    <div className="gap-8">
                        <p className="text-center mb-4 text-gray-700">
                            VISIT US OR GET IN TOUCH VIA WHATSAPP TO LEARN MORE
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 p-8">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.640655882624!2d103.9164382!3d1.3921388000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da3d0033a4247d%3A0xc7e1d03f20860ba7!2sKwontum%20Taekwondo!5e0!3m2!1sen!2ssg!4v1739209001781!5m2!1sen!2ssg"
                                width="350"
                                height="250"
                                className="rounded-[12px] border-0"
                                loading="lazy"
                                allowFullScreen={true}
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Kwontum Taekwondo Location"
                                aria-label="Google Maps showing location of Kwontum Taekwondo"
                            />
                            <div className="flex flex-col  text-start text-gray-700">
                                <p className="mb-2">
                                    <strong>Address:</strong> 6 Tebing Lane
                                    #01-02A, Singapore 828835
                                </p>
                                {/* <p className="mb-2">
                                    <strong>Phone:</strong> (123) 456-7890
                                </p> */}
                                <p className="mb-4">
                                    <strong>Email:</strong> Hello@kwontum.com.sg
                                </p>
                                <a
                                    href="https://wa.me/6584674113?text=Hello%21%20Thank%20You%20For%20Reaching%20Out!"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex justify-center"
                                >
                                    <Button className="bg-[#C1272D] hover:bg-[#72161D] text-white border border-[#C1272D] hover:border-[#72161D] text-base sm:text-lg px-6 py-3 mt-5">
                                        Contact Us
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <a
                href="https://wa.me/6584674113?text=Hello%21%20Thank%20You%20For%20Reaching%20Out!"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
            >
                <MessageCircle className="h-6 w-6" />
                <span className="sr-only">Contact on WhatsApp</span>
            </a>
        </>
    );
}
