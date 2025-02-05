"use client"

import { Button } from "@/components/ui/button"
import { useConvexAuth } from "convex/react"
import { ArrowRight } from "lucide-react"
import { Spinner } from "@/components/spinners"
import Link from "next/link"
import { SignInButton } from "@clerk/clerk-react"
import { TextLoop } from "./animation"

import { Days_One } from "next/font/google"

import { cn  } from "@/lib/utils";

const font = Days_One({
    subsets: ["latin"],
    weight:["400"]
});


export const Heading = () => {
  const {isAuthenticated, isLoading} = useConvexAuth()
  return (
      <div className="max-w-5xl space-y-4">
        <h1 className={cn("text-3xl sm:text-5xl md:text-6xl font-bold mb-5", font.className)}>
          Your{" "}
          <TextLoop interval={1.4}>
            <span className="text-blue-400">Documents</span>
            <span className="text-green-400">  Ideas</span>
            <span className="text-red-400">  Plans</span>
            <span className="text-yellow-400">  Tasks</span>
            <span className="text-pink-400">  Sketches</span>

          </TextLoop>
          <br />
          All in One Place{" "}
          <span className="relative inline-block">
            Polaris
            <span className="absolute bottom-[-10px] left-0 w-full h-[8px] border-t-[5px] border-solid rounded-[50%] border-transparent bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>
          </span>
        </h1>

        <h3 className="text-base sm:text-xl md:text-2xl font-medium">
          Make your everyday more productive!!
        </h3>
        {isLoading && (
          <div className="w-full flex items-center justify-center">
            <Spinner size="lg"/>
          </div>
        )}

        {isAuthenticated && !isLoading && (
          <Button asChild className="group">
            <Link href="/documents">
              Enter Polaris
              <ArrowRight className="transition-transform group-hover:translate-x-1 ml-2" />
            </Link>
          </Button>
        )}

        {!isAuthenticated && !isLoading && (
          <SignInButton mode="modal">
            <Button className="group">
              Get Polaris
              <ArrowRight className="transition-transform group-hover:translate-x-1 ml-2" />
            </Button>
          </SignInButton>
        )}
    </div>
  )
}
