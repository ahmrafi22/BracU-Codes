"use client"

import { Logo } from "../(promotion)/_components/logo";
import { Ban } from "lucide-react";

const BannedPage = () => {
  return (
    <>
    <div className=" p-6  flex items-center justify-center dark:bg-black">
    <Logo />
    </div>
    
    <div className="h-screen w-screen flex flex-row items-center justify-center dark:bg-black">
     
      <Ban className="mt-5 mr-4 text-red-600" /> <p className="mt-6 text-xl dark:text-white">Sorry, you have been banned from accessing this platform.</p>
    </div>
    </>
  );
};

export default BannedPage;
