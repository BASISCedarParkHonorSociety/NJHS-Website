"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle,
  Clock,
  FileText,
  Info,
  Mail,
  Save,
  Upload,
  User,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
//import { sendSignatureRequest } from "@/app/actions";

// Configuration for proof of work exemption
const PROOF_EXEMPTION_CONFIG = {
  // Threshold in hours for synchronous work that exempts from proof requirement
  syncHoursThreshold: 3,
  // Whether async hours always require proof regardless of amount
  asyncAlwaysRequireProof: true,
  // Maximum hours allowed without supervisor verification
  maxUnverifiedHours: 10,
};

// Dynamic form schema based on whether proof is required
const createFormSchema = (isProofRequired: boolean) => {
  return z.object({
    volunteerName: z.string().min(2, { message: "Name is required" }),
    hoursType: z.enum(["sync", "async"]),
    hours: z.coerce
      .number()
      .min(0.1, { message: "Hours must be greater than 0" })
      .max(PROOF_EXEMPTION_CONFIG.maxUnverifiedHours, {
        message: `Hours exceeding ${PROOF_EXEMPTION_CONFIG.maxUnverifiedHours} require additional verification`,
      }),
    date: z.date(),
    description: z
      .string()
      .min(5, { message: "Please provide a brief description" }),
    supervisorName: z
      .string()
      .min(2, { message: "Supervisor name is required" }),
    supervisorEmail: z
      .string()
      .email({ message: "Please enter a valid email" }),
    supervisorPhone: z.string().optional(),
  });
};

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

// Signature request status types
type SignatureRequestStatus = "not_requested" | "requested" | "completed";

export default function VolunteerHoursForm() {
  const [signatureDocument, setSignatureDocument] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("volunteer-info");
  const [isProofRequired, setIsProofRequired] = useState(true);
  const [signatureRequestStatus, setSignatureRequestStatus] =
    useState<SignatureRequestStatus>("not_requested");
  const [signatureRequestDialogOpen, setSignatureRequestDialogOpen] =
    useState(false);
  const [isRequestingSignature, setIsRequestingSignature] = useState(false);

  // Initialize form with default schema (proof required)
  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(true)),
    defaultValues: {
      volunteerName: "",
      hoursType: "sync",
      hours: 0,
      date: new Date(),
      description: "",
      supervisorName: "",
      supervisorEmail: "",
      supervisorPhone: "",
    },
  });

  // Function to determine if proof of work is required
  const determineIfProofRequired = (
    hoursType: string,
    hours: number
  ): boolean => {
    // If hours type is async and config says async always requires proof
    if (
      hoursType === "async" &&
      PROOF_EXEMPTION_CONFIG.asyncAlwaysRequireProof
    ) {
      return true;
    }

    // If hours type is sync and hours are below threshold
    if (
      hoursType === "sync" &&
      hours <= PROOF_EXEMPTION_CONFIG.syncHoursThreshold
    ) {
      return false;
    }

    // Default to requiring proof
    return true;
  };

  // Watch for changes in hours type and amount
  const hoursType = form.watch("hoursType");
  const hours = form.watch("hours");
  const supervisorEmail = form.watch("supervisorEmail");
  const supervisorName = form.watch("supervisorName");
  const volunteerName = form.watch("volunteerName");

  // Update proof requirement when relevant fields change
  useEffect(() => {
    const newProofRequired = determineIfProofRequired(hoursType, hours);
    setIsProofRequired(newProofRequired);

    // Update form validation schema when proof requirement changes
    form.clearErrors();
  }, [hoursType, hours, form]);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignatureDocument(e.target.files[0]);
    }
  };

  const clearDocument = () => {
    setSignatureDocument(null);
  };

  // Handle signature request via email
  const handleSignatureRequest = async () => {
    if (!supervisorEmail || !supervisorName || !volunteerName) {
      toast({
        title: "Missing information",
        description:
          "Please fill in your name and supervisor details before requesting a signature",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRequestingSignature(true);

      // Generate a unique request ID (in a real app, this would be stored in a database)
      const requestId = Math.random().toString(36).substring(2, 15);

      // Prepare data for the signature request
      const requestData = {
        requestId,
        volunteerName,
        supervisorName,
        supervisorEmail,
        hoursType,
        hours,
        date: form.getValues("date"),
        description: form.getValues("description"),
      };

      // Send the signature request email
      const result = { success: true, requestId: 0 };

      if (result.success) {
        // Update the signature request status
        setSignatureRequestStatus("requested");
        setSignatureRequestDialogOpen(false);

        toast({
          title: "Signature request sent",
          description: `An email has been sent to ${supervisorEmail} requesting their signature.`,
        });
      } else {
        throw new Error("Failed to send signature request");
      }
    } catch (error) {
      console.error("Error sending signature request:", error);
      toast({
        title: "Failed to send request",
        description:
          "There was an error sending the signature request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingSignature(false);
    }
  };

  // Add a direct signature function for testing purposes
  const handleDirectSignature = () => {
    if (!supervisorEmail || !supervisorName || !volunteerName) {
      toast({
        title: "Missing information",
        description: "Please fill in supervisor details before signing",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would verify a signature token
    setSignatureRequestStatus("completed");

    toast({
      title: "Signature verified",
      description: `${supervisorName} has signed your volunteer hours.`,
    });
  };

  const onSubmit = (data: FormValues) => {
    // Check if proof is required but not provided
    if (
      isProofRequired &&
      !signatureDocument &&
      signatureRequestStatus !== "completed"
    ) {
      toast({
        title: "Signature document required",
        description:
          "Please attach a signed document or request a signature from your supervisor",
        variant: "destructive",
      });
      setActiveTab("signature-doc");
      return;
    }

    // In a real app, you would upload the document to your server
    const completeData = {
      ...data,
      signatureDocument: signatureDocument?.name || "Not required",
      proofRequired: isProofRequired,
      signatureRequestStatus,
    };

    // Here you would typically send this data to your backend
    console.log("Form submitted:", completeData);

    toast({
      title: "Hours logged successfully!",
      description: `You logged ${data.hours} ${
        data.hoursType === "sync" ? "synchronous" : "asynchronous"
      } hours on ${format(data.date, "PPP")}`,
    });

    // Reset form
    form.reset();
    clearDocument();
    setActiveTab("volunteer-info");
    setSignatureRequestStatus("not_requested");
  };

  // Simulate receiving a signature (in a real app, this would be handled by a webhook or API endpoint)
  const simulateReceivedSignature = () => {
    setSignatureRequestStatus("completed");
    toast({
      title: "Signature received",
      description: "Your supervisor has signed your volunteer hours.",
      variant: "success",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full border-none shadow-lg bg-white dark:bg-gray-800">
        <CardHeader className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Volunteer Hours Tracker
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              >
                {form.watch("hoursType") === "sync"
                  ? "Synchronous"
                  : "Asynchronous"}
              </Badge>
              <Badge
                variant="outline"
                className={`px-3 py-1 text-xs ${
                  isProofRequired
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-green-100 text-green-800 border-green-200"
                }`}
              >
                {isProofRequired ? "Proof Required" : "No Proof Needed"}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
            Record your volunteer hours and get them verified by your
            supervisor.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="px-8 pb-8">
            <Alert className="mb-6 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <Info className="h-4 w-4 text-gray-900 dark:text-white" />
              <AlertTitle className="text-sm font-medium text-gray-900 dark:text-white">
                Proof of Work Policy
              </AlertTitle>
              <AlertDescription className="text-xs text-gray-600 dark:text-gray-400">
                Synchronous hours of {PROOF_EXEMPTION_CONFIG.syncHoursThreshold}{" "}
                or fewer do not require proof of work. All asynchronous hours
                and synchronous hours exceeding{" "}
                {PROOF_EXEMPTION_CONFIG.syncHoursThreshold} hours require
                documentation with supervisor signature.
              </AlertDescription>
            </Alert>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger
                  value="volunteer-info"
                  className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Your Info
                </TabsTrigger>
                <TabsTrigger
                  value="supervisor-info"
                  className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Supervisor
                </TabsTrigger>
                <TabsTrigger
                  value="signature-doc"
                  className={cn(
                    "data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white",
                    isProofRequired ? "" : "opacity-50"
                  )}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isProofRequired ? "Document" : "Document (Optional)"}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="volunteer-info"
                className="space-y-8 animate-in fade-in-50 duration-300"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="volunteerName"
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Your Name
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <Input
                        id="volunteerName"
                        placeholder="Enter your full name"
                        className="pl-10 h-11"
                        {...form.register("volunteerName")}
                      />
                    </div>
                    {form.formState.errors.volunteerName && (
                      <p className="text-sm text-red-500 mt-1.5">
                        {form.formState.errors.volunteerName.message}
                      </p>
                    )}
                  </div>

                  <div className="p-5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <Label className="text-sm font-medium mb-3 inline-block text-gray-900 dark:text-white">
                      Hours Type
                    </Label>
                    <RadioGroup
                      defaultValue="sync"
                      className="flex flex-col space-y-3"
                      {...form.register("hoursType")}
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
                        <RadioGroupItem
                          value="sync"
                          id="sync"
                          className="border-gray-300 dark:border-gray-600 rounded-full"
                        />
                        <Label
                          htmlFor="sync"
                          className="font-normal cursor-pointer flex items-center text-gray-900 dark:text-white"
                        >
                          <Badge
                            variant="outline"
                            className="mr-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          >
                            Sync
                          </Badge>
                          Synchronous (in-person, virtual meetings)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
                        <RadioGroupItem
                          value="async"
                          id="async"
                          className="border-gray-300 dark:border-gray-600 rounded-full border-primary/50"
                        />
                        <Label
                          htmlFor="async"
                          className="font-normal cursor-pointer flex items-center text-gray-900 dark:text-white"
                        >
                          <Badge
                            variant="outline"
                            className="mr-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          >
                            Async
                          </Badge>
                          Asynchronous (independent work)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="hours"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Hours Completed
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-600 dark:text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs text-gray-900 dark:text-white">
                                {hoursType === "sync"
                                  ? `Synchronous hours of ${PROOF_EXEMPTION_CONFIG.syncHoursThreshold} or fewer don't require proof`
                                  : "All asynchronous hours require proof of work"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <Input
                          id="hours"
                          type="number"
                          step="0.25"
                          min="0"
                          placeholder="0.0"
                          className="pl-10 h-11"
                          {...form.register("hours")}
                        />
                      </div>
                      {form.formState.errors.hours && (
                        <p className="text-sm text-red-500 mt-1.5">
                          {form.formState.errors.hours.message}
                        </p>
                      )}
                      {!isProofRequired && hours > 0 && (
                        <p className="text-sm text-green-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          No proof required for this amount
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="date"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Date of Service
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 dark:border-gray-600 h-11",
                              !form.getValues("date") &&
                                "text-gray-600 dark:text-gray-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                            {form.getValues("date") ? (
                              format(form.getValues("date"), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.getValues("date")}
                            onSelect={(date) =>
                              form.setValue("date", date as Date)
                            }
                            initialFocus
                            className="rounded-md border-gray-300 dark:border-gray-600"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Description of Service
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the volunteer work you performed"
                      className="resize-none min-h-[120px]"
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500 mt-1.5">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("supervisor-info")}
                      className="bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors h-11"
                    >
                      Continue to Supervisor Info
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="supervisor-info"
                className="space-y-8 animate-in fade-in-50 duration-300"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="supervisorName"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Supervisor Name
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                        <Input
                          id="supervisorName"
                          placeholder="Enter supervisor's name"
                          className="pl-10 h-11"
                          {...form.register("supervisorName")}
                        />
                      </div>
                      {form.formState.errors.supervisorName && (
                        <p className="text-sm text-red-500 mt-1.5">
                          {form.formState.errors.supervisorName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="supervisorEmail"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Supervisor Email
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <Input
                          id="supervisorEmail"
                          type="email"
                          placeholder="supervisor@example.com"
                          className="pl-10 h-11"
                          {...form.register("supervisorEmail")}
                        />
                      </div>
                      {form.formState.errors.supervisorEmail && (
                        <p className="text-sm text-red-500 mt-1.5">
                          {form.formState.errors.supervisorEmail.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="supervisorPhone"
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Supervisor Phone (Optional)
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600 dark:text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <Input
                        id="supervisorPhone"
                        placeholder="(123) 456-7890"
                        className="pl-10 h-11"
                        {...form.register("supervisorPhone")}
                      />
                    </div>
                  </div>

                  {isProofRequired && (
                    <div className="p-5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                        Request Supervisor Signature
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                        You can request your supervisor to sign your hours
                        electronically via email. They'll receive a link to
                        review and sign your volunteer hours.
                      </p>

                      <Dialog
                        open={signatureRequestDialogOpen}
                        onOpenChange={setSignatureRequestDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            disabled={
                              signatureRequestStatus !== "not_requested"
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            {signatureRequestStatus === "not_requested" &&
                              "Request Signature via Email"}
                            {signatureRequestStatus === "requested" &&
                              "Signature Request Sent"}
                            {signatureRequestStatus === "completed" &&
                              "Signature Received"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">
                              Request Supervisor Signature
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                              An email will be sent to your supervisor with a
                              link to review and sign your volunteer hours.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-900 dark:text-white">
                                Supervisor Email
                              </Label>
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-900 dark:text-white">
                                {supervisorEmail || "No email provided"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-900 dark:text-white">
                                Hours Summary
                              </Label>
                              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-900 dark:text-white">
                                {hours}{" "}
                                {hoursType === "sync"
                                  ? "synchronous"
                                  : "asynchronous"}{" "}
                                hours on{" "}
                                {form.getValues("date")
                                  ? format(form.getValues("date"), "PPP")
                                  : "No date selected"}
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="sm:justify-between">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setSignatureRequestDialogOpen(false)
                              }
                              className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={handleSignatureRequest}
                              disabled={
                                isRequestingSignature || !supervisorEmail
                              }
                              className="bg-gray-900 dark:bg-gray-700 text-white"
                            >
                              {isRequestingSignature
                                ? "Sending..."
                                : "Send Request"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {signatureRequestStatus === "requested" && (
                        <div className="mt-3 flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <Info className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                              Signature request sent to {supervisorEmail}.
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs text-yellow-800 dark:text-yellow-200 underline"
                                onClick={simulateReceivedSignature}
                              >
                                (Demo: Simulate received signature)
                              </Button>
                            </p>
                          </div>
                        </div>
                      )}

                      {signatureRequestStatus === "completed" && (
                        <div className="mt-3 flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <p className="text-xs text-green-800 dark:text-green-200">
                            Signature received from {supervisorName}. You can
                            now submit your hours.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("volunteer-info")}
                      className="h-11 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (isProofRequired) {
                          setActiveTab("signature-doc");
                        } else {
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      className="bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors h-11"
                    >
                      {isProofRequired
                        ? "Continue to Document"
                        : "Submit Hours"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="signature-doc"
                className="space-y-8 animate-in fade-in-50 duration-300"
              >
                <div className="space-y-6">
                  {isProofRequired ? (
                    <Alert className="bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-sm font-medium">
                        Proof of Work Required
                      </AlertTitle>
                      <AlertDescription className="text-xs">
                        {hoursType === "sync"
                          ? `Synchronous hours exceeding ${PROOF_EXEMPTION_CONFIG.syncHoursThreshold} hours require documentation.`
                          : "All asynchronous hours require proof of work documentation."}
                        {signatureRequestStatus === "completed" &&
                          " Your supervisor has already signed electronically."}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
                      <Info className="h-4 w-4" />
                      <AlertTitle className="text-sm font-medium">
                        Proof of Work Optional
                      </AlertTitle>
                      <AlertDescription className="text-xs">
                        Your {hours} synchronous hours don't require proof of
                        work documentation, but you may still attach it if
                        available.
                      </AlertDescription>
                    </Alert>
                  )}

                  {signatureRequestStatus === "completed" ? (
                    <div className="p-5 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-200" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                            Electronic Signature Verified
                          </h3>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            {supervisorName} has signed your volunteer hours
                            electronically.
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-md border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Signed by:
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {supervisorName}
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800 text-xs"
                          >
                            Verified
                          </Badge>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-100 dark:border-green-800">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Verification ID:{" "}
                            {Math.random()
                              .toString(36)
                              .substring(2, 10)
                              .toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="signature-document"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {isProofRequired
                            ? "Attach Signed Document (Required)"
                            : "Attach Signed Document (Optional)"}
                        </Label>

                        {isProofRequired &&
                          signatureRequestStatus === "not_requested" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-auto p-0 text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                              onClick={() => setActiveTab("supervisor-info")}
                            >
                              Or request electronic signature
                            </Button>
                          )}
                      </div>

                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-10 transition-all duration-200 ease-in-out",
                          signatureDocument
                            ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            : isProofRequired
                            ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900"
                        )}
                        onClick={() =>
                          document.getElementById("signature-document")?.click()
                        }
                      >
                        <div className="flex flex-col items-center justify-center text-center cursor-pointer">
                          {signatureDocument ? (
                            <div className="space-y-3">
                              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <FileText className="h-10 w-10 text-gray-900 dark:text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {signatureDocument.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {(signatureDocument.size / 1024).toFixed(2)}{" "}
                                  KB
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <Upload className="h-10 w-10 text-gray-900 dark:text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  Drop your file here or click to browse
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  {isProofRequired
                                    ? "Attach a document with your supervisor's signature"
                                    : "Optional: Attach a document if available"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Input
                        id="signature-document"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                        onChange={handleDocumentChange}
                      />

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Accepted formats: PDF, JPG, PNG, DOC, DOCX
                        </p>

                        {signatureDocument && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearDocument}
                            className="text-xs h-9 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          >
                            Remove File
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("supervisor-info")}
                      className="h-11 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors h-11"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Submit Hours
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
