'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OnboardingPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    if (!cleanDomain) {
      setError('Please enter a domain');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create site');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <Image
            src="/logo_bugable.png"
            alt="Bugable"
            width={48}
            height={48}
            className="h-12 w-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold mb-2">Add your site</h1>
          <p className="text-muted-foreground">
            Enter the domain you want to test with Bugable
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="mt-1.5"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Enter your domain without https:// or trailing slashes
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
