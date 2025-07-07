"use client";

import React, { useState, useEffect } from "react";
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
import { RefreshCw, AlertCircle, Edit, Trash2, Shield } from "lucide-react";

// Define the user type based on the expected API response
interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "guest";
}

export default function AdminPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View, edit, and delete users in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || "N/A"}</TableCell>
                    <TableCell>
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
                    <TableCell className="flex justify-end space-x-2">
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
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
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
                                <Label htmlFor="username">Username</Label>
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
                                  onValueChange={(value: "user" | "admin") =>
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
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={handleUpdateUser}
                                disabled={isSubmitting}
                                className="w-full"
                              >
                                {isSubmitting ? "Saving..." : "Save Changes"}
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
                            disabled={u.username === currentUser?.username}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
                              <strong>{u.username}</strong> and all associated
                              data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(u.username)}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
