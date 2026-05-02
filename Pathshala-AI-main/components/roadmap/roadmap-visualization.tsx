"use client"

import type React from "react";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, ArrowRight, Play } from "lucide-react";

interface RoadmapNode {
  id: string;
  title: string;
  details: string;
  resources: { title: string; url: string }[];
  position?: { x: number; y: number };
  progress: "not_started" | "in_progress" | "completed";
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

interface RoadmapVisualizationProps {
  roadmapData: FullRoadmapData;
}

export function RoadmapVisualization({ roadmapData }: RoadmapVisualizationProps) {
  const { roadmap, nodes, dependencies } = roadmapData;

  const completedNodes = nodes.filter((node) => node.progress === "completed").length;
  const totalNodes = nodes.length;
  const overallProgress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  // Placeholder for icon and color, as they are not in the new data structure
  // You might want to add these to your backend response or derive them.
  const Icon = CheckCircle; // Default icon
  const colorClass = "bg-blue-500"; // Default color

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div key={roadmap._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${colorClass} text-white`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{roadmap.targetRole}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Generated on: {new Date(roadmap.generatedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Button className="flex-shrink-0">
                <Play className="mr-2 h-4 w-4" />
                Continue Learning
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {completedNodes}/{totalNodes}
                </div>
                <div className="text-sm text-muted-foreground">Nodes Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </div>
              {/* Duration and Students are not available in the new data structure */}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">N/A</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-bold">N/A</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Learning Path Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Path</CardTitle>
            <CardDescription>Follow this structured path to master {roadmap.targetRole}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Connection line */}
                  {index < nodes.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                  )}

                  <div
                    className={`flex items-start space-x-4 p-4 rounded-lg border transition-all duration-200 ${
                      node.progress === "completed"
                        ? "bg-primary/5 border-primary/20"
                        : node.progress === "in_progress"
                          ? "bg-muted/50 border-primary/50 ring-1 ring-primary/20"
                          : "bg-card border-border hover:bg-muted/30 hover:-translate-y-1"
                    }`}
                  >
                    {/* Step indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {node.progress === "completed" ? (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      ) : node.progress === "in_progress" ? (
                        <div className="h-6 w-6 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{node.title}</h4>
                        <div className="flex items-center space-x-2">
                          {/* Duration is not available per node in the new data structure */}
                          {/* <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {node.duration}
                          </Badge> */}
                          {node.progress === "completed" && <Badge className="text-xs bg-primary/10 text-primary">Completed</Badge>}
                          {node.progress === "in_progress" && (
                            <Badge className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{node.details}</p>

                      {/* Action button */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Node {index + 1} of {totalNodes}
                        </div>
                        {node.progress === "completed" ? (
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Review
                          </Button>
                        ) : node.progress === "in_progress" ? (
                          <Button size="sm">
                            Continue
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            Locked
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
