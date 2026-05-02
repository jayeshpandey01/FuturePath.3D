"use client";

import { Button } from "@/components/ui/shadcn/button";
import { Route, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { generateRoadmap, saveRoadmap } from "@/services/roadmapService";
import { useAuthStore } from "@/store/useAuthStore";

export function GenerateRoadmap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get("role");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleGenerate = async () => {
    if (!jobTitle || !user) return;

    setIsLoading(true);
    try {
      // Step 1: Generate the roadmap data using Gemini
      const roadmapData = await generateRoadmap(jobTitle, user);
      
      // Step 2: Save the generated roadmap to Firestore
      await saveRoadmap(roadmapData);
      
      // Step 3: Redirect to the roadmap view
      navigate("/career-roadmap");
    } catch (error) {
      console.error("An error occurred during roadmap generation:", error);
      alert("Failed to generate roadmap. Please check your API key and try again.");
      setIsLoading(false);
    }
  };

  if (!jobTitle) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-4">No role selected.</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Please go back and choose a path first.
        </p>
        <Button onClick={() => navigate("/career-roadmap?step=select_role")}>
          Choose a Path
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
      <div className="mb-8 p-4 rounded-full bg-primary/10">
        <Route className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Role: {jobTitle}</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        We're ready to build your personalized learning path using AI. 
        This will include tailored modules, resources, and progress tracking.
      </p>
      <Button size="lg" onClick={handleGenerate} disabled={isLoading} className="min-w-[200px]">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Create My Roadmap
          </>
        )}
      </Button>
    </div>
  );
}

function Sparkles({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
