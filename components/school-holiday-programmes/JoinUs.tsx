// components/school-holiday-programmes/JoinUs.tsx
import { Button } from "@/components/ui/button";

const JoinUs = () => {
    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-left">
                {/* Title */}
                <h2 className="text-3xl font-bold text-black mb-8 font-dolceVita">
                    Why Join Us?
                </h2>

                {/* Body */}
                <div className="text-black font-nanum space-y-6 mb-12">
                    <p className="text-lg leading-relaxed">
                        More than just a week of activities, our holiday programmes allow
                        children to experience the positive impact of movement and creativity
                        through Taekwondo.
                    </p>
                    <p className="text-lg leading-relaxed">
                        Our coaches will build their focus and resilience that extends beyond
                        the workshops while engaging in fun-filled sessions that keep them
                        moving, learning, and enjoying! Aside from exclusive Team Kwontum
                        merchandise and event shirt, the children will take home lasting
                        memories from this enriching season.
                    </p>
                    <p className="text-lg leading-relaxed">
                        Kwontum Taekwondo isn&apos;t just about martial arts; it&apos;s about fostering
                        discipline, confidence, and community.
                    </p>
                </div>

                {/* Packages Title */}
                <h3 className="text-3xl font-bold text-black mb-8 font-dolceVita">
                    Packages Available!
                </h3>

                {/* Package Info */}
                <div className="text-black font-nanum space-y-6 mb-12">
                    <p className="text-lg leading-relaxed">
                        Enjoy early bird discounts with{" "}
                        <span className="font-extrabold">$130 per workshop (U.P. $150)</span> or{" "}
                        <span className="font-extrabold">$470 for all 4 (U.P. $550)</span>
                        when you <span className="font-extrabold">sign up by 31 Oct 2025</span>.
                        Don&apos;t miss this empowering holiday experience!
                    </p>
                    <p className="text-lg leading-relaxed font-extrabold">
                        Registration closes 17 Nov 2025.
                    </p>
                </div>

                {/* Register Now Button */}
                <div className="flex justify-start">
                    <Button
                        className="bg-[#C1272D] hover:bg-[#72161D] text-white border border-[#C1272D] hover:border-[#72161D] text-lg px-8 py-6 mt-4"
                        onClick={() => window.open('https://www.tinyurl.com/KWTKids2025', '_blank')}
                    >
                        REGISTER NOW
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JoinUs;