// components/school-holiday-programmes/InfoSection.tsx
const InfoSection = () => {
    return (
        <div className="bg-white py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-left text-black font-nanum space-y-16">

                {/* WhatsApp Section */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <img src="/img/school-holiday/7.png" className="w-12 h-12" alt="WhatsApp icon" />
                        <h2 className="text-2xl font-bold font-dolceVita">
                            Have Questions?
                        </h2>
                    </div>
                    <div className="space-y-4 text-lg leading-relaxed">
                        <p>
                            Want to know more before signing up? WhatsApp us today!
                        </p>
                        <p>
                            We're happy to answer your questions and help your child join an
                            unforgettable holiday experience.
                        </p>
                    </div>
                </div>

                {/* Location Section */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <img src="/img/school-holiday/6.png" className="w-12 h-12" alt="Location icon" />
                        <h2 className="text-2xl font-bold font-dolceVita">
                            Where Are We Located At
                        </h2>
                    </div>
                    <p className="text-lg leading-relaxed">
                        Locate us at <span className="font-bold">6 Tebing Lane, #01-02A, Singapore 828835</span>, just a
                        5-minute walk away from Punggol Riviera LRT Station. On-site parking
                        is available. See you!
                    </p>
                </div>

                {/* Image Section */}
                <div className="mt-12">
                    <img
                        src="/img/school-holiday/9.png"
                        alt="Kwontum Taekwondo Location"
                        className="w-3/4 h-auto rounded-lg shadow-lg object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default InfoSection;