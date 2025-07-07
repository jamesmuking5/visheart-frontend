"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { adminApi } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import {
  RefreshCw,
  AlertCircle,
  Edit,
  Trash2,
  Shield,
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
} from "lucide-react";

// Define the user type based on the expected API response
interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "guest";
}

// Define sort configuration
type SortKey = keyof User;
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export default function AdminPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "user" | "admin" | "guest"
  >("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "username",
    direction: "asc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filtered and sorted users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      // Text search across username, email, and phone
      const searchMatch =
        searchTerm === "" ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone &&
          user.phone.toLowerCase().includes(searchTerm.toLowerCase()));

      // Role filter
      const roleMatch = roleFilter === "all" || user.role === roleFilter;

      return searchMatch && roleMatch;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, sortConfig]);

  // Handle sorting
  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setSortConfig({ key: "username", direction: "asc" });
  };

  const fetchUsers = async () => {
    if (currentUser?.role === "admin") {
      try {
        setIsLoading(true);
        const response = await adminApi.getAllUsers();
        if (response.fetch) {
          setUsers(response.users);
        } else {
          setError(response.message || "Failed to fetch users.");
          toast.error(response.message || "Failed to fetch users.");
        }
      } catch (err) {
        setError("An error occurred while fetching users.");
        toast.error("An error occurred while fetching users.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [currentUser, authLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        const searchInput = document.getElementById("search");
        searchInput?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const { username, ...updates } = editingUser;
      const result = await adminApi.adminUpdateUser(username, updates);

      if (result.update) {
        toast.success(`User ${username} updated successfully!`);
        // Update the user in the local state with the returned user data
        setUsers(users.map((u) => (u.username === username ? result.user : u)));
        setEditingUser(null); // Close the dialog
      } else {
        toast.error(result.message || "Failed to update user.");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "An error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (usernameToDelete: string) => {
    try {
      const result = await adminApi.adminDeleteUser(usernameToDelete);
      if (result.delete) {
        toast.success(result.message);
        // Remove the user from the local state
        setUsers(users.filter((u) => u.username !== usernameToDelete));
      } else {
        toast.error(result.message || "Failed to delete user.");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "An error occurred.",
      );
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center text-red-500">
          <AlertCircle className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
        </div>
        <p className="text-muted-foreground mt-4 text-center">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">{error}</div>
        <Button onClick={fetchUsers} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors />
      <div className="container mx-auto p-6">
        <div className="mb-4 flex items-center gap-2">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Shield className="h-7 w-7 text-blue-500" />
        </div>
        {/* User Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>Overview of users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-muted-foreground text-sm">Total Users</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {users.filter((u) => u.role === "admin").length}
                </div>
                <div className="text-muted-foreground text-sm">Admins</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.role === "user").length}
                </div>
                <div className="text-muted-foreground text-sm">Users</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {users.filter((u) => u.role === "guest").length}
                </div>
                <div className="text-muted-foreground text-sm">Guests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View, edit, and delete users in the system.{" "}
                  {filteredAndSortedUsers.length} of {users.length} users shown.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Controls */}
            {showFilters && (
              <div className="mb-4 space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-1 h-3 w-3" />
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="search">
                      Search{" "}
                      <kbd className="bg-muted ml-1 rounded px-1.5 py-0.5 text-xs">
                        Ctrl+K
                      </kbd>
                    </Label>
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                      <Input
                        id="search"
                        placeholder="Search by username, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-filter">Role</Label>
                    <Select
                      value={roleFilter}
                      onValueChange={(value: any) => setRoleFilter(value)}
                    >
                      <SelectTrigger id="role-filter">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[640px] table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="hover:bg-muted/50 w-[120px] cursor-pointer select-none"
                        onClick={() => handleSort("username")}
                      >
                        <div className="flex items-center">
                          Username
                          {sortConfig.key === "username" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="hover:bg-muted/50 w-[200px] cursor-pointer select-none"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          Email
                          {sortConfig.key === "email" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="hover:bg-muted/50 w-[120px] cursor-pointer select-none"
                        onClick={() => handleSort("phone")}
                      >
                        <div className="flex items-center">
                          Phone
                          {sortConfig.key === "phone" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="hover:bg-muted/50 w-[80px] cursor-pointer select-none"
                        onClick={() => handleSort("role")}
                      >
                        <div className="flex items-center">
                          Role
                          {sortConfig.key === "role" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-muted-foreground py-6 text-center"
                        >
                          {users.length === 0
                            ? "No users found."
                            : "No users match the current filters."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedUsers.map((u) => (
                        <TableRow key={u._id}>
                          <TableCell className="w-[120px] font-medium">
                            <div className="truncate" title={u.username}>
                              {u.username}
                            </div>
                          </TableCell>
                          <TableCell className="w-[200px]">
                            <div className="truncate" title={u.email}>
                              {u.email}
                            </div>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <div className="truncate" title={u.phone || "N/A"}>
                              {u.phone || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="w-[80px]">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                u.role === "admin"
                                  ? "bg-blue-100 text-blue-800"
                                  : u.role === "guest"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <div className="flex justify-end space-x-1">
                              <Dialog
                                onOpenChange={(open) => {
                                  if (!open) setEditingUser(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingUser({ ...u })}
                                    className="h-8 w-8 p-0"
                                    title="Edit user"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Edit User: {editingUser?.username}
                                    </DialogTitle>
                                  </DialogHeader>
                                  {editingUser && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="username">
                                          Username
                                        </Label>
                                        <Input
                                          id="username"
                                          value={editingUser.username}
                                          disabled
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                          id="email"
                                          value={editingUser.email}
                                          onChange={(e) =>
                                            setEditingUser({
                                              ...editingUser,
                                              email: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                          id="phone"
                                          value={editingUser.phone || ""}
                                          onChange={(e) =>
                                            setEditingUser({
                                              ...editingUser,
                                              phone: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                          value={editingUser.role}
                                          onValueChange={(
                                            value: "user" | "admin",
                                          ) =>
                                            setEditingUser({
                                              ...editingUser,
                                              role: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="user">
                                              User
                                            </SelectItem>
                                            <SelectItem value="admin">
                                              Admin
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button
                                        onClick={handleUpdateUser}
                                        disabled={isSubmitting}
                                        className="w-full"
                                      >
                                        {isSubmitting
                                          ? "Saving..."
                                          : "Save Changes"}
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={
                                      u.username === currentUser?.username
                                    }
                                    className="h-8 w-8 p-0"
                                    title="Delete user"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure you want to delete this user?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the user account{" "}
                                      <strong>{u.username}</strong> and all
                                      associated data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteUser(u.username)
                                      }
                                    >
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
