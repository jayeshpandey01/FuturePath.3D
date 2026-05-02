"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { useRouter } from "next/navigation";

interface JobProfile {
  title: string;
  description: string;
}

export function SelectRole() {
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("/api/jobs/suggestions");
        if (res.ok) {
          const { suggestions } = await res.json();
          setJobProfiles(suggestions);
        }
      } catch (error) {
        console.error("Failed to fetch job suggestions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleChoosePath = (role: string) => {
    router.push(`/roadmap?step=generate&role=${encodeURIComponent(role)}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Choose Your Path</h1>
      <p className="text-lg text-muted-foreground text-center mb-12">
        Select a job profile to start your personalized learning journey.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
                <div className="p-6 pt-0">
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))
          : jobProfiles.map((profile) => (
              <Card key={profile.title} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{profile.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{profile.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleChoosePath(profile.title)}
                  >
                    Choose this Path
                  </Button>
                </div>
              </Card>
            ))}
      </div>
    </div>
  );
}
