"use client"; // Required for shadcn/ui components

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CoachCard = ({
    picture,
    fullName,
    name,
    title,
}: {
    picture: string;
    fullName: string;
    name: string;
    title: string;
}) => {
    return (
        <Link href={`/about-us/coaches/${name}`} passHref>
            <Card className=" transition-transform duration-300 hover:scale-105 cursor-pointer flex flex-col justify-between">
                {/* Card Header with Circular Avatar */}
                <CardHeader className="flex items-center justify-center pb-4">
                    <Avatar className="w-64 h-64">
                        <AvatarImage src={picture} alt={`${fullName} profile`} />
                        <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </CardHeader>

                {/* Card Content with Full Name and Title */}
                <CardContent className="text-center space-y-2 px-4">
                    <CardTitle className="text-5xl xs:text-6xl lg:text-4xl font-dolceVita text-kwontum-black break-words">
                        {fullName}
                    </CardTitle>
                    <p className="text-3xl xs:text-4xl lg:text-2xl font-bold font-dolceVita text-kwontum-darkRed break-words">
                        {title}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
};

export default CoachCard;
