"use client"

import { useSearchParams, useNavigate } from "react-router-dom";
import { SelectRole } from "./select-role";
import { GenerateRoadmap } from "./generate-roadmap";
import { LoadingRoadmap } from "./loading-roadmap";
import { RoadmapVisualization } from "./roadmap-visualization";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { getUserRoadmaps } from "@/services/roadmapService";
import type { FullRoadmapData } from "@/types/roadmap";
import { useAuthStore } from "@/store/useAuthStore";

export function RoadmapDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const step = searchParams.get("step");
  const { user } = useAuthStore();

  const [roadmapData, setRoadmapData] = useState<FullRoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!step && user) {
      const fetchRoadmap = async () => {
        try {
          setLoading(true);
          const roadmaps = await getUserRoadmaps(user.uid);
          if (roadmaps && roadmaps.length > 0) {
            // Sort by generatedAt descending to get the latest
            const sorted = [...roadmaps].sort((a, b) => 
              new Date(b.roadmap.generatedAt).getTime() - new Date(a.roadmap.generatedAt).getTime()
            );
            setRoadmapData(sorted[0]);
          } else {
            setRoadmapData(null);
          }
        } catch (err) {
          console.error("Error fetching roadmap:", err);
          setError("An unexpected error occurred: " + (err as Error).message);
        } finally {
          setLoading(false);
        }
      }
      fetchRoadmap();
    } else if (!user) {
      setLoading(false);
    } else {
      // If we are in a step (generating, loading, etc.), we don't fetch the dashboard data yet
      setLoading(false);
    }
  }, [step, user]);

  const renderContent = () => {
    if (!user) {
      return (
        <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
          <p className="text-lg text-muted-foreground mb-8">
            You need to be logged in to view or generate your career roadmap.
          </p>
          <Button onClick={() => navigate("/admin/login")}>
            Log In / Sign Up
          </Button>
        </div>
      );
    }

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
              <Button onClick={() => navigate("/career-roadmap?step=select_role")}>
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
              <Button onClick={() => navigate("/career-roadmap?step=select_role")}>
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
