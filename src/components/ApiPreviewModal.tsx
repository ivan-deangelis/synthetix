"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Copy,
  Download,
  Code2,
  Database,
  Globe,
  Lock,
  Play,
  RefreshCw,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ApiSet } from "@/app/actions/apiset-action";
import { DataGenerator } from "@/lib/data-generator";
import { Schema } from "@/types/schema.types";

interface ApiPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiSet: ApiSet;
}

interface MockDataGenerator {
  generateMockData: (schema: any, count?: number) => any;
}

// Updated mock data generator using DataGenerator
const mockDataGenerator: MockDataGenerator = {
  generateMockData: (schema: any, count: number = 1) => {
    if (!schema || typeof schema !== "object") {
      return { error: "Invalid schema" };
    }

    try {
      // Convert the schema to the expected format for DataGenerator
      const schemaData = schema.type
        ? schema
        : { type: "object", fields: schema };

      if (schemaData.type === "object" && schemaData.fields) {
        // Convert to Schema format expected by DataGenerator
        const toSchemaField = (field: any): any => {
          if (field?.type === "object" && field.fields) {
            const nestedFields: Record<string, any> = {};
            Object.keys(field.fields).forEach((k) => {
              nestedFields[k] = toSchemaField(field.fields[k]);
            });
            return {
              type: "object",
              fields: nestedFields,
              settings: field.settings,
            };
          }
          return {
            type: field?.type || "string",
            settings: {
              generationMethod: field?.settings?.generationMethod || "faker",
              fakerMethod: field?.settings?.fakerMethod,
              additionalOptions: field?.settings?.additionalOptions,
              aiPrompt: field?.settings?.aiPrompt,
              aiConstraints: field?.settings?.aiConstraints,
            },
          };
        };

        const convertedSchema: Schema = {};
        Object.keys(schemaData.fields).forEach((key) => {
          convertedSchema[key] = toSchemaField(schemaData.fields[key]);
        });

        const records = DataGenerator.generateMultipleRecords(
          convertedSchema,
          count
        );
        return count === 1 ? records[0] : records;
      }

      return { error: "Invalid schema structure" };
    } catch (error) {
      console.error("Error generating mock data:", error);
      return { error: "Failed to generate data" };
    }
  },
};

export function ApiPreviewModal({
  open,
  onOpenChange,
  apiSet,
}: ApiPreviewModalProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/20 text-success border-success/30";
      case "draft":
        return "bg-warning/20 text-warning border-warning/30";
      case "archived":
        return "bg-muted/20 text-muted-foreground border-muted/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const apiSchemaWithType =
    apiSet.schema &&
    typeof apiSet.schema === "object" &&
    !Array.isArray(apiSet.schema)
      ? Object.keys(apiSet.schema).reduce((acc: any, key: string) => {
          const schemaValue = (apiSet.schema as any)[key];
          acc[key] =
            typeof schemaValue === "object" && schemaValue?.type
              ? schemaValue.type
              : schemaValue;
          return acc;
        }, {})
      : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">{apiSet.name}</DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    apiSet.visibility === "public" &&
                      "border-primary/30 text-primary bg-primary/10"
                  )}
                >
                  {apiSet.visibility === "public" ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusColor(apiSet.status)}`}
                >
                  {apiSet.status}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="schema" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="schema"
                className="flex items-center space-x-2"
              >
                <Code2 className="h-4 w-4" />
                <span>Schema</span>
              </TabsTrigger>
              <TabsTrigger
                value="headers"
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>Headers</span>
              </TabsTrigger>
              <TabsTrigger
                value="endpoint"
                className="flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Endpoint</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="schema" className="h-full mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">API Schema</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    {apiSet.schema && apiSchemaWithType ? (
                      <pre className="bg-muted/50 rounded-lg p-4 text-sm">
                        <code>
                          {JSON.stringify(apiSchemaWithType, null, 2)}
                        </code>
                      </pre>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Code2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No schema defined</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headers" className="h-full mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">API Headers</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    {apiSet.headers &&
                    Array.isArray(apiSet.headers) &&
                    apiSet.headers.length > 0 ? (
                      <div className="space-y-3">
                        {apiSet.headers.map((header: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {header.key}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {header.value}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Header
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No headers configured</p>
                        <p className="text-sm">
                          Add headers in the API configuration
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoint" className="h-full mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">API Endpoint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Base URL</Label>
                    <div className="flex items-center space-x-2">
                      <code className="bg-muted/50 rounded px-2 py-1 text-sm flex-1">
                        {`${baseUrl}/api/v1/set/${apiSet.id}`}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${baseUrl}/api/v1/set/${apiSet.id}`
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Example Request
                    </Label>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">GET</Badge>
                        <span className="text-sm font-mono">
                          /api/v1/{apiSet.id}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-2">
                          Example <span className="font-mono">curl</span>{" "}
                          request:
                        </p>
                        <pre className="block bg-background/50 rounded px-2 py-2 overflow-x-auto text-xs font-mono">
                          {`curl -X GET "https://api.creator.com/v1/${apiSet.id}"`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
