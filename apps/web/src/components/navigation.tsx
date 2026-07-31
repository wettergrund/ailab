'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { authApi } from '@/lib/api';

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<{
    userId: number;
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const isAuthenticated = !!user && !loading;

  const links = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-bold text-lg">Convoy</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href={`/dashboard/${user?.role || 'client'}`}>
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="@user" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await authApi.logout();
                      setUser(null);
                      window.location.href = '/auth/login';
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block py-2 text-sm font-medium text-muted-foreground hover:text-primary',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                href={`/dashboard/${user?.role || 'client'}`}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={async () => {
                  await authApi.logout();
                  setUser(null);
                  window.location.href = '/auth/login';
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
