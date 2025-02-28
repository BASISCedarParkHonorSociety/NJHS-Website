import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Award } from "lucide-react";

export default function InitUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [status, setStatus] = useState("Initializing your account...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    const initializeUser = async () => {
      try {
        if (user.publicMetadata && Object.keys(user.publicMetadata).length > 0) {
          setStatus("Your account is already initialized. Redirecting to dashboard...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
          return;
        }

        const response = await fetch("/api/v1/users/initUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: user.id,
            role: "user",
            committee: "none",
            hours: 0,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to initialize user metadata");
        }

        setStatus("Your account has been initialized! Redirecting to dashboard...");
        
        await user.reload();
        
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } catch (error) {
        console.error("Error initializing user:", error);
        setError("There was an error initializing your account. Please try again or contact support.");
        setStatus("Failed to initialize account");
      }
    };

    initializeUser();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>;
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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to NJHS</h1>
          <p className="text-lg mb-4">{status}</p>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                onClick={() => signOut()}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </main>

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
}
