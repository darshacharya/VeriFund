"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Case } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Shield, Clock, CheckCircle, XCircle, ChevronRight, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") { router.push("/login"); return; }

    const fetchCases = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get<Case[]>("/api/admin/cases");
        setAllCases(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load cases");
      }
      setLoading(false);
    };
    fetchCases();
  }, [user, authLoading, router]);

  useEffect(() => {
    setCases(filter ? allCases.filter((c) => c.status === filter) : allCases);
  }, [allCases, filter]);

  if (authLoading || !user) return null;

  const pending = allCases.filter((c) => c.status === "pending").length;
  const verified = allCases.filter((c) => c.status === "verified").length;
  const rejected = allCases.filter((c) => c.status === "rejected").length;

  const statusColor: Record<string, "yellow" | "green" | "red"> = {
    pending: "yellow", verified: "green", rejected: "red",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500">Manage and verify support cases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setFilter("pending")}>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setFilter("verified")}>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold">{verified}</p>
              <p className="text-sm text-gray-500">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setFilter("rejected")}>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50"><XCircle className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold">{rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-6 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Cases</h2>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 animate-pulse space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
            </div>
          ) : cases.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No cases found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/cases/${c.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      <Badge color={statusColor[c.status] || "gray"}>{c.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{c.category}</span>
                      <span>{formatCurrency(c.target_amount)}</span>
                      <span>{formatDate(c.created_at)}</span>
                      {c.seeker && <span>by {c.seeker.name}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 ml-4" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
