// components/coaches/CertificationsExperience.tsx
import Image from "next/image";

const CertificationsExperience = ({ certificates }: { certificates: string[] }) => {
  return (
    <div className="mt-12">
      {/* Certificate Icon and Title */}
      <div className="flex items-center mb-4">
        {/* Certificate Icon */}
        <Image
          src="/img/coaches/certificate-icon.png"
          alt="Trophy Icon"
          width={24}
          height={24}
          className="mr-2"
        />
        {/* Section Title */}
        <h2 className="font-nanum text-[#002b56] md:text-xl font-black">
          Certifications & Experience
        </h2>
      </div>

      {/* List of Certificates */}
      <ul className="list-disc pl-6">
        {certificates.map((item, index) => (
          <li key={index} className="font-nanum font-bold md:text-s">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificationsExperience;