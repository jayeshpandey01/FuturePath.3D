"use client";

import { Button } from "@/components/ui/button";
import { Route } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export function GenerateRoadmap() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get("role");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetRole: jobTitle }),
      });

      if (res.ok) {
        router.push("/roadmap?step=loading");
      } else {
        // Handle error (e.g., show a toast notification)
        console.error("Failed to generate roadmap");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setIsLoading(false);
    }
  };

  if (!jobTitle) {
    // Handle case where role is not in the URL
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-4">No role selected.</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Please go back and choose a path first.
        </p>
        <Button onClick={() => router.push("/roadmap?step=select_role")}>
          Choose a Path
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
      <h1 className="text-4xl font-bold mb-4">You've selected: {jobTitle}</h1>
      <p className="text-lg text-muted-foreground mb-8">
        We're ready to build your personalized path.
      </p>
      <Button size="lg" onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? (
          "Generating..."
        ) : (
          <>
            <Route className="mr-2 h-6 w-6 text-blue-500" />
            Generate Your Roadmap
          </>
        )}
      </Button>
    </div>
  );
}
