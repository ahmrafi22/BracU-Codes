import { motion } from "framer-motion";
import { Days_One } from "next/font/google";

const daysOne = Days_One({
  subsets: ["latin"],
  weight: "400", // Use string instead of array
});

const Header = () => {
  const headerVariant = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-center h-12 bg-transparent px-4">
      <motion.h1
        variants={headerVariant}
        initial="hidden"
        animate="visible"
        className={`text-xl font-semibold dark:text-white ${daysOne.className}`}
      >
        POLARIS AI Chat
      </motion.h1>
    </header>
  );
};

export default Header;
