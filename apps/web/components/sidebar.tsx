'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, ListTodo, Settings, ChevronDown, LogOut, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { useSite, type Site } from '@/components/site-provider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Pages',
    href: '/dashboard',
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    label: 'All Jobs',
    href: '/dashboard/jobs',
    icon: <ListTodo className="h-4 w-4" />,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

function SiteSwitcher() {
  const router = useRouter();
  const { sites, activeSite, setActiveSite, isLoading } = useSite();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSiteSelect = (site: Site) => {
    setActiveSite(site);
    setIsOpen(false);
  };

  const handleAddSite = () => {
    setIsOpen(false);
    router.push('/onboarding');
  };

  if (isLoading || !activeSite) {
    return (
      <div className="p-4 border-b">
        <div className="px-3 py-2.5 rounded-md bg-secondary/50 border border-border/50">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-md bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors"
      >
        <div className="text-left">
          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Site</div>
          <div className="text-sm font-medium truncate">{activeSite.baseUrl}</div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-4 right-4 mt-1 bg-popover border rounded-md shadow-lg z-50">
          <div className="py-1">
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSiteSelect(site)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <span className="flex-1 text-left truncate">{site.baseUrl}</span>
                {site.id === activeSite.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t py-1">
            <button
              onClick={handleAddSite}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add new site
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() ?? '??';
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = getInitials(user?.user_metadata?.full_name, user?.email);

  return (
    <aside className="w-60 h-screen flex flex-col border-r bg-card">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo_bugable.png"
            alt="Bugable"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-base font-semibold tracking-tight">Bugable</span>
        </Link>
      </div>

      {/* Site selector */}
      <SiteSwitcher />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href === '/dashboard' && pathname === '/dashboard') ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
