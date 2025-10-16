// components/school-holiday-programmes/Banner.tsx
import { Button } from "@/components/ui/button";

const BannerSection = () => {
    return (
        <div className="w-full">
            {/* Banner Image */}
            <div className="relative w-full">
                <img
                    src="/img/school-holiday/banner.png"
                    alt="School Holiday Programmes Banner"
                    className="w-full h-auto"
                />
            </div>

            {/* Text Content Below Banner */}
            <div className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="text-center space-y-6">
                        <p className="text-lg text-gray-700 font-nanum leading-relaxed">
                            Give your child a school holiday they'll never forget! Our workshops combine physical activity, creative movement, self-defence, teamwork, and life skills, helping kids grow in a safe and supportive environment.
                        </p>
                        <p className="text-lg text-gray-700 font-nanum font-bold leading-relaxed">
                            No prior experience in Taekwondo needed.
                        </p>
                        <p className="text-lg text-gray-700 font-nanum leading-relaxed">
                            From martial arts and dance to outdoor adventures and mental resilience activities, every workshop ensures learning, fun, and personal growth. Open to all across Singapore!
                        </p>
                        <Button
                            className="bg-[#C1272D] hover:bg-[#72161D] text-white border border-[#C1272D] hover:border-[#72161D] text-lg px-8 py-6 mt-4"
                            onClick={() => window.open('https://www.tinyurl.com/KWTKids2025', '_blank')}
                        >
                            REGISTER NOW
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerSection;