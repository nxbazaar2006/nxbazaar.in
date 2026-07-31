"use client";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { LiquidGlassIconButton } from "@/components/ui/liquid-glass-icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateInitials } from "@/lib/generateInitials";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserAvatarProps = {
  user?: {
    name?: string | null;
    role?: string | null;
  };
};

export default function UserAvatar({ user = {} }: UserAvatarProps) {
  const { name } = user;
  const initials = generateInitials(name);
  const role = user?.role;
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><LiquidGlassIconButton variant="neutral" aria-label="Open profile menu">
          {initials}
        </LiquidGlassIconButton></DropdownMenuTrigger>
      <DropdownMenuContent className="liquid-card px-4 py-3 text-[#103c55]">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LiquidGlassButton
            asChild
            size="sm"
            variant="neutral"
            leftIcon={<LayoutDashboard />}
            fullWidth
          >
            <Link href="/dashboard">Dashboard</Link>
          </LiquidGlassButton>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LiquidGlassButton
            asChild
            size="sm"
            variant="cyan"
            leftIcon={<Settings />}
            fullWidth
          >
            <Link href="/dashboard/profile">Edit Profile</Link>
          </LiquidGlassButton>
        </DropdownMenuItem>
        {role === "USER" && (
          <DropdownMenuItem>
            <LiquidGlassButton
              asChild
              size="sm"
              variant="primary"
              leftIcon={<Settings />}
              fullWidth
            >
              <Link href="/dashboard/orders">My Orders</Link>
            </LiquidGlassButton>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <LiquidGlassButton
            onClick={handleLogout}
            size="sm"
            variant="danger"
            leftIcon={<LogOut />}
            fullWidth
          >
            Logout
          </LiquidGlassButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
