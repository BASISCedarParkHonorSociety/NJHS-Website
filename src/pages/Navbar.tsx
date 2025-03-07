import { Award } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import ThemeToggle from "../components/ThemeToggle";

export default function Navbar() {
  // @ts-ignore
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn) {
    return <h1>Error</h1>;
  }
  return (
    <div className="flex flex-col min-h-screen w-screen bg-white dark:bg-black text-black dark:text-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto flex h-14 items-center">
          <div className="flex-1">
            <a className="flex items-center space-x-2" href="/">
              <Award className="h-6 w-6 text-green-600" />
              <span className="font-bold text-green-600">
                BASIS Cedar Park NJHS
              </span>
            </a>
          </div>
          <nav className="flex-1 flex items-center justify-center space-x-6 text-sm font-medium">
              <a
                className="transition-colors hover:text-black dark:hover:text-white text-black dark:text-white"
                href="/#about"
              >
                About
              </a>
              <a
                className="transition-colors hover:text-black dark:hover:text-white text-black dark:text-white"
                href="/#pillars"
              >
                Pillars
              </a>
              <a
                className="transition-colors hover:text-black dark:hover:text-white text-black dark:text-white"
                href="/#activities"
              >
                Activities
              </a>
              <a
                className="transition-colors hover:text-black dark:hover:text-white text-black dark:text-white"
                href="/#membership"
              >
                Membership
              </a>
              <a
                className="transition-colors hover:text-black dark:hover:text-white text-black dark:text-white"
                href="/newsletter"
              >
                Newsletter
              </a>
              <a
                className="transition-colors hover:text-black dark:hover:text-white text-black dark:text-white"
                href="/dashboard"
              >
                Member Dashboard
              </a>
            </nav>
            <div className="flex-1 flex justify-end items-center space-x-2">
              <ThemeToggle />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
        </div>
      </header>
    </div>
  );
}
