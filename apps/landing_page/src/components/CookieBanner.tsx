"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "bugable_cookie_consent_v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const v = window.localStorage.getItem(KEY);
    if (!v) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] w-[92vw] max-w-3xl">
      <div className="rounded-xl border border-border bg-background shadow-lg p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="flex-1">
          <p className="text-sm">
            We use cookies for basic site functionality and to understand traffic.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Read our{" "}
            <a className="underline text-foreground" href="/cookies">
              Cookies Policy
            </a>
            .
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              window.localStorage.setItem(KEY, "rejected");
              setShow(false);
            }}
          >
            Reject
          </Button>
          <Button
            onClick={() => {
              window.localStorage.setItem(KEY, "accepted");
              setShow(false);
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
