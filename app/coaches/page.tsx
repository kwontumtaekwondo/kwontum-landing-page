// app/coaches/page.tsx
"use client";

import coachesData from "../../data/coaches.json";
import CoachCard from "../../components/coaches/CoachCard";

const CoachesPage = () => {
    return (
        <div className="py-12 px-6 bg-gray-50 min-h-screen">
            <h1 className="text-6xl xs:7xl lg:text-4xl font-bold font-dolceVita mb-4 text-kwontum-darkRed ml-44">Our Coaches</h1>
            <div className="flex flex-wrap justify-center gap-8">
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