"use client";

import { useEffect } from "react";
import { markUpdatesSeenAction } from "@/lib/actions/guest-push-actions";

export function MarkUpdatesSeen() {
  useEffect(() => {
    markUpdatesSeenAction();
  }, []);
  return null;
}
