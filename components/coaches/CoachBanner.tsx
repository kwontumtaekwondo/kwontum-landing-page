// components/coaches/CoachBanner.tsx
import Image from "next/image";

const CoachBanner = ({ banner, fullName }: { banner: string; fullName: string; title: string }) => {
  return (
    <div className="relative">
      {/* Background Banner */}
      <Image
        src={banner}
        alt={`${fullName} banner`}
        layout="responsive"
        width={1920}
        height={480}
        className="w-full h-auto object-cover"
      />
    </div>
  );
};

export default CoachBanner;