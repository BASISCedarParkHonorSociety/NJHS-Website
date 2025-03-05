import { useEffect, useState } from "react";
import { Calendar, Users, BookOpen, Heart, Award, Search } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";

export default function ManageUsers() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    committee: '',
    password: '',
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "/api/v1/users/listUsers"
      );
      const data = await response.json();
      setUsers(data.data); // Access the data array from the response
      setFilteredUsers(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.emailAddresses[0].emailAddress.toLowerCase();
      const role = (user.publicMetadata?.role || "").toLowerCase();
      const committee = (user.publicMetadata?.committee || "").toLowerCase();

      return (
        fullName.includes(lowerCaseSearchTerm) ||
        email.includes(lowerCaseSearchTerm) ||
        role.includes(lowerCaseSearchTerm) ||
        committee.includes(lowerCaseSearchTerm)
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Get the current user's role
  const currentUserRole = user?.publicMetadata?.role || "user";

  const handleDeleteUser = async (userID: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/users/deleteUser`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("User deleted successfully");
        fetchUsers(); // Refresh the user list
      } else {
        alert(`Error deleting user: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `/api/v1/users/createUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("User created successfully");
        setShowCreateUserForm(false);
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          role: 'user',
          committee: '',
          password: '',
        });
        fetchUsers(); // Refresh the user list
      } else {
        alert(`Error creating user: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    }
  };

  const handleAddHours = async (userID: string) => {
    const amountToAddString = prompt("Enter the amount of hours to set:");
    const amountToAdd = parseFloat(amountToAddString || "");

    if (isNaN(amountToAdd)) {
      alert("Invalid number entered");
      return;
    }

    try {
      const response = await fetch(
        "/api/v1/users/editUserHours",
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

  const handleEditRole = async (userID: string) => {
    const currentUser = users.find(u => u.id === userID);
    const currentRole = currentUser?.publicMetadata?.role || "user";
    
    const newRole = prompt("Enter the role (user/lead/admin):", currentRole);
    
    if (!newRole || !["user", "lead", "admin"].includes(newRole) || newRole === currentRole) {
      if (newRole && !["user", "lead", "admin"].includes(newRole)) {
        alert("Invalid role. Please enter 'user', 'lead', or 'admin'.");
      }
      return;
    }

    try {
      const response = await fetch(
        "/api/v1/users/initUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            userID: userID, 
            role: newRole,
            committee: currentUser?.publicMetadata?.committee || "none",
            hours: currentUser?.publicMetadata?.hours || 0
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Role updated successfully");
        fetchUsers();
      } else {
        alert(`Error updating role: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error updating role");
    }
  };

  const handleEditCommittee = async (userID: string) => {
    const currentUser = users.find(u => u.id === userID);
    const currentCommittee = currentUser?.publicMetadata?.committee || "none";
    
    const newCommittee = prompt("Enter the committee name:", currentCommittee);
    
    if (!newCommittee || newCommittee === currentCommittee) {
      return;
    }

    try {
      const response = await fetch(
        "/api/v1/users/initUser", // Reusing the initUser endpoint to update metadata
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            userID: userID, 
            role: currentUser?.publicMetadata?.role || "user",
            committee: newCommittee,
            hours: currentUser?.publicMetadata?.hours || 0
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Committee updated successfully");
        // Re-fetch users to update the list
        fetchUsers();
      } else {
        alert(`Error updating committee:${data.error}`);
      }
    } catch (error) {
      console.error("Error updating committee:", error);
      alert("Error updating committee");
    }
  };

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
          <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-green-600 mb-4">
                Dashboard
              </h2>
              <nav className="space-y-1">
                <a
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600"
                >
                  <Calendar className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  Overview
                </a>
                {(user?.publicMetadata?.role as string) === "admin" ||
                (user?.publicMetadata?.role as string) === "lead" ? (
                  <>
                    <a
                      href="/dashboard/manage_users"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-green-600"
                    >
                      <BookOpen className="mr-3 h-5 w-5 text-green-500" />
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

          <main className="flex-grow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Manage Users</h2>
              {(currentUserRole === "admin" || currentUserRole === "lead") && (
                <Button 
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setShowCreateUserForm(true)}
                >
                  Create User
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full p-2 pl-10 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-green-500 focus:border-green-500"
                  placeholder="Search users by name, email, role, or committee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setSearchTerm("")}
                  >
                    <span className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">✕</span>
                  </button>
                )}
              </div>
              {searchTerm && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchTerm}"
                </div>
              )}
            </div>

            {showCreateUserForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="flex flex-col">
                    <label className="mb-1 dark:text-white">First Name:</label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      className="border rounded p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 dark:text-white">Last Name:</label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      className="border rounded p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 dark:text-white">Email:</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="border rounded p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 dark:text-white">Role:</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="border rounded p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="lead">Lead</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 dark:text-white">Committee:</label>
                    <input
                      type="text"
                      value={newUser.committee}
                      onChange={(e) => setNewUser({...newUser, committee: e.target.value})}
                      className="border rounded p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
                      placeholder="Leave blank for 'none'"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 dark:text-white">Temporary Password:</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="border rounded p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Minimum 8 characters. User can change this later.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      Create User
                    </Button>
                    <Button 
                      type="button"
                      className="bg-gray-600 text-white hover:bg-gray-700"
                      onClick={() => setShowCreateUserForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
            <ul>
              {loading ? (
                <li>Loading...</li>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((registeredUser: any, index: number) => (
                  <li key={index} className="mb-4 p-4 border rounded-lg bg-white dark:bg-gray-800 flex justify-between items-center">
                    <div className="text-left">
                      <div className="font-semibold dark:text-white">
                        {registeredUser.firstName} {registeredUser.lastName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {registeredUser.emailAddresses[0].emailAddress}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium dark:text-white">Role:</span>{" "}
                        <span className="dark:text-gray-300">{registeredUser.publicMetadata.role || "N/A"}</span> |{" "}
                        <span className="font-medium dark:text-white">Hours:</span>{" "}
                        <span className="dark:text-gray-300">{registeredUser.publicMetadata.hours || 0}</span> |{" "}
                        <span className="font-medium dark:text-white">Committee:</span>{" "}
                        <span className="dark:text-gray-300">{registeredUser.publicMetadata.committee || "none"}</span>
                      </div>
                    </div>
                    {(currentUserRole === "admin" || currentUserRole === "lead") && (
                      <div className="flex gap-2">
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handleAddHours(registeredUser.id)}
                        >
                          Set Hours
                        </Button>
                        <Button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => handleEditRole(registeredUser.id)}
                        >
                          Edit Role
                        </Button>
                        <Button
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                          onClick={() => handleEditCommittee(registeredUser.id)}
                        >
                          Edit Committee
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDeleteUser(registeredUser.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  {searchTerm ? "No users found matching your search." : "No registered users found."}
                </li>
              )}
            </ul>
          </main>
        </div>
      </SignedIn>
      <footer id="contact" className="w-full py-6 bg-gray-100 dark:bg-gray-900">
        <div className="px-4 md:px-6 h-full flex flex-col justify-between w-full">
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
                  className="underline hover:text-green-600 dark:hover:text-green-400"
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
