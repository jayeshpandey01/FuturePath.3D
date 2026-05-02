"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { useNavigate } from "react-router-dom";
import { getJobSuggestions } from "@/services/roadmapService";
import type { JobProfile } from "@/types/roadmap";
import { useAuthStore } from "@/store/useAuthStore";
import { Search, Sparkles } from "lucide-react";

export function SelectRole() {
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [customRole, setCustomRole] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const suggestions = await getJobSuggestions(user);
        setJobProfiles(suggestions);
      } catch (error) {
        console.error("Failed to fetch job suggestions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user]);

  const handleChoosePath = (role: string) => {
    navigate(`/career-roadmap?step=generate&role=${encodeURIComponent(role)}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          Choose Your Career Path
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Not sure where to start? Enter a role you're interested in, or explore our AI suggestions tailored to your profile.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-3xl mx-auto mb-20 relative px-4">
        <div className="absolute -inset-4 bg-primary/5 blur-2xl -z-10 rounded-full opacity-50"></div>
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl">
           <CardContent className="p-2 flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/40" />
                <Input 
                  placeholder="What is your dream job? (e.g. AI Engineer, Product Manager)" 
                  className="h-16 pl-16 pr-4 border-none text-xl focus-visible:ring-0 placeholder:text-muted-foreground/30 bg-transparent"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && customRole && handleChoosePath(customRole)}
                />
              </div>
              <Button 
                size="lg" 
                className="h-14 sm:h-16 px-10 w-full sm:w-auto text-xl font-black rounded-2xl bg-primary hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all"
                onClick={() => customRole && handleChoosePath(customRole)}
                disabled={!customRole}
              >
                Let's Go
              </Button>
           </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Type your desired role above or browse suggestions below
        </p>
      </div>

      <div className="flex items-center gap-4 mb-12">
         <div className="h-px bg-border flex-grow"></div>
         <span className="text-xs font-black uppercase tracking-[3px] text-muted-foreground bg-muted/50 px-4 py-1 rounded-full border border-border/50">
           Personalized Suggestions
         </span>
         <div className="h-px bg-border flex-grow"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-5/6 mt-2 rounded-full" />
                </CardContent>
                <div className="p-6 pt-0">
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </Card>
            ))
          : jobProfiles.map((profile) => (
              <Card key={profile.title} className="flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">{profile.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground leading-relaxed italic">"{profile.description}"</p>
                </CardContent>
                <div className="p-6 pt-2">
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl text-base font-semibold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={() => handleChoosePath(profile.title)}
                  >
                    Start this Path
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
      </div>
    </div>
  );
}
