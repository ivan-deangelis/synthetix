"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

interface FieldSettings {
    // Data generation method
    generationMethod?: "faker" | "ai" | "static";

    // Faker specific settings
    fakerMethod?: string;
    locale?: string;
    format?: string;
    min?: number;
    max?: number;
    length?: number;
    additionalOptions: any;

    // AI specific settings
    aiPrompt?: string;
    aiConstraints?: string;

    // Static value
    staticValue?: string;

    // General settings
    required?: boolean;
    unique?: boolean;
}

interface FieldSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fieldName: string;
    fieldType: string;
    settings: FieldSettings;
    onSave: (settings: FieldSettings) => void;
}

const fakerMethods = {
    string: [
        {
            value: "faker.person.firstName",
            label: "First Name",
            returnExample: "John",
        },
        {
            value: "faker.person.lastName",
            label: "Last Name",
            returnExample: "Doe",
        },
        {
            value: "faker.person.fullName",
            label: "Full Name",
            returnExample: "John Doe",
        },
        {
            value: "faker.internet.userName",
            label: "Username",
            returnExample: "johndoe",
        },
        {
            value: "faker.lorem.word",
            label: "Lorem Word",
            returnExample: "Lorem",
            options: { length: { min: 3, max: 10 } },
        },
        {
            value: "faker.lorem.sentence",
            label: "Lorem Sentence",
            returnExample: "Lorem ipsum dolor sit amet.",
        },
        {
            value: "faker.lorem.paragraph",
            label: "Lorem Paragraph",
            returnExample:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            options: { min: 3, max: 10, sentenceCount: 3 },
        },
        {
            value: "faker.company.name",
            label: "Company Name",
            returnExample: "Acme Inc.",
        },
        {
            value: "faker.location.streetAddress",
            label: "Street Address",
            returnExample: "0917 O'Conner Estates",
        },
        {
            value: "faker.location.city",
            label: "City Name",
            returnExample: "New York",
        },
        {
            value: "faker.phone.number",
            label: "Phone Number",
            returnExample: "+1234567890",
        },
        {
            value: "faker.string.uuid",
            label: "UUID",
            returnExample: "123e4567-e89b-12d3-a456-426614174000",
        },
    ],
    number: [
        {
            value: "faker.number.int",
            label: "Random Integer",
            returnExample: "123",
            options: { min: 0, max: 99999 },
        },
        {
            value: "faker.number.float",
            label: "Random Decimal",
            returnExample: "123.45",
            options: { min: 0.0, max: 1.0, fractionDigits: 2 },
        },
        {
            value: "faker.number.bigInt",
            label: "Large Number",
            returnExample: "12345678901234567890",
        },
        {
            value: "faker.datatype.number",
            label: "Random Number",
            returnExample: "123",
        },
        {
            value: "faker.commerce.price",
            label: "Price",
            returnExample: "123.45",
        },
        {
            value: "faker.number.octal",
            label: "Octal Number",
            returnExample: "0o1234567",
        },
        {
            value: "faker.number.hex",
            label: "Hexadecimal",
            returnExample: "0x1234567890abcdef",
        },
    ],
    boolean: [
        {
            value: "faker.datatype.boolean",
            label: "True/False",
            returnExample: "true",
        },
    ],
    date: [
        {
            value: "faker.date.past",
            label: "Past Date",
            returnExample: "2021-12-03T05:40:44.408Z",
        },
        {
            value: "faker.date.future",
            label: "Future Date",
            returnExample: "2022-11-19T05:52:49.100Z",
        },
        {
            value: "faker.date.recent",
            label: "Recent Date",
            returnExample: "2022-02-04T02:09:35.077Z",
        },
        {
            value: "faker.date.birthdate",
            label: "Birth Date",
            returnExample: "1977-07-10T01:37:30.719Z",
        },
        {
            value: "faker.date.weekday",
            label: "Day of Week",
            returnExample: "Monday",
        },
        {
            value: "faker.date.month",
            label: "Month Name",
            returnExample: "January",
        },
    ],
    email: [
        {
            value: "faker.internet.email",
            label: "Email Address",
            returnExample: "john.doe@yahoo.com",
        },
        {
            value: "faker.internet.exampleEmail",
            label: "Example Email",
            returnExample: "john.doe@example.com",
        },
    ],
};

const fakerOptions: Record<string, any> = {
    "faker.lorem.word": {
        transformResult: (value: any) => {
            return {
                length: value,
            };
        },
        components: [
            {
                key: "min",
                component: ({
                    value,
                    onChange,
                }: {
                    value: number;
                    onChange: (key: string, value: string) => void;
                }) => (
                    <>
                        <Label htmlFor="min">Min</Label>
                        <Input
                            type="number"
                            placeholder="Min"
                            min={1}
                            value={value}
                            onChange={(e) => onChange("min", e.target.value)}
                        />
                    </>
                ),
                defaultValue: 3,
            },
            {
                key: "max",
                component: ({
                    value,
                    onChange,
                }: {
                    value: number;
                    onChange: (key: string, value: string) => void;
                }) => (
                    <>
                        <Label htmlFor="max">Max</Label>
                        <Input
                            type="number"
                            placeholder="Max"
                            min={1}
                            value={value}
                            onChange={(e) => onChange("max", e.target.value)}
                        />
                    </>
                ),
                defaultValue: 10,
            },
        ],
    },
    "faker.lorem.sentence": {
        components: [
            {
                key: "min",
                component: ({
                    value,
                    onChange,
                }: {
                    value: number;
                    onChange: (key: string, value: string) => void;
                }) => (
                    <>
                        <Label htmlFor="min">Min</Label>
                        <Input
                            type="number"
                            placeholder="Min"
                            min={1}
                            value={value}
                            onChange={(e) => onChange("min", e.target.value)}
                        />
                    </>
                ),
                defaultValue: 3,
            },
            {
                key: "max",
                component: ({
                    value,
                    onChange,
                }: {
                    value: number;
                    onChange: (key: string, value: string) => void;
                }) => (
                    <>
                        <Label htmlFor="max">Max</Label>
                        <Input
                            type="number"
                            placeholder="Max"
                            min={1}
                            value={value}
                            onChange={(e) => onChange("max", e.target.value)}
                        />
                    </>
                ),
                defaultValue: 10,
            },
        ],
    },
    "faker.lorem.paragraph": {
        components: [
            {
                key: "min",
                component: ({ value, onChange }: { value: number; onChange: (value: string) => void }) => (
                    <Input
                        type="number"
                        placeholder="Min"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                defaultValue: 3,
            },
            {
                key: "max",
                component: ({ value, onChange }: { value: number; onChange: (value: string) => void }) => (
                    <Input
                        type="number"
                        placeholder="Max"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                defaultValue: 10,
            },
            {
                key: "sentenceCount",
                component: ({ value, onChange }: { value: number; onChange: (value: string) => void }) => (
                    <Input
                        type="number"
                        placeholder="Sentence Count"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                defaultValue: 3,
            },
        ],
    },
    "faker.number.int": {
        components: [
            {
                key: "min",
                component: ({ value, onChange }: { value: number; onChange: (value: string) => void }) => (
                    <Input
                        type="number"
                        placeholder="Min"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                defaultValue: 0,
            },
            {
                key: "max",
                component: ({ value, onChange }: { value: number; onChange: (value: string) => void }) => (
                    <Input
                        type="number"
                        placeholder="Max"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                defaultValue: 99999,
            },
        ],
    },
    "faker.number.float": {
        components: [
            {
                key: "fractionDigits",
                component: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
                    <Input
                        type="number"
                        placeholder="Min"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                defaultValue: 0.0,
            },
            {
                key: "min",
                component: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
                    <Input
                        type="number"
                        placeholder="Max"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                defaultValue: 1.0,
            },
            {
                key: "fractionDigits",
                component: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
                    <Input
                        type="number"
                        placeholder="Fraction Digits"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                defaultValue: 2,
            },
        ],
    },
};

const locales = [
    { value: "en", label: "English" },
    { value: "en_US", label: "English (United States)" },
    { value: "en_CA", label: "English (Canada)" },
    { value: "en_GB", label: "English (United Kingdom)" },
    { value: "en_AU", label: "English (Australia)" },
    { value: "es", label: "Spanish" },
    { value: "es_MX", label: "Spanish (Mexico)" },
    { value: "es_ES", label: "Spanish (Spain)" },
    { value: "fr", label: "French" },
    { value: "fr_CA", label: "French (Canada)" },
    { value: "fr_FR", label: "French (France)" },
    { value: "de", label: "German" },
    { value: "de_DE", label: "German (Germany)" },
    { value: "de_AT", label: "German (Austria)" },
    { value: "it", label: "Italian" },
    { value: "it_IT", label: "Italian (Italy)" },
    { value: "pt", label: "Portuguese" },
    { value: "pt_BR", label: "Portuguese (Brazil)" },
    { value: "pt_PT", label: "Portuguese (Portugal)" },
    { value: "ru", label: "Russian" },
    { value: "ru_RU", label: "Russian (Russia)" },
    { value: "ja", label: "Japanese" },
    { value: "ja_JP", label: "Japanese (Japan)" },
    { value: "ko", label: "Korean" },
    { value: "ko_KR", label: "Korean (South Korea)" },
    { value: "zh", label: "Chinese" },
    { value: "zh_CN", label: "Chinese (China)" },
    { value: "zh_TW", label: "Chinese (Taiwan)" },
];

export function FieldSettingsModal({
    open,
    onOpenChange,
    fieldName,
    fieldType,
    settings,
    onSave,
}: FieldSettingsModalProps) {
    const [localSettings, setLocalSettings] = useState<FieldSettings>(settings);

    const handleSave = () => {
        if (localSettings.generationMethod === "faker") {
            const fakerOption = fakerOptions[localSettings.fakerMethod as keyof typeof fakerOptions];

            const result = fakerOption?.transformResult
                ? fakerOption.transformResult(localSettings.additionalOptions)
                : localSettings.additionalOptions;

            onSave({ ...localSettings, additionalOptions: result });
        } else {
            onSave(localSettings);
        }

        onOpenChange(false);
    };

    const handleReset = () => {
        setLocalSettings(settings);
    };

    const getFakerMethodsForType = () => {
        return fakerMethods[fieldType as keyof typeof fakerMethods] || fakerMethods.string;
    };

    const generateFakerOptions = (fakerMethod: string) => {
        const options = fakerOptions[fakerMethod as keyof typeof fakerOptions]?.components;

        if (!options) {
            setLocalSettings((prev) => ({
                ...prev,
                additionalOptions: null,
                fakerMethod: fakerMethod,
            }));
            return;
        }

        const additionalOpts = options.reduce((acc: any, option: any) => {
            acc[option.key] = option.defaultValue || "";
            return acc;
        }, {});

        setLocalSettings((prev) => ({
            ...prev,
            additionalOptions: additionalOpts,
            fakerMethod: fakerMethod,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Data Generation Settings: {fieldName}</DialogTitle>
                    <DialogDescription>
                        Configure how this field's data will be generated for your API.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Generation Method */}
                    <div className="grid gap-2">
                        <Label htmlFor="generationMethod">Generation Method</Label>
                        <Select
                            value={localSettings.generationMethod || "faker"}
                            onValueChange={(value) =>
                                setLocalSettings((prev) => ({
                                    ...prev,
                                    generationMethod: value as "faker" | "ai" | "static",
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select generation method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="faker">Random Data</SelectItem>
                                <SelectItem value="ai">Coherent Data (AI)</SelectItem>
                                <SelectItem value="static">Static Value</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Faker Settings */}
                    {localSettings.generationMethod === "faker" && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="fakerMethod">Data Type</Label>
                                <Select
                                    value={localSettings.fakerMethod || getFakerMethodsForType()[0]?.value}
                                    onValueChange={(value) => {
                                        generateFakerOptions(value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select data type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getFakerMethodsForType().map((method) => (
                                            <SelectItem key={method.value} value={method.value}>
                                                {method.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-500">
                                    Example:{" "}
                                    {
                                        getFakerMethodsForType().find(
                                            (method) => method.value === localSettings.fakerMethod
                                        )?.returnExample
                                    }
                                </p>
                            </div>

                            {/* Faker Options */}
                            {localSettings.fakerMethod &&
                                fakerOptions[localSettings.fakerMethod as keyof typeof fakerOptions] && (
                                    <Accordion type="single" collapsible>
                                        <AccordionItem className="border-b-0" value="faker-options">
                                            <AccordionTrigger className="text-sm">Data Options</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid gap-2 px-2">
                                                    {localSettings.fakerMethod &&
                                                        fakerOptions[localSettings.fakerMethod]?.components?.map(
                                                            (option: any) => {
                                                                let OptionComp = option.component;

                                                                return (
                                                                    <OptionComp
                                                                        key={option.key}
                                                                        value={localSettings?.additionalOptions?.[option.key]}
                                                                        onChange={(value: any) => {
                                                                            setLocalSettings((prev) => ({
                                                                                ...prev,
                                                                                additionalOptions: {
                                                                                    ...prev.additionalOptions,
                                                                                    [option.key]: value,
                                                                                },
                                                                            }))
                                                                        }
                                                                        }
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                )}

                            <div className="grid gap-2">
                                <Label htmlFor="locale">Locale</Label>
                                <Select
                                    value={localSettings.locale || "en"}
                                    onValueChange={(value) =>
                                        setLocalSettings((prev) => ({
                                            ...prev,
                                            locale: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select locale" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locales.map((locale) => (
                                            <SelectItem key={locale.value} value={locale.value}>
                                                {locale.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* AI Settings */}
                    {localSettings.generationMethod === "ai" && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="aiPrompt">AI Prompt</Label>
                                <Textarea
                                    id="aiPrompt"
                                    placeholder="Describe the type of data you want generated for this field..."
                                    value={localSettings.aiPrompt || ""}
                                    onChange={(e) =>
                                        setLocalSettings((prev) => ({
                                            ...prev,
                                            aiPrompt: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="aiConstraints">Constraints (Optional)</Label>
                                <Textarea
                                    id="aiConstraints"
                                    placeholder="Add any constraints or specific requirements..."
                                    value={localSettings.aiConstraints || ""}
                                    onChange={(e) =>
                                        setLocalSettings((prev) => ({
                                            ...prev,
                                            aiConstraints: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </>
                    )}

                    {/* Static Value */}
                    {localSettings.generationMethod === "static" && (
                        <div className="grid gap-2">
                            <Label htmlFor="staticValue">Static Value</Label>
                            <Input
                                id="staticValue"
                                placeholder="Enter the static value for this field..."
                                value={localSettings.staticValue || ""}
                                onChange={(e) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        staticValue: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    )}

                    {/* General Settings */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium">General Settings</Label>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="required" className="text-sm">
                                Required Field
                            </Label>
                            <Switch
                                id="required"
                                checked={localSettings.required || false}
                                onCheckedChange={(checked) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        required: checked,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="unique" className="text-sm">
                                Unique Values
                            </Label>
                            <Switch
                                id="unique"
                                checked={localSettings.unique || false}
                                onCheckedChange={(checked) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        unique: checked,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleSave}>Save Settings</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
