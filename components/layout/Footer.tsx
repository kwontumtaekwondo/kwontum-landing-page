"use-client";

// Import Statements
import Link from "next/link";
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Calendar,
    Clock,
    Phone,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-kwontum-darkRed text-white py-10 grid grid-cols-1 md:grid-cols-4 gap-8 px-8 font-nanum">
            {/* KBH LOGO AND NAME SECTION */}
            <div className="flex flex-col justify-center text-center">
                <h2 className="text-2xl font-bold font-dolceVita">
                    What are you waiting for?
                </h2>
                <p className="text-center">
                    Join us today and start your journey!
                </p>
                {/* <Image
                    src="/img/logo.png"
                    alt="KBH Logo"
                    width={300}
                    height={125}
                    className="object-contain"
                />
                <Image
                    src="/img/logo-no-text.png"
                    alt="Kwontum Taekwondo Logo"
                    width={125}
                    height={125}
                    className="object-contain"
                />
                <h2 className="text-2xl font-bold text-black font-dolceVita">
                    Kwontum Taekwondo
                </h2>
                <p className="text-xs text-center text-gray shadow-sm">
                    DRIVEN BY FUNDAMENTALS, DEFINED BY EXCELLENCE
                </p> */}
            </div>

            {/* MAP SECTION */}
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold font-dolceVita">
                    LOCATE US ON GOOGLE MAPS
                </h3>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.640655882624!2d103.9164382!3d1.3921388000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da3d0033a4247d%3A0xc7e1d03f20860ba7!2sKwontum%20Taekwondo!5e0!3m2!1sen!2ssg!4v1739209001781!5m2!1sen!2ssg"
                    width="90%"
                    height="200"
                    className="rounded-[12px] border-0"
                    loading="lazy"
                    allowFullScreen={true}
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Kwontum Taekwondo Location"
                    aria-label="Google Maps showing location of Kwontum Taekwondo"
                />
            </div>

            <div className="flex flex-col justify-between gap-4">
                <div className="grid gap-2">
                    <h3 className="text-lg font-semibold font-dolceVita">
                        SINGAPORE
                    </h3>
                    <div className="flex items-start gap-2 text-sm">
                        <Mail size={16} className="flex-shrink-0" />
                        <a
                            href="mailto:hello@kwontum.com.sg"
                            className="hover:underline"
                        >
                            hello@kwontum.com.sg
                        </a>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <MapPin size={16} className="flex-shrink-0" />
                        <p className="text-sm">
                            6 Tebing Ln, #01-02A, Singapore 828835
                        </p>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <Phone size={16} className="flex-shrink-0" />
                        <p className="text-sm">+65 8467 4113 (WhatsApp Only)</p>
                    </div>
                </div>

                <div className="grid gap-2">
                    <h3 className="text-lg font-semibold font-dolceVita">
                        HOURS
                    </h3>
                    <div className="flex gap-8">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="flex-shrink-0" />
                                <p className="text-sm"> Monday - Friday </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={16} className="flex-shrink-0" />
                                <p className="text-sm"> 1600 - 2030 </p>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="flex-shrink-0" />
                                <p className="text-sm"> Saturday - Sunday </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={16} className="flex-shrink-0" />
                                <p className="text-sm"> 0930 - 1730 </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOLLOW US SECTION */}
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold font-dolceVita">
                    FOLLOW US
                </h3>
                <div className="flex gap-5">
                    <Link
                        href="https://www.facebook.com/teamkwontum/"
                        aria-label="Facebook"
                        className="hover:scale-125 transition-transform duration-200"
                    >
                        <Facebook className="w-6 h-6 text-white" />
                    </Link>
                    <Link
                        href="https://www.instagram.com/teamkwontum/?hl=en"
                        aria-label="Instagram"
                        className="hover:scale-125 transition-transform duration-200"
                    >
                        <Instagram className="w-6 h-6 text-white" />
                    </Link>
                </div>
            </div>
            {/* <div className="flex px-4 sm:px-6 lg:px-8 text-center">
                <p>&copy; 2025 Kwontum Taekwondo. All rights reserved.</p>
            </div> */}
        </footer>
    );
}
