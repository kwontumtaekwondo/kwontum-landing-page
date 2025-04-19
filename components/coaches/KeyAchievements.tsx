// components/coaches/KeyAchievements.tsx
import Image from "next/image";

const KeyAchievements = ({ achievements }: { achievements: { image: string; text: string }[] }) => {
  return (
    <div className="mt-12">
      {/* Header Section */}
      <div className="flex items-center mb-4 pl-6">
        {/* Trophy Icon (Aligned with List Icons) */}
        <Image
          src="/img/coaches/winning-cup-icon.png"
          alt="Trophy Icon"
          width={24}
          height={24}
          className="w-6 h-6 mr-2"
        />
        {/* Section Title */}
        <h2 className="font-nanum text-[#002b56] md:text-xl font-black">Key Achievements</h2>
      </div>

      {/* List of Achievements */}
      <ul className="list-none pl-6">
        {achievements.map((achievement, index) => (
          <li key={index} className="flex items-center mb-2">
            {/* Achievement Icon */}
            <Image
              src={achievement.image}
              alt={`${achievement.text} icon`}
              width={24}
              height={24}
              className="w-6 h-6 mr-2"
            />
            {/* Achievement Text */}
            <span className = "font-nanum text-[#002b56] md:text-s">{achievement.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeyAchievements;