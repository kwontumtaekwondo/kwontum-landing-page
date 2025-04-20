"use client"
// app/coaches/[name]/page.tsx
import { useParams } from "next/navigation";
import coachesData from "@/data/coaches.json";
import CoachBanner from "@/components/coaches/CoachBanner";
import CoachProfile from "@/components/coaches/CoachProfile";
import CertificationsExperience from "@/components/coaches/CertificationsExperience";
import KeyAchievements from "@/components/coaches/KeyAchievements";
import AthleteProfile from "@/components/coaches/AthleteProfile";
import Link from "next/link";

const CoachPage = () => {
    const { name: nameQuery } = useParams();
    const name = Array.isArray(nameQuery) ? nameQuery[0] : nameQuery;

    const coach = name
        ? coachesData.find((coach) => coach.name.toLowerCase() === name.toLowerCase())
        : null;

    if (!coach) {
        return <div>Coach not found</div>;
    }

    return (
        <div>
            {/* Coach Banner */}
            <CoachBanner
                banner={coach.banner}
                fullName={coach.fullName}
                title={coach.title}
            />
            <div className="py-12 px-6 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto w-full">
                    {/* Coach Profile */}
                    <CoachProfile picture={coach.picture} quote={coach.quote} />

                    {/* Certifications & Experience and Key Achievements (Two Columns) */}
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Certifications & Experience */}
                        <CertificationsExperience certificates={coach.certificates} />

                        {/* Key Achievements */}
                        <KeyAchievements achievements={coach.achievements} />
                    </div>

                    {/* Athlete Profile */}
                    <AthleteProfile
                        profile={coach.profile}
                        trainingBackground={coach.trainingBackground}
                        style={coach.style}
                        type={coach.type}
                    />
                    {/* View All Coaches Button */}
                    <div className="mt-8">
                    <Link href="/about-us/coaches" className="inline-block">
                        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 font-nanum text-[#002b56] font-bold">
                            View All Coaches
                        </button>
                    </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachPage;