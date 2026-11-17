import { Suspense } from "react";
import InvitationsHubClient from "./InvitationsHubClient";

export default function InvitationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0e0e11] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
        </div>
      }
    >
      <InvitationsHubClient />
    </Suspense>
  );
}

