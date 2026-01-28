'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockSite } from '@/lib/mock-data';

// Mock user data
const mockUser = {
  id: 'user_1',
  displayName: 'Julius Olsson',
  email: 'julius@example.com',
};

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
  const [displayName, setDisplayName] = useState(mockUser.displayName);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
            <p className="text-sm py-2">{mockSite.domain}</p>
          </FieldRow>

          <FieldRow label="Created" description="When this site was added">
            <p className="text-sm text-muted-foreground py-2">
              {formatDate(mockSite.createdAt)}
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
              <Button variant="outline" size="default">
                Save
              </Button>
            </div>
          </FieldRow>

          <FieldRow label="Email" description="Your account email">
            <p className="text-sm text-muted-foreground py-2">{mockUser.email}</p>
          </FieldRow>

          <FieldRow label="Password">
            <Button variant="outline" size="default">
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
            <Button variant="destructive" size="default">
              Delete site
            </Button>
          </FieldRow>

          <FieldRow label="Sign out" description="Sign out of your account">
            <Button variant="outline" size="default">
              Sign out
            </Button>
          </FieldRow>

          <FieldRow
            label="Delete account"
            description="Permanently delete your account and all data"
          >
            <Button variant="destructive" size="default">
              Delete account
            </Button>
          </FieldRow>
        </Section>
      </div>
    </div>
  );
}
