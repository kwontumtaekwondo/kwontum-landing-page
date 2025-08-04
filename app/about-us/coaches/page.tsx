"use client";

import coachesData from "@/data/coaches.json";
import CoachCard from "@/components/coaches/CoachCard";

const CoachesPage = () => {
    return (
        <div className="py-12 px-6 bg-gray-50 min-h-screen">
            <h1 className="text-6xl xs:7xl lg:text-4xl font-bold font-dolceVita mb-4 text-kwontum-darkRed text-center">
                Our Coaches
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-8xl mx-auto items-stretch">
                {coachesData.map((coach, index) => (
                    <div key={index} className="h-full">
                        <CoachCard
                            picture={coach.picture}
                            fullName={coach.fullName}
                            name={coach.name}
                            title={coach.title}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoachesPage;