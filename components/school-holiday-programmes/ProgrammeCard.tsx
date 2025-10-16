// components/school-holiday-programmes/ProgrammeCard.tsx
interface ProgrammeCardProps {
  title: string;
  imageSrc: string;
  date: string;
  time: string;
  description: string;
  fullDescription: string;
  points: string[];
}

const ProgrammeCard = ({
  title,
  imageSrc,
  date,
  time,
  description,
  fullDescription,
  points
}: ProgrammeCardProps) => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="max-w-3xl">
          {/* Title */}
          <h2 className="text-3xl font-bold text-black mb-8 font-dolceVita text-left">
            {title}
          </h2>

          {/* Image (reduced to 75% width) */}
          {imageSrc && (
            <div className="w-1/2 mb-8">
              <img
                src={imageSrc}
                alt={title}
                className="w-full h-auto rounded-lg shadow-lg object-cover"
              />
            </div>
          )}

          {/* Date below image */}
          {(date || time) && (
            <div className="mb-8 text-left">
              <p className="text-black font-nanum font-extrabold text-lg">
                {date && time ? `Date: ${date} | Time: ${time}` :
                  date ? `Date: ${date}` :
                    time ? `Time: ${time}` : ''}
              </p>
            </div>
          )}

          {/* Programme Information below date */}
          <div className="space-y-6 text-black font-nanum text-left">
            {/* Allow HTML inside description */}
            <p 
              className="text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }} 
            />
            {fullDescription && (
              <p className="text-lg leading-relaxed">{fullDescription}</p>
            )}
          </div>

          {/* Points List */}
          {points.length > 0 && (
            <div className="mt-8 text-left">
              <p className="font-nanum text-black mb-4 text-lg">Kids will:</p>
              <ul className="space-y-3">
                {points.map((point, pointIndex) => (
                  <li
                    key={pointIndex}
                    className="flex items-start gap-3 text-black font-nanum text-lg"
                  >
                    <span className="text-[#72161D] mt-1 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammeCard;