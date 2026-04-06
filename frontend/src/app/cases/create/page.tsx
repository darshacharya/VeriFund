"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Upload, ChevronRight, ChevronLeft, Check } from "lucide-react";

interface BreakdownItem {
  label: string;
  amount: string;
}

const STEPS = ["Basic Info", "Fund Breakdown", "Documents", "Review"];

export default function CreateCasePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("medical");
  const [urgency, setUrgency] = useState("medium");
  const [targetAmount, setTargetAmount] = useState("");

  const [breakdowns, setBreakdowns] = useState<BreakdownItem[]>([
    { label: "", amount: "" },
  ]);

  const [files, setFiles] = useState<{ file: File; docType: string }[]>([]);

  if (authLoading) return null;
  if (!user || user.role !== "seeker") {
    router.push("/login");
    return null;
  }

  const addBreakdown = () => setBreakdowns([...breakdowns, { label: "", amount: "" }]);
  const removeBreakdown = (i: number) => setBreakdowns(breakdowns.filter((_, idx) => idx !== i));
  const updateBreakdown = (i: number, field: keyof BreakdownItem, val: string) => {
    const copy = [...breakdowns];
    copy[i][field] = val;
    setBreakdowns(copy);
  };

  const addFile = (fileList: FileList | null, docType: string) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map((f) => ({ file: f, docType }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  const breakdownTotal = breakdowns.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
  const target = parseFloat(targetAmount) || 0;

  const canProceedStep0 = title && description && target > 0;
  const breakdownsValid = breakdowns.every((b) => b.label && parseFloat(b.amount) > 0);
  const breakdownMatch = Math.abs(breakdownTotal - target) < 1;
  const canProceedStep1 = breakdownsValid && breakdownMatch;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const caseData = await api.post<{ id: number }>("/api/cases", {
        title,
        description,
        category,
        urgency,
        target_amount: target,
        fund_breakdowns: breakdowns
          .filter((b) => b.label && parseFloat(b.amount) > 0)
          .map((b) => ({ label: b.label, amount: parseFloat(b.amount) })),
      });

      for (const { file, docType } of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("doc_type", docType);
        await api.upload(`/api/cases/${caseData.id}/documents`, fd);
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create case");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Support Case</h1>
      <p className="text-gray-500 mb-8">Fill out the details below. After submission, an admin will review and verify your case.</p>

      {/* Stepper */}
      <div className="flex items-center mb-8 gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                i < step ? "bg-emerald-600 text-white" :
                i === step ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-600" :
                "bg-gray-100 text-gray-400",
              )}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-sm hidden sm:block", i <= step ? "text-gray-900 font-medium" : "text-gray-400")}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 mx-2", i < step ? "bg-emerald-400" : "bg-gray-200")} />}
          </div>
        ))}
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Basic Information</h2></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title describing the emergency" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the situation in detail..." className="min-h-[150px]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="medical">Medical Emergency</option>
                  <option value="death">Loss of Earning Member</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <Select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0" min="1" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Fund Breakdown */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Fund Breakdown</h2>
              <span className={cn("text-sm font-medium", Math.abs(breakdownTotal - target) < 1 ? "text-emerald-600" : "text-amber-600")}>
                {formatCurrency(breakdownTotal)} / {formatCurrency(target)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdowns.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <Input
                  value={b.label}
                  onChange={(e) => updateBreakdown(i, "label", e.target.value)}
                  placeholder="e.g., Surgery cost"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={b.amount}
                  onChange={(e) => updateBreakdown(i, "amount", e.target.value)}
                  placeholder="Amount"
                  className="w-32"
                  min="0"
                />
                {breakdowns.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeBreakdown(i)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addBreakdown}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
            {breakdownsValid && !breakdownMatch && (
              <p className="text-sm text-amber-600 mt-2">
                Breakdown total ({formatCurrency(breakdownTotal)}) must equal target amount ({formatCurrency(target)})
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Upload Documents</h2></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">Upload ID proof, medical/death documents, and bills to help verify your case.</p>

            {["id_proof", "medical_document", "bill"].map((docType) => (
              <div key={docType} className="border border-dashed border-gray-300 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{docType.replace("_", " ")}</span>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => addFile(e.target.files, docType)}
                    />
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                      <Upload className="h-4 w-4" /> Upload
                    </span>
                  </label>
                </div>
                {files.filter((f) => f.docType === docType).map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm text-gray-600 py-1">
                    <span className="truncate">{f.file.name}</span>
                    <button onClick={() => {
                      const idx = files.findIndex((x) => x === f);
                      if (idx >= 0) removeFile(idx);
                    }} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Review & Submit</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Title:</span> <span className="font-medium">{title}</span></div>
              <div><span className="text-gray-500">Category:</span> <span className="font-medium capitalize">{category}</span></div>
              <div><span className="text-gray-500">Urgency:</span> <span className="font-medium capitalize">{urgency}</span></div>
              <div><span className="text-gray-500">Target:</span> <span className="font-medium">{formatCurrency(target)}</span></div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Description:</span>
              <p className="mt-1 text-gray-700">{description}</p>
            </div>
            {breakdowns.filter((b) => b.label).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Fund Breakdown</h4>
                <div className="space-y-1">
                  {breakdowns.filter((b) => b.label).map((b, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{b.label}</span>
                      <span className="font-medium">{formatCurrency(parseFloat(b.amount) || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Documents ({files.length})</h4>
                <div className="space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="text-sm text-gray-600">
                      {f.docType.replace("_", " ")} - {f.file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 0 ? !canProceedStep0 : step === 1 ? !canProceedStep1 : false}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Case"}
          </Button>
        )}
      </div>
    </div>
  );
}
