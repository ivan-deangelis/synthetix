"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Header = {
    key: string;
    value: string;
};

// List of valid HTTP headers
const VALID_HTTP_HEADERS = [
    // Standard HTTP headers
    "Accept",
    "Accept-Charset",
    "Accept-Encoding",
    "Accept-Language",
    "Accept-Ranges",
    "Access-Control-Allow-Credentials",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods",
    "Access-Control-Allow-Origin",
    "Access-Control-Expose-Headers",
    "Access-Control-Max-Age",
    "Access-Control-Request-Headers",
    "Access-Control-Request-Method",
    "Age",
    "Allow",
    "Authorization",
    "Cache-Control",
    "Connection",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Language",
    "Content-Length",
    "Content-Location",
    "Content-MD5",
    "Content-Range",
    "Content-Security-Policy",
    "Content-Type",
    "Cookie",
    "Date",
    "ETag",
    "Expect",
    "Expires",
    "From",
    "Host",
    "If-Match",
    "If-Modified-Since",
    "If-None-Match",
    "If-Range",
    "If-Unmodified-Since",
    "Last-Modified",
    "Link",
    "Location",
    "Max-Forwards",
    "Origin",
    "Pragma",
    "Proxy-Authenticate",
    "Proxy-Authorization",
    "Range",
    "Referer",
    "Retry-After",
    "Server",
    "Set-Cookie",
    "Strict-Transport-Security",
    "TE",
    "Trailer",
    "Transfer-Encoding",
    "Upgrade",
    "User-Agent",
    "Vary",
    "Via",
    "Warning",
    "WWW-Authenticate",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "X-Requested-With",
    "X-XSS-Protection",
    // Custom headers (common patterns)
    "X-API-Key",
    "X-Auth-Token",
    "X-CSRF-Token",
    "X-Forwarded-For",
    "X-Forwarded-Host",
    "X-Forwarded-Proto",
    "X-Real-IP",
    "X-Request-ID",
    "X-Response-Time",
    "X-Rate-Limit-Limit",
    "X-Rate-Limit-Remaining",
    "X-Rate-Limit-Reset",
    "X-Total-Count",
    "X-Page",
    "X-Per-Page",
    "X-Total-Pages",
    "X-Next-Page",
    "X-Prev-Page",
    "X-First-Page",
    "X-Last-Page",
    "X-Client-Version",
    "X-Server-Version",
    "X-Environment",
    "X-Correlation-ID",
    "X-Trace-ID",
    "X-Span-ID",
    "X-Parent-ID",
    "X-Session-ID",
    "X-User-ID",
    "X-Organization-ID",
    "X-Tenant-ID",
    "X-Feature-Flag",
    "X-Debug",
    "X-Log-Level",
    "X-Timezone",
    "X-Locale",
    "X-Currency",
    "X-Device-Type",
    "X-Platform",
    "X-App-Version",
    "X-Build-Number",
    "X-Deployment-ID",
    "X-Region",
    "X-Zone",
    "X-Instance-ID",
    "X-Node-ID",
    "X-Pod-Name",
    "X-Namespace",
    "X-Cluster",
    "X-Service-Name",
    "X-Service-Version",
    "X-Endpoint",
    "X-Method",
    "X-Status-Code",
    "X-Error-Code",
    "X-Error-Message",
    "X-Warning",
    "X-Info",
    "X-Success",
    "X-Processing-Time",
    "X-Cache-Hit",
    "X-Cache-Miss",
    "X-Cache-Status",
    "X-Cache-Control",
    "X-Expires",
    "X-Last-Modified",
    "X-ETag",
    "X-Content-Length",
    "X-Content-Type",
    "X-Content-Encoding",
    "X-Content-Language",
    "X-Content-Disposition",
    "X-Content-Range",
    "X-Content-MD5",
    "X-Content-Location",
    "X-Content-Security-Policy",
    "X-Content-Security-Policy-Report-Only",
    "X-Content-Security-Policy-Report-URI",
    "X-Content-Security-Policy-Sandbox",
    "X-Content-Security-Policy-Trusted-Types",
    "X-Content-Security-Policy-Require-Trusted-Types-For",
    "X-Content-Security-Policy-Worker-Src",
    "X-Content-Security-Policy-Manifest-Src",
    "X-Content-Security-Policy-Prefetch-Src",
    "X-Content-Security-Policy-Navigate-To",
    "X-Content-Security-Policy-Form-Action",
    "X-Content-Security-Policy-Base-URI",
    "X-Content-Security-Policy-Object-Src",
    "X-Content-Security-Policy-Media-Src",
    "X-Content-Security-Policy-Img-Src",
    "X-Content-Security-Policy-Script-Src",
    "X-Content-Security-Policy-Style-Src",
    "X-Content-Security-Policy-Font-Src",
    "X-Content-Security-Policy-Connect-Src",
    "X-Content-Security-Policy-Frame-Src",
    "X-Content-Security-Policy-Frame-Ancestors",
    "X-Content-Security-Policy-Child-Src",
    "X-Content-Security-Policy-Default-Src",
    "X-Content-Security-Policy-Report-Only",
    "X-Content-Security-Policy-Report-URI",
    "X-Content-Security-Policy-Sandbox",
    "X-Content-Security-Policy-Trusted-Types",
    "X-Content-Security-Policy-Require-Trusted-Types-For",
    "X-Content-Security-Policy-Worker-Src",
    "X-Content-Security-Policy-Manifest-Src",
    "X-Content-Security-Policy-Prefetch-Src",
    "X-Content-Security-Policy-Navigate-To",
    "X-Content-Security-Policy-Form-Action",
    "X-Content-Security-Policy-Base-URI",
    "X-Content-Security-Policy-Object-Src",
    "X-Content-Security-Policy-Media-Src",
    "X-Content-Security-Policy-Img-Src",
    "X-Content-Security-Policy-Script-Src",
    "X-Content-Security-Policy-Style-Src",
    "X-Content-Security-Policy-Font-Src",
    "X-Content-Security-Policy-Connect-Src",
    "X-Content-Security-Policy-Frame-Src",
    "X-Content-Security-Policy-Frame-Ancestors",
    "X-Content-Security-Policy-Child-Src",
    "X-Content-Security-Policy-Default-Src",
];

interface HeadersBuilderProps {
    initialHeaders?: Header[];
    onHeadersChange: (headers: Header[]) => void;
    onAddHeader?: () => void;
    onUpdateHeader?: (
        index: number,
        field: "key" | "value",
        value: string
    ) => void;
    onRemoveHeader?: (index: number) => void;
}

export function HeadersBuilder({
    initialHeaders = [],
    onHeadersChange,
    onAddHeader,
    onUpdateHeader,
    onRemoveHeader,
}: HeadersBuilderProps) {
    const [headers, setHeaders] = useState<Header[]>(initialHeaders);

    // Use props headers when action handlers are provided (reducer mode)
    const displayHeaders =
        onAddHeader && onUpdateHeader && onRemoveHeader
            ? initialHeaders
            : headers;
    const [validationErrors, setValidationErrors] = useState<{
        [key: number]: string;
    }>({});
    const lastValidHeadersRef = useRef<Header[]>([]);
    const initialHeadersRef = useRef<Header[]>(initialHeaders);

    // Update local state when initialHeaders actually changes
    useEffect(() => {
        initialHeadersRef.current = initialHeaders;
        setHeaders(initialHeaders);
        setValidationErrors({});
    }, [initialHeaders]);

    const validateHeaderKey = (key: string): string | null => {
        const trimmedKey = key.trim();

        if (!trimmedKey) {
            return "Header key is required";
        }

        // Check if it's a valid HTTP header format
        const headerPattern = /^[A-Za-z0-9\-_]+$/;
        if (!headerPattern.test(trimmedKey)) {
            return "Header key can only contain letters, numbers, hyphens, and underscores";
        }

        // Check if it's a known valid header or follows custom header pattern
        const isValidKnownHeader = VALID_HTTP_HEADERS.some(
            (validHeader) =>
                validHeader.toLowerCase() === trimmedKey.toLowerCase()
        );

        const isCustomHeader =
            trimmedKey.startsWith("X-") || trimmedKey.startsWith("x-");

        if (!isValidKnownHeader && !isCustomHeader) {
            return "Unknown header. Use standard HTTP headers or custom headers starting with 'X-'";
        }

        return null;
    };

    const validateHeaderValue = (value: string): string | null => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            return "Header value is required";
        }

        // Check for common invalid characters in header values
        const invalidChars = /[^\x20-\x7E]/;
        if (invalidChars.test(trimmedValue)) {
            return "Header value contains invalid characters";
        }

        return null;
    };

    const validateHeader = (header: Header, index: number): string | null => {
        // Only validate if both key and value have content
        if (!header.key.trim() || !header.value.trim()) {
            return null;
        }

        const keyError = validateHeaderKey(header.key);
        if (keyError) return keyError;

        const valueError = validateHeaderValue(header.value);
        if (valueError) return valueError;

        return null;
    };

    // Debounced validation function
    const debouncedValidate = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return (header: Header, index: number) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    const error = validateHeader(header, index);
                    setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        if (error) {
                            newErrors[index] = error;
                        } else {
                            delete newErrors[index];
                        }
                        return newErrors;
                    });
                }, 300); // 300ms delay
            };
        })(),
        []
    );

    const addHeader = () => {
        if (onAddHeader) {
            onAddHeader();
        } else {
            const newHeaders = [...headers, { key: "", value: "" }];
            setHeaders(newHeaders);
        }
    };

    const removeHeader = (index: number) => {
        if (onRemoveHeader) {
            onRemoveHeader(index);
        } else {
            const newHeaders = headers.filter((_, i) => i !== index);
            setHeaders(newHeaders);
        }

        // Clear validation error for removed header
        const newErrors = { ...validationErrors };
        delete newErrors[index];
        setValidationErrors(newErrors);
    };

    const updateHeader = (
        index: number,
        field: "key" | "value",
        value: string
    ) => {
        if (onUpdateHeader) {
            onUpdateHeader(index, field, value);
        } else {
            const newHeaders = [...headers];
            newHeaders[index] = { ...newHeaders[index], [field]: value };
            setHeaders(newHeaders);
        }

        // Immediate validation for empty fields
        if (!value.trim()) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[index];
                return newErrors;
            });
        } else {
            // Use debounced validation for non-empty fields
            debouncedValidate(
                {
                    key: field === "key" ? value : headers[index]?.key || "",
                    value:
                        field === "value" ? value : headers[index]?.value || "",
                },
                index
            );
        }
    };

    const isValidHeader = (header: Header, index: number) => {
        const hasKey = header.key.trim() !== "";
        const hasValue = header.value.trim() !== "";
        const hasError = validationErrors[index];

        return hasKey && hasValue && !hasError;
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">API Headers</h2>
            <div className="space-y-4">
                <div className="space-y-3">
                    {displayHeaders.map((header, index) => {
                        const hasError = validationErrors[index];
                        const isValid = isValidHeader(header, index);
                        const isComplete =
                            header.key.trim() !== "" &&
                            header.value.trim() !== "";

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "rounded-xl border bg-white dark:bg-zinc-900 p-4 shadow-sm transition-all border-zinc-200 dark:border-zinc-800 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <Label
                                            htmlFor={`header-key-${index}`}
                                            className="text-sm font-medium"
                                        >
                                            Header Key
                                        </Label>
                                        <Input
                                            id={`header-key-${index}`}
                                            placeholder="e.g., Content-Type, Authorization"
                                            value={header.key}
                                            onChange={(e) =>
                                                updateHeader(
                                                    index,
                                                    "key",
                                                    e.target.value
                                                )
                                            }
                                            className={cn(
                                                "mt-1",
                                                hasError &&
                                                    "border-red-500 focus:border-red-500"
                                            )}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <Label
                                            htmlFor={`header-value-${index}`}
                                            className="text-sm font-medium"
                                        >
                                            Header Value
                                        </Label>
                                        <Input
                                            id={`header-value-${index}`}
                                            placeholder="e.g., application/json, Bearer token"
                                            value={header.value}
                                            onChange={(e) =>
                                                updateHeader(
                                                    index,
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                            className={cn(
                                                "mt-1",
                                                hasError &&
                                                    "border-red-500 focus:border-red-500"
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-7">
                                        {isValid && (
                                            <div title="Valid header">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            </div>
                                        )}
                                        {hasError && (
                                            <div title="Invalid header">
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            </div>
                                        )}
                                        {!isComplete && !hasError && (
                                            <div
                                                className="h-4 w-4 rounded-full border-2 border-yellow-500"
                                                title="Incomplete header (will be excluded)"
                                            />
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="rounded-md"
                                            onClick={() => removeHeader(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Validation Error Message */}
                                {hasError && (
                                    <Alert className="mt-3 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-red-700 dark:text-red-300">
                                            {hasError}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        );
                    })}
                </div>

                {displayHeaders.length === 0 && (
                    <div className="text-center text-muted-foreground">
                        <p className="text-sm">
                            Add headers to customize your API responses
                        </p>
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs">
                            <p className="font-medium mb-1">
                                Valid header examples:
                            </p>
                            <p>• Content-Type: application/json</p>
                            <p>• Authorization: Bearer token</p>
                            <p>• X-API-Key: your-api-key</p>
                            <p>• X-Custom-Header: custom-value</p>
                        </div>
                    </div>
                )}

                {/* Summary */}
                {displayHeaders.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Headers to be included:
                            </span>
                            <span className="font-medium">
                                {
                                    displayHeaders.filter(
                                        (h) =>
                                            h.key.trim() !== "" &&
                                            h.value.trim() !== ""
                                    ).length
                                }{" "}
                                of {displayHeaders.length}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Only complete headers (with both key and value) will
                            be saved
                        </p>
                    </div>
                )}

                <Button variant="outline" onClick={addHeader}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Header
                </Button>
            </div>
        </div>
    );
}
