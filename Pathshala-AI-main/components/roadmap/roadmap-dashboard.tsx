"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { SelectRole } from "./select-role";
import { GenerateRoadmap } from "./generate-roadmap";
import { LoadingRoadmap } from "./loading-roadmap";
import { RoadmapVisualization } from "./roadmap-visualization";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapNode {
  id: string;
  title: string;
  details: string;
  resources: { title: string; url: string }[];
  position?: { x: number; y: number };
  progress: string;
}

interface RoadmapDependency {
  source: string;
  target: string;
}

interface FullRoadmapData {
  roadmap: {
    _id: string;
    targetRole: string;
    generatedAt: string;
    version: number;
  };
  nodes: RoadmapNode[];
  dependencies: RoadmapDependency[];
}

export function RoadmapDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = searchParams.get("step");

  const [roadmapData, setRoadmapData] = useState<FullRoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!step) {
      const fetchRoadmap = async () => {
        try {
          setLoading(true);
          const res = await fetch("/api/roadmap");
          if (res.ok) {
            const data = await res.json();
            setRoadmapData(data);
          } else if (res.status === 404) {
            setRoadmapData(null); // No roadmap found
          } else {
            const errorText = await res.text();
            setError(`Failed to fetch roadmap data: ${res.status} - ${errorText}`);
          }
        } catch (err) {
          console.error("Error fetching roadmap:", err);
          setError("An unexpected error occurred: " + (err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchRoadmap();
    }
  }, [step]);

  const renderContent = () => {
    switch (step) {
      case "select_role":
        return <SelectRole />;
      case "generate":
        return <GenerateRoadmap />;
      case "loading":
        return <LoadingRoadmap />;
      default:
        if (loading) {
          return (
            <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-8" />
              <h1 className="text-3xl font-bold mb-4">Loading your roadmap...</h1>
              <p className="text-lg text-muted-foreground">
                Please wait a moment.
              </p>
            </div>
          );
        } else if (error) {
          return (
            <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold mb-4">Error: {error}</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Could not load your roadmap. Please try again.
              </p>
              <Button onClick={() => router.push("/roadmap?step=select_role")}>
                Generate New Roadmap
              </Button>
            </div>
          );
        } else if (!roadmapData) {
          return (
            <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold mb-4">No Roadmap Found</h1>
              <p className="text-lg text-muted-foreground mb-8">
                It looks like you haven't generated a roadmap yet.
              </p>
              <Button onClick={() => router.push("/roadmap?step=select_role")}>
                Generate Your First Roadmap
              </Button>
            </div>
          );
        } else {
          return <RoadmapVisualization roadmapData={roadmapData} />;
        }
    }
  };

  return <div>{renderContent()}</div>;
}
