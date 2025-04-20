// app/coaches/page.tsx
"use client";

import coachesData from "@/data/coaches.json";
import CoachCard from "@/components/coaches/CoachCard";

const CoachesPage = () => {
    return (
        <div className="py-12 px-6 bg-gray-50 min-h-screen">
            <h1 className="text-6xl xs:7xl lg:text-4xl font-bold font-dolceVita mb-4 text-kwontum-darkRed text-center">Our Coaches</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-8xl mx-auto">
                {/* Render a CoachCard for each coach */}
                {coachesData.map((coach, index) => (
                    <CoachCard
                        key={index}
                        picture={coach.picture}
                        fullName={coach.fullName}
                        name={coach.name}
                        title={coach.title}
                    />
                ))}
            </div>
        </div>
    );
};

export default CoachesPage;