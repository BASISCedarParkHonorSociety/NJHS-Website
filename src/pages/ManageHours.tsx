import { useEffect, useState } from "react";
import { Calendar, Users, BookOpen, Heart, Award } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

export default function ManageHours() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://njhs-api.robby.blue/api/v1/users/listUsers"
      );
      const data = await response.json();
      setUsers(data.data); // Ensure this matches the response structure
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Get the current user's role
  const currentUserRole = user?.unsafeMetadata?.role || "user";

  const handleAddHours = async (userID: string) => {
    const amountToAddString = prompt("Enter the amount of hours to set:");
    const amountToAdd = parseFloat(amountToAddString || "");

    if (isNaN(amountToAdd)) {
      alert("Invalid number entered");
      return;
    }

    try {
      const response = await fetch(
        "https://njhs-api.robby.blue/api/v1/users/editUserHours",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID: userID, hours: amountToAdd }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Hours updated successfully");
        // Re-fetch users to update the list
        fetchUsers();
      } else {
        alert(`Error updating hours:${data.error}`);
      }
    } catch (error) {
      console.error("Error updating hours:", error);
      alert("Error updating hours");
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <h1>Please sign in to access this page.</h1>;
  }

  return (
    <div className="flex flex-col min-h-screen w-screen bg-white text-black">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-14 items-center w-full">
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
        <div className="w-full py-6 flex flex-1">
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
                {(user.unsafeMetadata.role as string) == "board" ||
                (user.unsafeMetadata.role as string) == "lead" ? (
                  <>
                    <a
                      href="/dashboard/manage_hours"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-green-600"
                    >
                      <BookOpen className="mr-3 h-5 w-5 text-green-500" />
                      Manage Hours
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

          <main className="flex-grow p-6">
            <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
            <ul>
              {loading ? (
                <li>Loading...</li>
              ) : users.length > 0 ? (
                users.map((registeredUser: any, index: number) => (
                  <li key={index} className="mb-2">
                    {registeredUser.firstName} {registeredUser.lastName} -{" "}
                    {registeredUser.emailAddresses[0].emailAddress} - Role:{" "}
                    {registeredUser.unsafeMetadata.role || "N/A"} - Hours:{" "}
                    {registeredUser.unsafeMetadata.hours || 0}
                    {(currentUserRole === "admin" ||
                      currentUserRole === "lead") && (
                      <button
                        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                        onClick={() => handleAddHours(registeredUser.id)}
                      >
                        Set Hours
                      </button>
                    )}
                  </li>
                ))
              ) : (
                <li>No registered users found.</li>
              )}
            </ul>
          </main>
        </div>
      </SignedIn>
      <footer id="contact" className="w-full py-6 bg-gray-100">
        <div className="px-4 md:px-6 h-full flex flex-col justify-between w-full">
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
