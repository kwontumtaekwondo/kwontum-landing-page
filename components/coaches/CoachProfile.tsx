import Image from "next/image";

const CoachProfile = ({ picture, quote }: { picture: string; quote: string }) => {
  return (
    <div className="px-4 md:px-0">
      {/* Header */}
      <h2 className="text-3xl font-bold mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-[#72161D] font-dolceVita">
        Coach Profile
      </h2>

      {/* Profile Section */}
      <div className="flex flex-col md:flex-row items-start gap-16">
        {/* Profile Picture */}
        <div className="w-48">
          <Image
            src={picture}
            alt="Coach Profile"
            width={192}
            height={192}
            className="object-cover"
          />
        </div>

        {/* Quote */}
        <div className="text-center md:text-left max-w-xl mt-6 md:mt-16 lg:mt-18">
          <p className="text-xl font-dolceVita font-bold">
          &quot;{quote}&quot;
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoachProfile;
