import { Calendar, Users, BookOpen, Heart, Award } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import ThemeToggle from "../components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  return (
    <div className="flex flex-col min-h-screen w-screen bg-white dark:bg-black text-black dark:text-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto flex h-14 items-center">
          <div className="flex-1">
            <a className="flex items-center space-x-2" href="/">
              <Award className="h-6 w-6 text-green-600" />
              <span className="hidden font-bold sm:inline-block text-green-600">
                BASIS Cedar Park NJHS
              </span>
            </a>
          </div>
          <nav className="flex-1 flex items-center justify-center gap-5 text-sm font-medium">
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
              className="transition-colors hover:text-black dark:hover:text-white text-black dark:text-white whitespace-nowrap"
              href="/dashboard"
            >
              Member Dashboard
            </a>
          </nav>
          <div className="flex-1 flex justify-end items-center space-x-2">
            <ThemeToggle />
            <SignedOut>
              <a href="/sign-in">
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  Sign In
                </Button>
              </a>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <SignedIn>
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-green-600 mb-4">
                Dashboard
              </h2>
              <nav className="space-y-1">
                <a
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-green-600"
                >
                  <Calendar className="mr-3 h-5 w-5 text-green-500" />
                  Overview
                </a>
                {(user?.publicMetadata?.role as string) === "admin" ||
                (user?.publicMetadata?.role as string) === "lead" ? (
                  <>
                    <a
                      href="/dashboard/manage_users"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600"
                    >
                      <BookOpen className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      Manage Users
                    </a>
                  </>
                ) : null}
                <a
                  href="/dashboard/events"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600"
                >
                  <Heart className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  Event Proposals
                </a>
                <a
                  href="/dashboard/async"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600"
                >
                  <Users className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  Submit Async Hours
                </a>
                <a
                  href="/dashboard/sync"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600"
                >
                  <Users className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  Submit Sync Hours
                </a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6">
            <h1>
              <strong>Welcome {user?.firstName}</strong>
            </h1>
            <h2 className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {(user?.publicMetadata?.role as string) === "admin" ? (
                `Role: Administrator | Committee: ${user?.publicMetadata?.committee}`
              ) : (user?.publicMetadata?.role as string) === "lead" ? (
                `Committee Lead for ${user?.publicMetadata?.committee}`
              ) : (
                `NJHS Member | Committee: ${user?.publicMetadata?.committee}`
              )}
            </h2>

            <br></br>

            <h1 className="text-2xl font-bold mb-4">Hours</h1>
            <h2 className="text-xl font-semibold mb-2">
              You have {user?.publicMetadata?.hours as string} hours this year.
            </h2>
            <h2 className="text-xl font-semibold mb-2">
              {(user?.publicMetadata?.role as string) === "admin" ||
              (user?.publicMetadata?.role as string) === "lead" ? (
                <a href="/dashboard/manage_users">Manage Members</a>
              ) : (
                ""
              )}
            </h2>
          </main>
        </div>
      </SignedIn>

      <footer id="contact" className="w-full py-6 bg-gray-100 dark:bg-gray-900 mt-auto">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <Award className="h-6 w-6 text-green-600" />
              <p className="text-center text-sm leading-loose text-gray-600 dark:text-gray-400 md:text-left">
                © 2025 BASIS Cedar Park NJHS. All rights reserved.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose text-gray-600 dark:text-gray-400 md:text-left">
                Contact:{" "}
                <a
                  href="mailto:contact@basiscpk.com"
                  className="underline hover:text-green-600"
                >
                  contact@basiscpk.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
