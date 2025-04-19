// components/coaches/AthleteProfile.tsx
import Image from "next/image";

const AthleteProfile = ({
  profile,
  trainingBackground,
  style,
  type,
}: {
  profile: string[];
  trainingBackground: string[];
  style: string[];
  type: string;
}) => {
  return (
    <div className="mt-12">
      {/* Athlete Profile Header */}
      <h2 className="text-3xl font-bold text-[#72161D] font-dolceVita">Athlete Profile</h2>

      {/* Profile Section */}
      {profile.length > 0 && (
        <div className="mt-4">
          <h3 className="font-nanum font-black">{type}</h3>
          <ul className="list-disc pl-6 mt-2">
            {profile.map((item, index) => (
              <li key={index} className="font-nanum font-bold md:text-s">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Training Background Section */}
      {trainingBackground.length > 0 && (
        <div className="mt-8">
          {/* Arrow Icon */}
          <div className="flex items-center mb-2">
            <Image
              src="/img/coaches/dumbbell-icon.png"
              alt="Arrow Icon"
              width={24}
              height={24}
              className="w-6 h-6 mr-2"
            />
            <h3 className="font-nanum text-[#002b56] font-black">Training Background</h3>
          </div>
          <ul className="list-disc pl-6">
            {trainingBackground.map((item, index) => (
              <li key={index} className="font-nanum font-bold md:text-s">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Style Section */}
      {style.length > 0 && (
        <div className="mt-8">
          {/* Fist Icon */}
          <div className="flex items-center mb-2">
            <Image
              src="/img/coaches/courage-icon.png"
              alt="Fist Icon"
              width={24}
              height={24}
              className="w-6 h-6 mr-2"
            />
            <h3 className="font-nanum text-[#002b56] font-black">Style & Strengths</h3>
          </div>
          <ul className="list-disc pl-6">
            {style.map((item, index) => (
              <li key={index} className="font-nanum font-bold md:text-s">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AthleteProfile;