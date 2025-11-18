"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Globe,
  Lock,
  MoreVertical,
  Play,
  Copy,
  ExternalLink,
  TrendingUp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiPreviewModal } from "./ApiPreviewModal";
import { ApiSet, deleteApiSet } from "@/app/actions/apiset-action";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ApiCard = ({
  id,
  name,
  description,
  visibility,
  status,
  schema,
  user_id,
  isCreator,
}: (ApiSet & { user_id?: string }) & { isCreator?: boolean }) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const statusColors = {
    active: "bg-success/20 text-success border-success/30",
    draft: "bg-warning/20 text-warning border-warning/30",
    archived: "bg-muted/20 text-muted-foreground border-muted/30",
    inactive: "bg-muted/20 text-muted-foreground border-muted/30",
    processing: "bg-orange-200 text-orange-800 border-orange-300",
  };

  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  return (
    <div className="card-interactive electric-border group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center neon-glow">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  visibility === "public" &&
                    "border-primary/30 text-primary bg-primary/10"
                )}
              >
                {visibility === "public" ? (
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
                className={`text-xs ${statusColors[status]}`}
              >
                {status}
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isCreator && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/edit/${id}`}>Edit API</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isCreator && (
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {isCreator && (
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete API set?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  API set.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    const res = await deleteApiSet(id);
                    if ((res as any)?.success) {
                      setDeleteOpen(false);
                      window.location.reload();
                    } else {
                      toast.error(res.error || "Error deleting API");
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {description}
      </p>

      {/* Removed unused placeholder stats */}

      <div className="flex items-center space-x-2">
        <Button asChild variant="default" size="sm" className="flex-1">
          <Link href={`/dashboard/view/${id}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View API
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={handlePreview}>
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview Modal */}
      <ApiPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        apiSet={{
          id,
          name,
          description,
          visibility,
          status,
          schema,
          headers: [],
        }}
      />
    </div>
  );
};

export default ApiCard;

export const ApiCardSkeleton = () => {
  return <Skeleton className="w-full h-[15rem]" />;
};
