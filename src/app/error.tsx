"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-zinc-50 font-sans">
      <div className="flex flex-col items-center max-w-md text-center space-y-6 p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="p-4 bg-red-500/10 rounded-full">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Something went wrong!</h2>
          <p className="text-zinc-400 text-sm">
            A client-side exception has occurred. The application state might be corrupted.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-zinc-950 rounded-lg w-full overflow-x-auto text-left border border-zinc-800">
            <code className="text-xs text-red-400 font-mono break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex w-full gap-3">
          <Button 
            onClick={() => window.location.reload()}
            variant="default" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reload App
          </Button>
          <Button 
            onClick={() => reset()}
            variant="outline" 
            className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300"
          >
            Try to Recover
          </Button>
        </div>
      </div>
    </div>
  );
}
