"use client"


import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Progress } from "@/components/ui/shadcn/progress";
import { CheckCircle, Circle, ArrowRight, Play, Loader2 } from "lucide-react";
import type { FullRoadmapData, RoadmapNodeStatus } from "@/types/roadmap";
import { updateNodeProgress } from "@/services/roadmapService";
import { useState } from "react";

interface RoadmapVisualizationProps {
  roadmapData: FullRoadmapData;
}

export function RoadmapVisualization({ roadmapData }: RoadmapVisualizationProps) {
  const { roadmap, nodes } = roadmapData;
  const [localNodes, setLocalNodes] = useState(nodes);
  const [updating, setUpdating] = useState<string | null>(null);

  const completedNodes = localNodes.filter((node) => node.progress === "completed").length;
  const totalNodes = localNodes.length;
  const overallProgress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  const handleStatusUpdate = async (nodeId: string, currentStatus: RoadmapNodeStatus) => {
    let newStatus: RoadmapNodeStatus = "in_progress";
    if (currentStatus === "not_started") newStatus = "in_progress";
    else if (currentStatus === "in_progress") newStatus = "completed";
    else if (currentStatus === "completed") newStatus = "not_started";

    try {
      setUpdating(nodeId);
      await updateNodeProgress(roadmap.id, nodeId, newStatus);
      
      // Update local state
      setLocalNodes(prev => prev.map(n => n.id === nodeId ? { ...n, progress: newStatus } : n));
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <Card className="border-2 border-primary/10 overflow-hidden">
          <div className="h-2 bg-primary"></div>
          <CardHeader className="bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-primary text-white shadow-lg">
                  <Play className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">{roadmap.targetRole}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Generated on: {new Date(roadmap.generatedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-border/50">
                <div className="text-right pr-3 border-r border-border">
                  <div className="text-xl font-bold text-primary">
                    {completedNodes}/{totalNodes}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Completed</div>
                </div>
                <div className="pl-2">
                  <div className="text-xl font-bold text-primary">{overallProgress}%</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Progress</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-medium">Curriculum Progress</span>
                <span className="text-primary font-bold">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3 rounded-full" />
            </div>
          </CardHeader>
        </Card>

        {/* Learning Path Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gaps-6">
          <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border-none bg-white/80 backdrop-blur-xl">
            <CardHeader className="border-b bg-muted/5">
              <CardTitle>Learning Path Curriculum</CardTitle>
              <CardDescription>Follow this structured path to master {roadmap.targetRole}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative">
                {/* Vertical dash line */}
                <div className="absolute left-[27px] top-8 bottom-8 w-0.5 border-l-2 border-dashed border-muted-foreground/20 hidden sm:block"></div>
                
                {localNodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative sm:pl-12"
                  >
                    {/* Index Circle */}
                    <div className="absolute left-0 top-0 hidden sm:flex h-14 w-14 items-center justify-center bg-white border-2 border-muted-foreground/10 rounded-full z-10 shadow-sm">
                      <span className="text-lg font-bold text-muted-foreground/30">{index + 1}</span>
                    </div>

                    <div
                      className={`group p-6 rounded-2xl border-2 transition-all duration-300 ${
                        node.progress === "completed"
                          ? "bg-primary/[0.02] border-primary/20 shadow-sm"
                          : node.progress === "in_progress"
                            ? "bg-white border-primary shadow-[0_20px_50px_rgba(0,0,0,0.08)] ring-4 ring-primary/5"
                            : "bg-white border-border/50 hover:border-primary/30 hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={node.progress === "completed" ? "text-primary" : "text-muted-foreground/40"}>
                            {node.progress === "completed" ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Circle className="h-6 w-6" />
                            )}
                          </div>
                          <h4 className={`text-xl font-bold ${node.progress === "completed" ? "text-primary" : "text-foreground"}`}>
                            {node.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge 
                            variant={node.progress === "completed" ? "default" : "secondary"}
                            className={node.progress === "in_progress" ? "bg-orange-500 hover:bg-orange-600 border-none text-white" : ""}
                           >
                            {node.progress.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {node.details}
                      </p>

                      {/* Resources */}
                      {node.resources && node.resources.length > 0 && (
                        <div className="mb-6 p-4 bg-muted/30 rounded-xl">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <ArrowRight className="h-3 w-3" />
                            Top Resources
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {node.resources.map((res, i) => (
                              <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-white border border-border/50 rounded-lg text-sm font-medium text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                              >
                                {res.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-border/40">
                         <Button 
                            variant={node.progress === "completed" ? "outline" : "default"}
                            size="sm"
                            disabled={updating === node.id}
                            onClick={() => handleStatusUpdate(node.id, node.progress)}
                            className="rounded-xl px-6"
                          >
                            {updating === node.id ? (
                               <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {node.progress === "completed" ? "Mark Incomplete" : 
                             node.progress === "in_progress" ? "Mark Completed" : "Start Learning"}
                          </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
