// app/school-holiday-programmes/page.tsx
"use client";

import BannerSection from "@/components/school-holiday-programmes/Banner";
import ProgrammeCard from "@/components/school-holiday-programmes/ProgrammeCard";
import InfoSection from "@/components/school-holiday-programmes/InfoSection";
import JoinUs from "@/components/school-holiday-programmes/JoinUs";

const SchoolHolidayPage = () => {
    const programmes = [
        {
            title: "POWER UP AGAINST BULLYING",
            imageSrc: "/img/school-holiday/1.png",
            date: "25 Nov 25, Tue",
            time: "9am - 5pm",
            description:
                "Is your child telling you what really happens in school? Have you noticed changes in their mood or behaviour that you can't quite explain? With bullying cases on the rise in Singapore, it's never been more important to equip children with the emotional tools to protect their well-being.",
            fullDescription:
                "Jointly curated with education professionals, this workshop helps kids recognise, understand, and manage different forms of bullying while strengthening their emotional regulation and empathy. Through guided discussions, interactive activities, and a symbolic plank-breaking session, children will discover their inner courage, self-belief, and resilience to face challenges head-on.",
            points: [
                "Learn how to recognise and deal with different types of bullying",
                "Strengthen emotional regulation and healthy coping strategies",
                "Build empathy, resilience and social awareness through interactive activities",
            ],
        },
        {
            title: "K-POP TAEKWONDO DANCE WORKSHOP",
            imageSrc: "/img/school-holiday/2.png",
            date: "26 Nov 25, Wed",
            time: "9am - 5pm",
            description:
                "Get ready to move and groove like your favourite K-pop stars! Inspired by the hit songs of K-pop Demon Hunter, this workshop blends catchy choreography with dynamic Taekwondo moves and basic acrobatics like forward rolls and cartwheels to enhance fitness and coordination.",
            fullDescription:
                "Kids will learn a fun dance cover to popular K-pop tracks while building confidence, rhythm, and strength in a high-energy, supportive environment.",
            points: [
                "Learn K-pop-inspired dance and beginner Taekwondo moves",
                "Improve body mobility through basic acrobatics",
                "Boost coordination, rhythm, and confidence",
            ],
        },
        {
            title: "VIRTUAL WARRIOR ZONE",
            imageSrc: "/img/school-holiday/3.png",
            date: "27 Nov 25, Thur",
            time: "9am - 5pm",
            description:
                "Are your kids spending too much time on devices and not moving enough? It's time to unleash their inner warrior through <span class='font-extrabold'>Virtual Taekwondo</span>!",
            fullDescription:
                "In this immersive experience, children will learn introductory Taekwondo moves and practical self-defence skills while stepping into a Virtual Reality Taekwondo world, where strategy, discipline, and courage come alive. This workshop trains young warriors to move with agility, build resilience, and master focus while having fun and staying active.",
            points: [
                "Explore the Virtual Taekwondo World led by former National Coach",
                "Learn beginner Taekwondo moves and essential self-defence techniques",
                "Develop warrior discipline, resilience, and courage",
            ],
        },
        {
            title: "ULTIMATE ADVENTURE QUEST",
            imageSrc: "/img/school-holiday/4.png",
            date: "28 Nov 25, Fri",
            time: "9am - 5pm",
            description:
                "Reward your kids for a year of hard work with a day of fresh air, fun, and adventure! The Ultimate Adventure Quest takes children outdoors for team-bonding challenges, exciting games, and Taekwondo-inspired activities. Kids will problem-solve together, make new friends, and build responsibility, perseverance, and teamwork, all while creating memories that last a lifetime.",
            fullDescription: "",
            points: [
                "Take on team challenges and problem-solving adventures",
                "Build perseverance, responsibility and teamwork",
                "Make new friends and create unforgettable experiences",
            ],
        },
    ];

    return (
        <div className="w-full">
            <BannerSection />

            {/* Programme Cards with separators */}
            {programmes.map((programme, index) => (
                <div key={index}>
                    <ProgrammeCard
                        title={programme.title}
                        imageSrc={programme.imageSrc}
                        date={programme.date}
                        time={programme.time}
                        description={programme.description}
                        fullDescription={programme.fullDescription}
                        points={programme.points}
                    />
                    {/* Add divider between programmes except after the last one */}
                    {index < programmes.length - 1 && (
                        <div className="border-t border-gray-300 w-3/4 mx-auto" />
                    )}
                </div>
            ))}
            
            <div className="border-t border-gray-300 w-3/4 mx-auto" />
            <JoinUs />
            <div className="border-t border-gray-300 w-3/4 mx-auto" />
            <InfoSection />
        </div>
    );
};

export default SchoolHolidayPage;