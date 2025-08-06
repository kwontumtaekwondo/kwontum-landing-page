// components/WhoAreWe.tsx
import Image from "next/image";
import Link from "next/link"; // Import the Link component
const AboutUs = () => {
    return (
        <div className="py-12 px-6 bg-gray-50">
            {/* Section: WHO ARE WE */}
            <div className="text-center mb-12">
                <h1 className="text-6xl xs:7xl lg:text-6l font-bold font-dolceVita mb-4 text-kwontum-darkRed">WHO ARE WE</h1>
            </div>

            {/* Section: A KWONTUM ATHLETE */}
            <div className="max-w-[500px] mx-auto mb-12 mt-12">
                <h2 className="text-2xl font-bold sm:mb-8 md:mb-4 text-center text-[#72161D] font-dolceVita ">A KWONTUM ATHLETE</h2>
                <p className="text-center mb-8 font-dolceVita font-bold">
                    One in training possesses the passion for knowledge, is driven by fundamentals, and maintains structure in learning.
                </p>
                <h2 className="text-2xl font-bold sm:mb-8 md:mb-4 text-center text-[#72161D] font-dolceVita">A KWONTUM PERSON</h2>
                <p className="text-center mb-8 font-dolceVita font-bold">
                One&apos;s spirit should be fueled with positive energy - striving to be grounded by living in the present.
                </p>
                <p className="text-center mb-8 font-dolceVita font-bold">
                    Accepting reality and self. <br/> slowing down with patience to go smooth; <br/>going smooth to be fast
                </p>
                <p className="text-center mb-8 font-dolceVita font-bold">
                    nurturing relationships, <br></br>and taking care of your physical health.
                </p>
                <p className="text-center mb-8 font-dolceVita font-bold">
                    Every member of the Kwontum family should be confident and down-to-earth, with an eye to the sky and feet on the ground.
                </p>
            </div>

            {/* Section: Coaching Philosophy */}
            <div className="mb-12 px-4 md:px-0">
                {/* Headline Box */}
                <div className="text-center mb-12">
                    <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-dolceVita mb-4 text-kwontum-darkRed leading-tight break-words text-center">
                        Driven by fundamentals <br />Defined by excellence</p>
                </div>

                {/* Image + Philosophy */}
                <div className="flex flex-col md:flex-row items-start justify-start gap-8 max-w-6xl mx-auto">
                    {/* Image */}
                    <div className="w-full md:w-1/2">
                        <Image
                            src="/img/coaching-photo.png"
                            alt="Coaching Photo"
                            width={500}
                            height={300}
                            className="rounded-lg"
                        />
                    </div>

                    {/* Philosophy Box */}
                    <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md border border-black mt-40">
                        <h3 className="text-2xl font-bold sm:mb-8 md:mb-4 text-center text-[#72161D] font-dolceVita ">OUR COACHING PHILOSOPHY</h3>
                        <p className="mb-4 text-black-600 font-nanum font-bold">
                            At Kwontum Taekwondo, we follow a structured curriculum that balances traditional Taekwondo principles with modern training techniques. We focus on developing:
                        </p>
                        <ul className="mb-4 mb-4 text-black-600 font-nanum font-bold">
                            <li className="mb-4">
                                <b>Technique & Precision</b> - Strong fundamentals in all basic movements, kicks, and blocks in Taekwondo.
                            </li>
                            <li className="mb-4">
                                <b>Strength & Agility</b> - Mental toughness, confidence, and the ability to overcome challenges.
                            </li>
                            <li className="mb-4">
                                <b>Respect & Sportsmanship</b> - The values of integrity, humility, and respect for others.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section: Meet Our Team */}
            <div className="max-w-6xl mx-auto mb-12 px-4 md:px-0">
                <div className="max-w-[650px]">
                    <h2 className="text-3xl font-bold font-dolceVita text-kwontum-darkRed mb-4">MEET OUR TEAM</h2>
                    <p className="mb-8 text-black-600 font-nanum font-bold">
                        Our team consists of dedicated coaches with extensive experience in Taekwondo. Each of
                        them is committed to bringing out the best in every student by providing individualized
                        guidance and support.
                    </p>
                    {/* Link to /about-us/coaches */}
                    <Link
                        href="/about-us/coaches"
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 font-nanum text-[#002b56] font-bold"
                    >
                        View All Coaches
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;