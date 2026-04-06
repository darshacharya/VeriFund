"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { CaseDetail, Document as DocType } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  ShieldCheck, ShieldX, FileText, CheckCircle, Eye, EyeOff, ArrowLeft,
  Download, Image as ImageIcon, Loader2, ZoomIn, X,
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function fileCategory(filename: string): "image" | "pdf" | "other" {
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename)) return "image";
  if (/\.pdf$/i.test(filename)) return "pdf";
  return "other";
}

function DocumentPreview({ doc }: { doc: DocType }) {
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
      <div className="bg-gray-50 flex items-center justify-center h-48 border-b border-gray-200">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="bg-gray-50 flex items-center justify-center h-24 border-b border-gray-200 text-sm text-gray-400">
        Could not load preview
      </div>
    );
  }

  if (category === "image") {
    return (
      <>
        <div
          className="bg-gray-50 p-3 flex justify-center border-b border-gray-200 cursor-pointer group relative"
          onClick={() => setExpanded(true)}
        >
          <img src={blobUrl} alt={doc.original_filename} className="max-h-64 rounded-md object-contain" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
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
    return (
      <div className="border-b border-gray-200">
        <iframe src={blobUrl} className="w-full h-96" title={doc.original_filename} />
      </div>
    );
  }

  return null;
}

export default function AdminCaseReviewPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState<"verified" | "rejected" | null>(null);
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") { router.push("/login"); return; }

    const fetchCase = async () => {
      try {
        const data = await api.get<CaseDetail>(`/api/cases/${caseId}`);
        setCaseData(data);
        setNotes(data.admin_notes || "");
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchCase();
  }, [caseId, user, authLoading, router]);

  const handleVerify = async (status: "verified" | "rejected") => {
    setActing(status);
    setActionSuccess("");
    try {
      const updated = await api.patch<CaseDetail>(`/api/admin/cases/${caseId}/verify`, {
        status,
        admin_notes: notes || null,
      });
      setCaseData({ ...caseData!, ...updated });
      setActionSuccess(status === "verified" ? "Case approved successfully" : "Case rejected");
    } catch { /* ignore */ }
    setActing(null);
  };

  const handleDocVerify = async (docId: number, adminVerified: boolean, donorVisible: boolean) => {
    try {
      await api.patch(`/api/admin/documents/${docId}/verify`, {
        admin_verified: adminVerified,
        donor_visible: donorVisible,
      });
      setCaseData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === docId ? { ...d, admin_verified: adminVerified, donor_visible: donorVisible } : d,
          ),
        };
      });
    } catch { /* ignore */ }
  };

  const handleOpenInTab = (docId: number) => {
    const token = localStorage.getItem("token");
    window.open(`${API_BASE}/api/documents/${docId}/file${token ? `?token=${token}` : ""}`, "_blank");
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-2/3" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!caseData) {
    return <div className="text-center py-20 text-gray-500">Case not found</div>;
  }

  const c = caseData;
  const pct = c.target_amount > 0 ? (c.raised_amount / c.target_amount) * 100 : 0;
  const isPending = c.status === "pending";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{c.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {c.category} &middot; {c.urgency} urgency &middot; {formatDate(c.created_at)}
            {c.seeker && ` · by ${c.seeker.name} (${c.seeker.email})`}
          </p>
        </div>
        <Badge color={c.status === "verified" ? "green" : c.status === "rejected" ? "red" : "yellow"}>
          {c.status}
        </Badge>
      </div>

      {/* Status banner for already-decided cases */}
      {!isPending && (
        <div className={cn(
          "rounded-lg px-4 py-3 text-sm flex items-center gap-2",
          c.status === "verified" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800",
        )}>
          {c.status === "verified" ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
          This case has been <strong>{c.status}</strong>.
          {c.admin_notes && <span className="text-gray-500 ml-1">Notes: {c.admin_notes}</span>}
        </div>
      )}

      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Story</h2></CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{c.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{formatCurrency(c.raised_amount)} raised</span>
            <span>{formatCurrency(c.target_amount)} target</span>
          </div>
          <Progress value={pct} />
        </CardContent>
      </Card>

      {c.fund_breakdowns.length > 0 && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Fund Breakdown</h2></CardHeader>
          <CardContent>
            {c.fund_breakdowns.map((b) => (
              <div key={b.id} className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
                <span className="text-gray-600">{b.label}</span>
                <span className="font-medium">{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Documents with preview, download, and verification toggles */}
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Documents ({c.documents.length})</h2></CardHeader>
        <CardContent>
          {c.documents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No documents uploaded</p>
          ) : (
            <div className="space-y-4">
              {c.documents.map((d) => (
                <div key={d.id} className="rounded-lg border border-gray-200 overflow-hidden">
                  <DocumentPreview doc={d} />
                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {fileCategory(d.original_filename) === "image"
                        ? <ImageIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        : <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{d.original_filename}</p>
                        <p className="text-xs text-gray-400 capitalize">{d.doc_type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenInTab(d.id)}
                        title="Open in new tab"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant={d.admin_verified ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDocVerify(d.id, !d.admin_verified, d.donor_visible)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        {d.admin_verified ? "Verified" : "Verify"}
                      </Button>
                      <Button
                        variant={d.donor_visible ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDocVerify(d.id, d.admin_verified, !d.donor_visible)}
                      >
                        {d.donor_visible ? <Eye className="h-3.5 w-3.5 mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1" />}
                        {d.donor_visible ? "Visible" : "Hidden"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Actions */}
      <Card className={cn(
        isPending ? "ring-2 ring-amber-300" : "",
      )}>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {isPending ? "Verification Decision" : "Update Decision"}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionSuccess && (
            <div className={cn(
              "rounded-lg px-4 py-3 text-sm font-medium",
              actionSuccess.includes("approved") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            )}>
              {actionSuccess}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this case (visible only to admins)..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleVerify("verified")}
              disabled={acting !== null || c.status === "verified"}
              className={cn(
                "flex-1 h-12 text-base",
                c.status === "verified" && "ring-2 ring-emerald-400 ring-offset-2",
              )}
            >
              <ShieldCheck className="h-5 w-5 mr-2" />
              {acting === "verified" ? "Approving..." : c.status === "verified" ? "Approved" : "Approve Case"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleVerify("rejected")}
              disabled={acting !== null || c.status === "rejected"}
              className={cn(
                "flex-1 h-12 text-base border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700",
                c.status === "rejected" && "ring-2 ring-red-400 ring-offset-2 bg-red-50",
              )}
            >
              <ShieldX className="h-5 w-5 mr-2" />
              {acting === "rejected" ? "Rejecting..." : c.status === "rejected" ? "Rejected" : "Reject Case"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
