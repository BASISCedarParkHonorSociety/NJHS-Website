import React from "react";
import { Calendar, Users, BookOpen, Heart, Award } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const Event: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn) {
    return <h1>Please sign in to access this page.</h1>;
  }
  return (
    <div className="flex flex-col min-h-screen w-screen bg-white text-black">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
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
              className="transition-colors hover:text-black text-black"
              href="/#about"
            >
              About
            </a>
            <a
              className="transition-colors hover:text-black text-black"
              href="/#pillars"
            >
              Pillars
            </a>
            <a
              className="transition-colors hover:text-black text-black"
              href="/#activities"
            >
              Activities
            </a>
            <a
              className="transition-colors hover:text-black text-black"
              href="/#membership"
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
              className="transition-colors hover:text-black text-black whitespace-nowrap"
              href="/dashboard"
            >
              Member Dashboard
            </a>
          </nav>
          <div className="flex-1 flex justify-end">
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
        <br></br>
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-green-600 mb-4">
                Dashboard
              </h2>
              <nav className="space-y-1">
                <a
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600"
                >
                  <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                  Overview
                </a>
                {(user?.publicMetadata?.role as string) === "admin" ||
                (user?.publicMetadata?.role as string) === "lead" ? (
                  <>
                    <a
                      href="/dashboard/manage_users"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600"
                    >
                      <BookOpen className="mr-3 h-5 w-5 text-gray-400" />
                      Manage Users
                    </a>
                  </>
                ) : null}
                <a
                  href="/dashboard/events"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600"
                >
                  <Heart className="mr-3 h-5 w-5 text-gray-400" />
                  Event Proposals
                </a>
                <a
                  href="/dashboard/async"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600"
                >
                  <Users className="mr-3 h-5 w-5 text-gray-400" />
                  Submit Async Hours
                </a>
                <a
                  href="/dashboard/sync"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600"
                >
                  <Users className="mr-3 h-5 w-5 text-gray-400" />
                  Submit Sync Hours
                </a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, padding: "20px" }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLScDEfmnCiAUR97kq9tOccqWslgrpD4HZfMHzzj_PDoQ79XTAw/viewform?embedded=true"
              width="100%"
              height="800"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
            >
              Loading…
            </iframe>
          </main>
        </div>
      </SignedIn>

      <footer id="contact" className="w-full py-6 bg-gray-100 mt-auto">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <Award className="h-6 w-6 text-green-600" />
              <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
                © 2025 BASIS Cedar Park NJHS. All rights reserved.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
                Contact:{" "}
                <a
                  href="mailto:contact@basisnjhs.org"
                  className="underline hover:text-green-600"
                >
                  contact@basisnjhs.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Event;
