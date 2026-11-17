import { Suspense } from "react";
import WorkspaceDashboardClient from "./WorkspaceDashboardClient";

export default function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0e0e11] flex flex-col items-center justify-center text-zinc-400 gap-3 font-sans">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
        </div>
      }
    >
      <WorkspaceDashboardClient params={params} />
    </Suspense>
  );
}
