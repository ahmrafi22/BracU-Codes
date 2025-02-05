"use client"
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, Files } from "lucide-react";
import { Logo } from "../(promotion)/_components/logo";
import StatsCard from "./__adcomponents/stats-card";
import { ModeToggle } from "@/components/mode-toggle"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(true);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const adminUsername = "admin";

  const totalUsers = useQuery(api.users.getTotalUsers);
  const totalDocuments = useQuery(api.documents.getTotalDocuments);
  const users = useQuery(api.users.getAllUsers);
  const updateUserBanStatus = useMutation(api.users.updateBanStatus);

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setOpen(false);
    } else {
      alert("Incorrect password");
    }
  };

  const handleBanStatusChange = async (userId: string, isBanned: boolean) => {
    await updateUserBanStatus({ userId, isBanned });
  };

  return (
    <div className="dark:bg-black dark:text-white min-h-screen">
      {!isAuthenticated && (
        <Dialog open={open}>
          <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
            <DialogHeader>
              <Logo />
              <DialogTitle className="flex justify-center dark:text-white">Admin Login</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2 dark:text-gray-300">Username</label>
                <input
                  id="username"
                  type="text"
                  value={adminUsername}
                  disabled
                  className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block mb-2 dark:text-gray-300">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border px-2 py-1 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Login
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {isAuthenticated && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Logo />
            <ModeToggle /> {/* Add ModeToggle to top right */}
          </div>
          <h1 className="text-2xl font-bold mb-16 flex justify-center dark:text-white">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            <div className="w-full max-w-[500px] mx-auto">
              <StatsCard
                title="Total Users"
                value={totalUsers === undefined ? "Loading..." : totalUsers}
                icon={Users}
              />
            </div>
            <div className="w-full max-w-[500px] mx-auto">
              <StatsCard
                title="Total Documents"
                value={totalDocuments === undefined ? "Loading..." : totalDocuments}
                icon={Files}
              />
            </div>
          </div>

          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">User Management</h2>
            <div className="overflow-x-auto">
              <Table className="md:mx-auto">
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Full Name</TableHead>
                    <TableHead className="dark:text-gray-300">Email</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user._id} className="dark:border-gray-700">
                      <TableCell className="font-medium dark:text-gray-200">{user.fullName}</TableCell>
                      <TableCell className="dark:text-gray-200">{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.isBanned ? "banned" : "active"}
                          onValueChange={(value) => 
                            handleBanStatusChange(user.userId, value === "banned")
                          }
                        >
                          <SelectTrigger className={`w-32 ${
                            user.isBanned 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="active" className="text-green-700 dark:text-green-400">
                              Active
                            </SelectItem>
                            <SelectItem value="banned" className="text-red-700 dark:text-red-400">
                              Banned
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;