import Image from "next/image";
import { Days_One } from "next/font/google";
import { cn } from "@/lib/utils";
import { CornerDownRight } from "lucide-react";

const font = Days_One({
    subsets: ["latin"],
    weight: ["400"]
});

interface HeroSection {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    gradient: string;
    features: string[];
}

interface HeroSectionProps {
    section: HeroSection;
    topPosition: string;
}

const heroSections: HeroSection[] = [
    {
        title: "Enhanced Block Note Documents",
        description: "A powerful streamlined rich text editor designed for clarity and efficiency. Built with Blocknote, this tool makes note-taking and content creation seamless, letting you focus on your ideas without distractions.",
        imageSrc: "/doc.png",
        imageAlt: "Block Note Preview",
        gradient: "from-blue-300 to-yellow-300",
        features: [
            "Versatile Formatting",
            "Block-Based Structure",
            "Lightweight & Fast",
            "Instant share with anyone"
        ]
    },
    {
        title: "Dynamic Dashboard",
        description: "Boost your productivity with your go-to dashboard that transforms how you track, manage, and achieve your goals. Experience a seamless blend of task management, academic planning, and habit formation all in one place.",
        imageSrc: "/dashboard.png",
        imageAlt: "Dashboard Preview",
        gradient: "from-purple-300 to-pink-300",
        features: [
            "Track your tasks and deadlines",
            "Manage your exam schedule and study plans",
            "Monitor study time and productivity metrics",
            "Build and maintain positive habits",
            "Visualize your progress with analytics"
        ]
    },
    {
        title: "AI Chatbot Assistant",
        description: "Discover the power of Polaris AI chatbot, powered by Google's generative AI Gemini. Get intelligent responses, analyze complex information, and receive creative assistance tailored to your needs.",
        imageSrc: "/aichat.png",
        imageAlt: "AI Assistant Preview",
        gradient: "from-green-300 to-blue-300",
        features: [
            "Get instant answers to complex questions",
            "Analyze images and extract insights",
            "Generate comprehensive study notes",
            "Receive creative writing assistance",
            "Access educational resources"
        ]
    },
    {
        title: "Interactive Drawing Canvas",
        description: "Unleash your creativity with our advanced drawing canvas. Transform your ideas into visual masterpieces, create detailed mind maps, and collaborate with others in real-time.",
        imageSrc: "/canvas.png",
        imageAlt: "Canvas Preview",
        gradient: "from-orange-300 to-red-300",
        features: [
            "Design intuitive mind maps",
            "Sketch freehand illustrations",
            "Collaborate in real-time",
            "Export in multiple formats"
        ]
    }
];

const HeroSection: React.FC<HeroSectionProps> = ({ section, topPosition }) => {
    return (
        <div 
            className="w-[90%] h-[70vh] p-12 mb-11 sticky bg-gray-400 dark:bg-gray-600 rounded-3xl z-0 overflow-hidden after:z-10 after:content-[''] after:absolute after:inset-0 after:outline-10 after:outline after:-outline-offset-2 after:rounded-3xl after:outline-white"
            style={{ top: topPosition }}
        >
            <div className="flex justify-between h-full relative">
                <div className="absolute left-[-100px] top-0 w-1/2 h-full">
                    <div className="relative w-full h-full">
                        <Image 
                            src={section.imageSrc}
                            alt={section.imageAlt}
                            layout="fill"
                            objectFit="fit"
                            className="rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-8 w-1/2 ml-auto">
                    <h1 className={cn(
                        "text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                        section.gradient,
                        font.className
                    )}>
                        {section.title}
                    </h1>
                    <p className="text-2xl text-gray-200 text-left leading-relaxed">
                        {section.description}
                    </p>
                    <div className="flex flex-col gap-6 mt-4">
                        {section.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <CornerDownRight className="h-6 w-6 text-gray-200" />
                                <span className="text-xl text-gray-200">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Heroes: React.FC = () => {
    return (
        <div className="w-[95%] h-full rounded-[20px]">
            <div className="w-full h-full flex flex-col items-center gap-4 pt-24 sticky">
                {heroSections.map((section, index) => (
                    <HeroSection 
                        key={index}
                        section={section}
                        topPosition={`${100 + (index * 50)}px`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Heroes;
