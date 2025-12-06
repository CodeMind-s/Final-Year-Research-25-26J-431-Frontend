import Image from "next/image";
import HomeCard from "@/components/common/HomeCard";


const homeCardData = [
    {
        title: "Know the Exact Harvest Day",
        description: "Every saltern owner lies awake wondering “Will it crystallize this week?”. This headline hands them god-like certainty — the single most valuable piece of information in the entire season..",
        image: "/assets/images/crystal-logo.svg",
    },
    {
        title: "Plan the Perfect Season",
        description: "Gives the feeling of upgrading from a bicycle to an air-conditioned control room. Makes even small saltern owners feel like they run a world-class operation.",
        image: "/assets/images/compass-logo.svg",
    },
    {
        title: "The End of Manual Checking",
        description: "Uses strong, absolute language that buyers and regulators love to hear. Creates emotional certainty in an industry full of human error and rejected shipments.",
        image: "/assets/images/vision-logo.svg",
    },
    {
        title: "From Bittern to Bank",
        description: "Elegant play on circular economy + financial upside. “Close the loop” is instantly understood by sustainability officers and government bodies.",
        image: "/assets/images/valor-logo.svg",
    },
];

export default function HomeSection() {
    return (
        <div className="min-h-screen bg-white p-6 flex items-center justify-center">
            <div className="w-full rounded-2xl p-8 border-1 border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex gap-8 h-[85vh]">
                    {/* Left Section - Content Area (40-45%) */}
                    <div className="w-[43%] flex flex-col justify-between gap-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-start">
                                <Image src="/assets/images/logo.svg" alt="Logo" width={200} height={56} />
                            </div>
                        </div>
                        {/* Title Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col -gap-1.5">
                                <h1 className="text-7xl font-bold tracking-tighter bg-linear-[90deg,#FFB622_0%,#FF7373_20%,#00D4FF_30%,#01B87A_80%] bg-clip-text text-transparent p-2">
                                    Intelligent Salt <br />
                                </h1>
                                <h1 className="text-6xl font-bold tracking-tighter text-black">
                                    Production for New Era
                                </h1>
                            </div>
                            <p className="text-lg font-regular text-gray-500 tracking-tight">
                                AI-powered quality inspection, crystallization forecasting, seasonal planning, and waste valorization — built exclusively for Sri Lanka’s salt producers to increase yield, guarantee export quality, and eliminate waste.ibulum.
                            </p>
                        </div>

                        {/* Bottom Section - Date and Logo */}

                    </div>

                    {/* Right Section - Green Bar and Grid (55-60%) */}
                    <div className="w-[57%] flex gap-6">
                        {/* Image Grid - 2x2 */}
                        <div className="flex-1 grid grid-cols-2 gap-5">
                            {/* Top Left - Earth Image Placeholder */}
                            {homeCardData.map((card, index) => (
                                <HomeCard key={index} {...card} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}