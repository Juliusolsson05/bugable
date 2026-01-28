'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-provider';
import { useSite } from '@/components/site-provider';
import { getCurrentUser, updateCurrentUser, deleteCurrentUser, deleteSite } from '@/lib/api';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b py-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  children,
  description,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
      <div>
        <Label className="text-sm">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="max-w-sm">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user: authUser, signOut } = useAuth();
  const { activeSite, refreshSites } = useSite();

  const [displayName, setDisplayName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingSite, setIsDeletingSite] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const { user } = await getCurrentUser();
        setDisplayName(user.fullName || '');
        setOriginalName(user.fullName || '');
        setEmail(user.email || '');
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSaveName = async () => {
    if (displayName === originalName) return;

    setIsSaving(true);
    try {
      const { user } = await updateCurrentUser({ fullName: displayName });
      setOriginalName(user.fullName || '');
    } catch (err) {
      console.error('Failed to save name:', err);
      alert('Failed to save name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSite = async () => {
    if (!activeSite) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${activeSite.name}"? This will permanently delete all pages, jobs, and findings for this site.`
    );

    if (!confirmed) return;

    setIsDeletingSite(true);
    try {
      await deleteSite(activeSite.id);
      await refreshSites(); // This will redirect to onboarding if no sites left
    } catch (err) {
      console.error('Failed to delete site:', err);
      alert('Failed to delete site. Please try again.');
    } finally {
      setIsDeletingSite(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This action is IRREVERSIBLE. Type "delete" in the next prompt to confirm.'
    );

    if (!doubleConfirm) return;

    const typed = window.prompt('Type "delete" to confirm account deletion:');
    if (typed !== 'delete') {
      alert('Account deletion cancelled.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCurrentUser();
      await signOut();
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasNameChanged = displayName !== originalName;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
          <div className="flex items-center h-14 px-6">
            <h1 className="text-base font-semibold">Settings</h1>
          </div>
        </header>
        <div className="px-6 py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center h-14 px-6">
          <h1 className="text-base font-semibold">Settings</h1>
        </div>
      </header>

      <div className="px-6">
        {/* Site Section */}
        <Section title="Site" description="Your site information">
          <FieldRow label="Site URL">
            <p className="text-sm py-2">{activeSite?.baseUrl || '-'}</p>
          </FieldRow>

          <FieldRow label="Site name">
            <p className="text-sm py-2">{activeSite?.name || '-'}</p>
          </FieldRow>

          <FieldRow label="Created" description="When this site was added">
            <p className="text-sm text-muted-foreground py-2">
              {activeSite ? formatDate(activeSite.createdAt) : '-'}
            </p>
          </FieldRow>
        </Section>

        {/* Account Section */}
        <Section title="Account" description="Your personal account settings">
          <FieldRow label="Display name">
            <div className="flex gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
              <Button
                variant="outline"
                size="default"
                onClick={handleSaveName}
                disabled={!hasNameChanged || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </FieldRow>

          <FieldRow label="Email" description="Your account email">
            <p className="text-sm text-muted-foreground py-2">{email}</p>
          </FieldRow>

          <FieldRow label="Password">
            <Button
              variant="outline"
              size="default"
              onClick={() => alert('Password change is handled through Supabase auth. Coming soon!')}
            >
              Change password
            </Button>
          </FieldRow>
        </Section>

        {/* Danger Zone */}
        <Section title="Danger Zone" description="Irreversible actions">
          <FieldRow
            label="Delete site"
            description="Remove this site and all its data"
          >
            <Button
              variant="destructive"
              size="default"
              onClick={handleDeleteSite}
              disabled={isDeletingSite || !activeSite}
            >
              {isDeletingSite ? 'Deleting...' : 'Delete site'}
            </Button>
          </FieldRow>

          <FieldRow label="Sign out" description="Sign out of your account">
            <Button variant="outline" size="default" onClick={signOut}>
              Sign out
            </Button>
          </FieldRow>

          <FieldRow
            label="Delete account"
            description="Permanently delete your account and all data"
          >
            <Button
              variant="destructive"
              size="default"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete account'}
            </Button>
          </FieldRow>
        </Section>
      </div>
    </div>
  );
}
