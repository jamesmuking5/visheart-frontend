"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  ShowForAdmin,
  ShowForUser,
  ShowForGuest,
} from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LogOut,
  Settings,
  Shield,
  User,
  UserCheck,
  AlertCircleIcon,
} from "lucide-react";

const RoleBadge = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roleConfig = {
    admin: {
      icon: <Shield className="h-4 w-4 text-blue-600" />,
      colors: "bg-blue-100 text-blue-800 border-blue-200",
    },
    user: {
      icon: <UserCheck className="h-4 w-4 text-green-600" />,
      colors: "bg-green-100 text-green-800 border-green-200",
    },
    guest: {
      icon: <User className="h-4 w-4 text-gray-500" />,
      colors: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

  const config =
    roleConfig[user.role as keyof typeof roleConfig] || roleConfig.guest;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${config.colors}`}
    >
      {config.icon}
      <span className="ml-1 capitalize">{user.role}</span>
    </span>
  );
};

export const AuthenticatedUserView = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="w-[400px] pb-5 select-none">
      <CardHeader className="pb-4 text-center">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-left text-lg">Welcome back!</CardTitle>
            <p className="text-muted-foreground text-left text-sm">
              {user.username}
            </p>
          </div>
          <RoleBadge />
        </div>
      </CardHeader>

      <CardContent className="grid gap-3">
        <ShowForGuest fallback={null}>
          <Alert className="border-orange-200 bg-orange-50 py-2">
            <AlertCircleIcon className="h-4 w-4 text-black" />
            <AlertDescription className="text-orange-800">
              You're in guest mode. Your work won't be saved.
              <Link href="/register" className="ml-1 font-medium underline">
                Create account
              </Link>
            </AlertDescription>
          </Alert>
        </ShowForGuest>

        <ShowForAdmin fallback={null}>
          <Alert className="border-blue-200 bg-blue-50 py-2">
            <AlertDescription className="flex items-center justify-center text-blue-800">
              <Shield className="mr-2 h-4 w-4 text-black" />
              Admin privileges active
            </AlertDescription>
          </Alert>
        </ShowForAdmin>

        <div className="grid gap-2">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              My Dashboard
            </Button>
          </Link>
          <ShowForAdmin fallback={null}>
            <Link href="/admin">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          </ShowForAdmin>
          <ShowForUser fallback={null}>
            <Link href="/profile">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Button>
            </Link>
          </ShowForUser>
          <ShowForGuest>
            <Link href="/register">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <UserCheck className="mr-2 h-4 w-4" />
                Upgrade Account
              </Button>
            </Link>
          </ShowForGuest>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          variant="outline"
          className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </CardFooter>
    </div>
  );
};
