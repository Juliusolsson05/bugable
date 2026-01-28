'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface Site {
  id: string;
  name: string;
  baseUrl: string;
  createdAt: string;
}

interface SiteContextType {
  sites: Site[];
  activeSite: Site | null;
  isLoading: boolean;
  setActiveSite: (site: Site) => void;
  refreshSites: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const ACTIVE_SITE_KEY = 'bugable_active_site_id';

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSiteState] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch('/api/sites');
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites);
        return data.sites as Site[];
      }
    } catch (err) {
      console.error('Failed to fetch sites:', err);
    }
    return [];
  }, []);

  const refreshSites = useCallback(async () => {
    setIsLoading(true);
    const fetchedSites = await fetchSites();

    // Redirect to onboarding if no sites
    if (fetchedSites.length === 0) {
      router.push('/onboarding');
      return;
    }

    // Restore active site from localStorage or use first site
    const savedSiteId = localStorage.getItem(ACTIVE_SITE_KEY);
    const savedSite = fetchedSites.find((s: Site) => s.id === savedSiteId);

    if (savedSite) {
      setActiveSiteState(savedSite);
    } else if (fetchedSites.length > 0) {
      setActiveSiteState(fetchedSites[0]);
      localStorage.setItem(ACTIVE_SITE_KEY, fetchedSites[0].id);
    }

    setIsLoading(false);
  }, [fetchSites, router]);

  useEffect(() => {
    refreshSites();
  }, [refreshSites]);

  const setActiveSite = useCallback((site: Site) => {
    setActiveSiteState(site);
    localStorage.setItem(ACTIVE_SITE_KEY, site.id);
  }, []);

  return (
    <SiteContext.Provider
      value={{
        sites,
        activeSite,
        isLoading,
        setActiveSite,
        refreshSites,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
