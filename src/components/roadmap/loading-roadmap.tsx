import { Loader2 } from "lucide-react";

export function LoadingRoadmap() {

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
      <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-primary/20 animate-pulse"></div>
          <Loader2 className="h-12 w-12 animate-spin text-primary absolute top-6 left-6" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Generating your personalized roadmap...
          </h1>
          <p className="text-xl text-muted-foreground">
            Our AI is analyzing the role and your profile to craft the perfect learning path.
            This may take 10-15 seconds. Great things are worth waiting for!
          </p>
        </div>
        <div className="w-full mt-8 flex flex-col gap-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 animate-[loading_5s_ease-in-out_infinite]"></div>
            </div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Gathering resources...</span>
                <span>Structuring path...</span>
            </div>
        </div>
      </div>
    </div>
  );
}
