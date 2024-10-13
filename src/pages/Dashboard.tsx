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
import Navbar from "./Navbar";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn) {
    return <h1>Please sign in to access this page.</h1>;
  }
  return (
    <div className="flex flex-col h-screen w-screen bg-white text-black">
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

      <SignedIn>
        <h1>
          <strong>Welcome {user.firstName}</strong>
        </h1>

        <br></br>

        <h1>Hours</h1>

        <h2>You have {user.unsafeMetadata.hours as string} hours this year.</h2>
        <h2>
          {(user.unsafeMetadata.role as string) == "board" ||
          (user.unsafeMetadata.role as string) == "lead" ? (
            <a href="/dashboard/manage_hours">Manage Member Hours</a>
          ) : (
            ""
          )}
        </h2>

        <br></br>

        <h1>Events</h1>
        <h2>
          <strong>Propose Event to Leadership Team</strong>
        </h2>
        <form action="https://formsubmit.co/njhs@vaedz.com" method="POST">
          <input
            type="hidden"
            name="_next"
            value="https://njhs.vaed.in/dashboard"
          ></input>
          <input
            type="hidden"
            name="_subject"
            value="New NJHS Event Proposal"
          ></input>
          <input type="hidden" name="_captcha" value="false"></input>
          <h2>Event</h2>
          <input
            className="bg-white border-2"
            type="text"
            name="event"
            required
          ></input>
          <h2>Details</h2>
          <input
            className="bg-white border-2"
            type="text"
            name="details"
            required
          ></input>
          <h2>Link to Organization</h2>
          <input
            className="bg-white border-2"
            type="link"
            name="link"
            required
          ></input>
          <br></br>
          <button className="bg-green-400 border-2" type="submit">
            Send Proposal
          </button>
        </form>
      </SignedIn>

      <footer id="contact" className="w-full py-6 bg-gray-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <Award className="h-6 w-6 text-green-600" />
              <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
                © 2024 BASIS Cedar Park NJHS. All rights reserved.
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
}
