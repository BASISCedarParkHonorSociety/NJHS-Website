import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, BookOpen, Heart, Award } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

export default function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn) {
    return <h1>Error</h1>;
  }
  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-black">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Award className="h-6 w-6 text-green-600" />
              <span className="hidden font-bold sm:inline-block text-green-600">
                BASIS Cedar Park NJHS
              </span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium ml-0">
              <a
                className="transition-colors hover:text-black text-black"
                href="#about"
              >
                About
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="#pillars"
              >
                Pillars
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="#activities"
              >
                Activities
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="#membership"
              >
                Membership
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="/newsletter"
              >
                Newsletter
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="/dashboard"
              >
                Member Dashboard
              </a>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}
