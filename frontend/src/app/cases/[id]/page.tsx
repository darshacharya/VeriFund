"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { CaseDetail, FundUsage, Document as DocType } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate, formatDateTime, cn } from "@/lib/utils";
import {
  ShieldCheck, HeartPulse, Users, Calendar, FileText, Upload, Trash2,
  Heart, DollarSign, Receipt, MessageSquare, Clock, CheckCircle2, AlertTriangle,
  Loader2, ZoomIn, X, Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function fileCategory(filename: string): "image" | "pdf" | "other" {
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename)) return "image";
  if (/\.pdf$/i.test(filename)) return "pdf";
  return "other";
}

function DocumentInlinePreview({ doc }: { doc: DocType }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const category = fileCategory(doc.original_filename);

  useEffect(() => {
    let revoke: string | null = null;
    const fetchBlob = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/documents/${doc.id}/file`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        revoke = url;
        setBlobUrl(url);
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    fetchBlob();
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [doc.id]);

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center h-40 rounded-lg">
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
      </div>
    );
  }
  if (error || !blobUrl) return null;

  if (category === "image") {
    return (
      <>
        <div className="relative cursor-pointer group" onClick={() => setExpanded(true)}>
          <img src={blobUrl} alt={doc.original_filename} className="rounded-lg max-h-64 object-contain w-full bg-gray-50" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <ZoomIn className="h-6 w-6 text-gray-600 bg-white/80 rounded-full p-1" />
          </div>
        </div>
        {expanded && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
            <button className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60" onClick={() => setExpanded(false)}>
              <X className="h-5 w-5" />
            </button>
            <img src={blobUrl} alt={doc.original_filename} className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" />
          </div>
        )}
      </>
    );
  }

  if (category === "pdf") {
    return <iframe src={blobUrl} className="w-full h-80 rounded-lg border border-gray-200" title={doc.original_filename} />;
  }

  return null;
}

const statusColor: Record<string, "green" | "yellow" | "red"> = {
  verified: "green", pending: "yellow", rejected: "red",
};

const updateTypeIcon: Record<string, React.ReactNode> = {
  surgery: <HeartPulse className="h-4 w-4 text-rose-500" />,
  recovery: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  bill: <Receipt className="h-4 w-4 text-blue-500" />,
  general: <MessageSquare className="h-4 w-4 text-gray-500" />,
};

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [donateOpen, setDonateOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState("");
  const [donating, setDonating] = useState(false);

  const [usageOpen, setUsageOpen] = useState(false);
  const [usageDesc, setUsageDesc] = useState("");
  const [usageAmount, setUsageAmount] = useState("");
  const [usageReceipt, setUsageReceipt] = useState<File | null>(null);
  const [submittingUsage, setSubmittingUsage] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateContent, setUpdateContent] = useState("");
  const [updateType, setUpdateType] = useState("general");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const fetchCase = async () => {
    setError("");
    try {
      const data = await api.get<CaseDetail>(`/api/cases/${caseId}`);
      setCaseData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load case");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    fetchCase();
  }, [caseId, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDonate = async () => {
    const amt = parseFloat(donateAmount);
    if (!amt || amt <= 0) return;
    setDonating(true);
    setActionError("");
    try {
      await api.post("/api/donations", { case_id: parseInt(caseId), amount: amt });
      setDonateOpen(false);
      setDonateAmount("");
      await fetchCase();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Donation failed");
    }
    setDonating(false);
  };

  const handleUsage = async () => {
    setSubmittingUsage(true);
    setActionError("");
    try {
      const fd = new FormData();
      fd.append("description", usageDesc);
      fd.append("amount", usageAmount);
      if (usageReceipt) fd.append("receipt", usageReceipt);
      await api.upload<FundUsage>(`/api/cases/${caseId}/fund-usage`, fd);
      setUsageOpen(false);
      setUsageDesc("");
      setUsageAmount("");
      setUsageReceipt(null);
      await fetchCase();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to record expense");
    }
    setSubmittingUsage(false);
  };

  const handleUpdate = async () => {
    setSubmittingUpdate(true);
    setActionError("");
    try {
      await api.post(`/api/cases/${caseId}/updates`, { content: updateContent, update_type: updateType });
      setUpdateOpen(false);
      setUpdateContent("");
      await fetchCase();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to post update");
    }
    setSubmittingUpdate(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-2/3" />
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">
          {error || "Case not found"}
        </h2>
      </div>
    );
  }

  const c = caseData;
  const pct = c.target_amount > 0 ? (c.raised_amount / c.target_amount) * 100 : 0;
  const isOwner = user?.role === "seeker" && user.id === c.seeker_id;
  const isDonor = user?.role === "donor";
  const remaining = Math.max(0, c.target_amount - c.raised_amount);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Badge color={statusColor[c.status] || "gray"}>
            {c.status === "verified" && <ShieldCheck className="h-3 w-3 mr-1" />}
            {c.status}
          </Badge>
          <Badge color="purple">
            {c.category === "medical" ? <HeartPulse className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
            {c.category}
          </Badge>
          <Badge color="blue">{c.urgency} urgency</Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{c.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <Calendar className="h-4 w-4" />
          Created {formatDate(c.created_at)}
          {c.seeker && <span>by {c.seeker.name}</span>}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {actionError}
        </div>
      )}

      {/* Progress + Donate */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(c.raised_amount)}</p>
              <p className="text-sm text-gray-500">raised of {formatCurrency(c.target_amount)} goal</p>
            </div>
            {isDonor && c.status === "verified" && remaining > 0 && (
              <Button onClick={() => setDonateOpen(true)}>
                <Heart className="h-4 w-4 mr-2" /> Donate
              </Button>
            )}
            {!user && c.status === "verified" && remaining > 0 && (
              <Link href="/register">
                <Button>
                  <Heart className="h-4 w-4 mr-2" /> Sign up to Donate
                </Button>
              </Link>
            )}
          </div>
          <Progress value={pct} className="mb-1" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{pct.toFixed(0)}% funded</span>
            <span>{formatCurrency(remaining)} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Story */}
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Story</h2></CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{c.description}</p>
        </CardContent>
      </Card>

      {/* Fund Breakdown */}
      {c.fund_breakdowns.length > 0 && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Fund Breakdown</h2></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {c.fund_breakdowns.map((b) => {
                const bPct = c.target_amount > 0 ? (b.amount / c.target_amount) * 100 : 0;
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{b.label}</span>
                      <span className="font-medium">{formatCurrency(b.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-300 rounded-full" style={{ width: `${bPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {(c.documents.length > 0 || isOwner) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Documents</h2>
              {isOwner && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setActionError("");
                      try {
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("doc_type", "supporting_document");
                        await api.upload(`/api/cases/${caseId}/documents`, fd);
                        await fetchCase();
                      } catch (err: unknown) {
                        setActionError(err instanceof Error ? err.message : "Upload failed");
                      }
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    <Upload className="h-4 w-4" /> Upload
                  </span>
                </label>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {c.documents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No documents uploaded yet</p>
            ) : (
              <div className="space-y-4">
                {c.documents.map((d) => (
                  <div key={d.id} className="rounded-lg border border-gray-100 overflow-hidden">
                    <DocumentInlinePreview doc={d} />
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        {fileCategory(d.original_filename) === "image"
                          ? <ImageIcon className="h-5 w-5 text-blue-400" />
                          : <FileText className="h-5 w-5 text-gray-400" />
                        }
                        <div>
                          <p className="text-sm font-medium text-gray-700">{d.original_filename}</p>
                          <p className="text-xs text-gray-400 capitalize">{d.doc_type.replace("_", " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.admin_verified && <Badge color="green">Verified</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fund Usage Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fund Usage</h2>
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => setUsageOpen(true)}>
                <Receipt className="h-4 w-4 mr-1" /> Add Expense
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {c.fund_usages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No expenses recorded yet</p>
          ) : (
            <div className="space-y-3">
              {c.fund_usages.map((fu) => (
                <div key={fu.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <DollarSign className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">{fu.description}</p>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(fu.amount)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(fu.created_at)}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-semibold">
                <span>Total Used</span>
                <span>{formatCurrency(c.fund_usages.reduce((s, fu) => s + fu.amount, 0))}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Updates Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Updates Timeline</h2>
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => setUpdateOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-1" /> Post Update
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {c.updates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No updates yet</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {c.updates.map((u) => (
                  <div key={u.id} className="flex gap-4 relative">
                    <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                      {updateTypeIcon[u.update_type] || <Clock className="h-3 w-3 text-gray-400" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge color="gray">{u.update_type}</Badge>
                        <span className="text-xs text-gray-400">{formatDateTime(u.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{u.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Donations */}
      {c.donations.length > 0 && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Recent Donations</h2></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {c.donations.slice(0, 10).map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{d.donor?.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(d.created_at)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(d.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donate Modal */}
      <Modal open={donateOpen} onClose={() => setDonateOpen(false)} title="Make a Donation">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You are donating to: <strong>{c.title}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
            <Input
              type="number"
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={remaining}
            />
            <p className="text-xs text-gray-400 mt-1">Remaining: {formatCurrency(remaining)}</p>
          </div>
          <div className="flex gap-2">
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setDonateAmount(String(Math.min(amt, remaining)))}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition"
              >
                {formatCurrency(amt)}
              </button>
            ))}
          </div>
          <Button className="w-full" onClick={handleDonate} disabled={donating || !donateAmount}>
            {donating ? "Processing..." : `Donate ${donateAmount ? formatCurrency(parseFloat(donateAmount)) : ""}`}
          </Button>
          <p className="text-xs text-gray-400 text-center">Mock payment - no real charges</p>
        </div>
      </Modal>

      {/* Fund Usage Modal */}
      <Modal open={usageOpen} onClose={() => setUsageOpen(false)} title="Record Expense">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input value={usageDesc} onChange={(e) => setUsageDesc(e.target.value)} placeholder="What was the expense for?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <Input type="number" value={usageAmount} onChange={(e) => setUsageAmount(e.target.value)} placeholder="Amount spent" min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (optional)</label>
            <Input type="file" accept="image/*,.pdf" onChange={(e) => setUsageReceipt(e.target.files?.[0] || null)} />
          </div>
          <Button className="w-full" onClick={handleUsage} disabled={submittingUsage || !usageDesc || !usageAmount}>
            {submittingUsage ? "Saving..." : "Record Expense"}
          </Button>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal open={updateOpen} onClose={() => setUpdateOpen(false)} title="Post Update">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Type</label>
            <div className="flex gap-2 flex-wrap">
              {["general", "surgery", "recovery", "bill"].map((t) => (
                <button
                  key={t}
                  onClick={() => setUpdateType(t)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition capitalize",
                    updateType === t ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-gray-300",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <Textarea value={updateContent} onChange={(e) => setUpdateContent(e.target.value)} placeholder="Share an update about this case..." />
          </div>
          <Button className="w-full" onClick={handleUpdate} disabled={submittingUpdate || !updateContent}>
            {submittingUpdate ? "Posting..." : "Post Update"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
