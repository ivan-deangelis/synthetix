"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Database,
  Globe,
  Lock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Calendar,
  User,
  Settings,
  Eye,
  Play,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Database as DatabaseType } from "@/types/database.types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Schema } from "@/types/schema.types";
import { cloneApiSet } from "@/app/actions/apiset-action";
import { useHeaderTitle } from "@/components/Dashboard/header-title-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ViewPageClientProps {
  apiSet: DatabaseType["public"]["Tables"]["api_sets"]["Row"];
  isOwner?: boolean;
}

// Updated mock data generator using DataGenerator
const mockDataGenerator = {
  generateMockData: async (schema: any, count: number = 1) => {
    if (!schema || typeof schema !== "object") {
      return { error: "Invalid schema" };
    }

    try {
      // Dynamically import DataGenerator only when needed (client-side)
      const { DataGenerator } = await import("@/lib/data-generator");

      // Convert the schema to the expected format for DataGenerator
      const schemaData = schema.type
        ? schema
        : { type: "object", fields: schema };

      if (schemaData.type === "object" && schemaData.fields) {
        // Convert to Schema format expected by DataGenerator
        const convertedSchema: Schema = {};
        Object.keys(schemaData.fields).forEach((key) => {
          const field = schemaData.fields[key];
          convertedSchema[key] = {
            type: field.type || "string",
            settings: {
              generationMethod: field.settings?.generationMethod || "faker",
              fakerMethod: field.settings?.fakerMethod,
              additionalOptions: field.settings?.additionalOptions,
              aiPrompt: field.settings?.aiPrompt,
              aiConstraints: field.settings?.aiConstraints,
            },
          };
        });

        const records = DataGenerator.generateMultipleRecords(
          convertedSchema,
          undefined,
          count
        );
        return count === 1 && Array.isArray(records) ? records[0] : records;
      }

      return { error: "Invalid schema structure" };
    } catch (error) {
      console.error("Error generating mock data:", error);
      return { error: "Failed to generate data" };
    }
  },
};

const ViewPageClient = ({ apiSet, isOwner = false }: ViewPageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTitleOverride } = useHeaderTitle();
  const [mockData, setMockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recordCount, setRecordCount] = useState(1);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTitleOverride(apiSet.name || null);
    return () => setTitleOverride(null);
  }, [apiSet.name, setTitleOverride]);

  useEffect(() => {
    const c = Number(searchParams.get("count"));
    if (!Number.isNaN(c) && c > 0) {
      setRecordCount(Math.min(20, c));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      const data = await mockDataGenerator.generateMockData(
        apiSet.schema,
        recordCount
      );
      setMockData(data);
    } catch (error) {
      console.error("Error generating preview:", error);
      setMockData({ error: "Failed to generate preview" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (mockData) {
      navigator.clipboard.writeText(JSON.stringify(mockData, null, 2));
    }
  };

  const handleDownloadJson = () => {
    if (mockData) {
      const blob = new Blob([JSON.stringify(mockData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${apiSet.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-preview.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(apiSet.schema, null, 2));
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([JSON.stringify(apiSet.schema, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${apiSet.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const toggleFieldExpansion = (fieldName: string) => {
    const newExpandedFields = new Set(expandedFields);
    if (newExpandedFields.has(fieldName)) {
      newExpandedFields.delete(fieldName);
    } else {
      newExpandedFields.add(fieldName);
    }
    setExpandedFields(newExpandedFields);
  };

  const renderFieldType = (field: any, fieldName: string) => {
    const fieldType =
      typeof field === "object" && field?.type ? field.type : "object";

    if (
      fieldType === "object" &&
      field?.fields &&
      Object.keys(field.fields).length > 0
    ) {
      const isExpanded = expandedFields.has(fieldName);
      const innerFieldsCount = Object.keys(field.fields).length;

      return (
        <div key={fieldName} className="w-full">
          <button
            onClick={() => toggleFieldExpansion(fieldName)}
            className="flex items-center justify-between w-full p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{fieldName}</span>
              <Badge variant="secondary" className="text-xs">
                object ({innerFieldsCount} fields)
              </Badge>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {isExpanded && (
            <div className="mt-2 ml-4 space-y-2 border-l-2 border-muted/30 pl-4">
              {Object.keys(field.fields).map((innerFieldName) => {
                const innerField = field.fields[innerFieldName];
                const innerFieldType =
                  typeof innerField === "object" && innerField?.type
                    ? innerField.type
                    : "object";
                return (
                  <div
                    key={innerFieldName}
                    className="flex items-center justify-between p-2 bg-muted/20 rounded"
                  >
                    <span className="font-medium text-sm text-muted-foreground">
                      {innerFieldName}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {innerFieldType}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={fieldName}
        className="flex items-center justify-between p-2 bg-muted/30 rounded"
      >
        <span className="font-medium text-sm">{fieldName}</span>
        <Badge variant="secondary" className="text-xs">
          {fieldType}
        </Badge>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{apiSet.name}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm",
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
                  className={`text-sm ${getStatusColor(apiSet.status)}`}
                >
                  {apiSet.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isOwner ? (
              <Button asChild variant="outline">
                <Link href={`/dashboard/edit/${apiSet.id}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit API
                </Link>
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Use as template</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create a private copy?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create a private copy in your workspace. The
                      original will not be modified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        const res = await cloneApiSet(apiSet.id);
                        if ((res as any)?.success && (res as any)?.data) {
                          const newId = (res as any).data as string;
                          router.push(`/dashboard/edit/${newId}`);
                        }
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {apiSet.description && (
          <p className="text-muted-foreground text-lg max-w-3xl">
            {apiSet.description}
          </p>
        )}
      </div>

      {/* API Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Schema Fields
                </p>
                <p className="text-2xl font-bold">
                  {apiSet.schema && typeof apiSet.schema === "object"
                    ? Object.keys(apiSet.schema).length
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Headers
                </p>
                <p className="text-2xl font-bold">
                  {apiSet.headers && Array.isArray(apiSet.headers)
                    ? apiSet.headers.length
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Database className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created
                </p>
                <p className="text-2xl font-bold">
                  {apiSet.created_at
                    ? new Date(apiSet.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  API ID
                </p>
                <p className="text-sm font-mono text-muted-foreground truncate max-w-[120px]">
                  {apiSet.id}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center space-x-2">
            <Code2 className="h-4 w-4" />
            <span>Schema</span>
          </TabsTrigger>
          <TabsTrigger value="endpoint" className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4" />
            <span>Endpoint</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>API Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm">{apiSet.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm">
                    {apiSet.description || "No description provided"}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2 space-x-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge
                    variant="outline"
                    className={getStatusColor(apiSet.status)}
                  >
                    {apiSet.status}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2 space-x-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Visibility
                  </label>
                  <Badge
                    variant="outline"
                    className={cn(
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
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-sm">
                    {apiSet.created_at
                      ? new Date(apiSet.created_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Schema Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code2 className="h-5 w-5" />
                  <span>Schema Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {apiSet.schema && typeof apiSet.schema === "object" ? (
                  <div className="space-y-3">
                    {Object.keys(apiSet.schema).map((fieldName) => {
                      const field = (apiSet.schema as any)[fieldName];
                      return renderFieldType(field, fieldName);
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No schema defined
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Code2 className="h-5 w-5" />
                  <span>API Schema (JSON)</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySchema}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSchema}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                {apiSet.schema ? (
                  <pre className="bg-muted/50 rounded-lg p-4 text-sm overflow-auto">
                    <code>{JSON.stringify(apiSet.schema, null, 2)}</code>
                  </pre>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Code2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No schema defined</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoint" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>API Endpoint Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base URL</label>
                <div className="flex items-center space-x-2">
                  <code className="bg-muted/50 rounded px-3 py-2 text-sm flex-1 font-mono">
                    {recordCount > 1
                      ? `http://localhost:3000/api/v1/set/${apiSet.id}?count=${recordCount}`
                      : `http://localhost:3000/api/v1/set/${apiSet.id}`}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        recordCount > 1
                          ? `http://localhost:3000/api/v1/set/${apiSet.id}?count=${recordCount}`
                          : `http://localhost:3000/api/v1/set/${apiSet.id}`
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Query Parameters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Query Parameters</label>
                <div className="flex items-center gap-3">
                  <Label htmlFor="count" className="text-sm">
                    count
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={20}
                    value={recordCount}
                    onChange={(e) =>
                      setRecordCount(
                        Math.min(20, Math.max(1, Number(e.target.value) || 1))
                      )
                    }
                    className="w-24"
                  />
                  <span className="text-xs text-muted-foreground">
                    Use <code>?count=</code> to return multiple records (max 20)
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Example Request</label>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">GET</Badge>
                    <span className="text-sm font-mono">
                      /api/v1/set/{apiSet.id}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">
                      Example <span className="font-mono">curl</span> request:
                    </p>
                    <pre className="block bg-background/50 rounded px-2 py-2 overflow-x-auto text-xs font-mono">
                      {`curl -X GET "${
                        recordCount > 1
                          ? `http://localhost:3000/api/v1/set/${apiSet.id}?count=${recordCount}`
                          : `http://localhost:3000/api/v1/set/${apiSet.id}`
                      }"`}
                    </pre>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Response Format</label>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    The API returns data in JSON format based on your schema
                    definition.
                  </p>
                  <div className="text-sm">
                    <p>
                      <strong>Content-Type:</strong> application/json
                    </p>
                    <p>
                      <strong>Status Codes:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>
                        <code className="bg-background/50 rounded px-1">
                          200
                        </code>{" "}
                        - Success
                      </li>
                      <li>
                        <code className="bg-background/50 rounded px-1">
                          400
                        </code>{" "}
                        - Bad Request
                      </li>
                      <li>
                        <code className="bg-background/50 rounded px-1">
                          401
                        </code>{" "}
                        - Unauthorized
                      </li>
                      <li>
                        <code className="bg-background/50 rounded px-1">
                          404
                        </code>{" "}
                        - Not Found
                      </li>
                      <li>
                        <code className="bg-background/50 rounded px-1">
                          500
                        </code>{" "}
                        - Server Error
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewPageClient;
