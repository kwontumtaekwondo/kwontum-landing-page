"use client";

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
            <Card className="h-full transition-transform duration-300 hover:scale-105 cursor-pointer flex flex-col">
                {/* Card Header with Responsive Avatar */}
                <CardHeader className="flex items-center justify-center p-4 flex-shrink-0">
                    <div className="w-full aspect-square max-w-[256px] mx-auto">
                        <Avatar className="w-full h-full">
                            <AvatarImage 
                                src={picture} 
                                alt={`${fullName} profile`}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-4xl">
                                {fullName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="text-center px-4 pb-4 flex-grow">
                    <CardTitle className="text-4xl lg:text-3xl font-dolceVita text-kwontum-black break-words mb-2">
                        {fullName}
                    </CardTitle>
                    <p className="text-2xl lg:text-xl font-bold font-dolceVita text-kwontum-darkRed break-words">
                        {title}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
};

export default CoachCard;