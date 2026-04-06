"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Case, Donation } from "@/types";
import { CaseCard } from "@/components/case-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, TrendingUp, FolderOpen, Heart, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role === "admin") { router.push("/admin"); return; }

    const fetchData = async () => {
      setError("");
      try {
        if (user.role === "seeker") {
          const data = await api.get<Case[]>("/api/cases");
          setCases(data);
        } else {
          const [casesData, donationsData] = await Promise.all([
            api.get<Case[]>("/api/cases"),
            api.get<Donation[]>("/api/donations/my"),
          ]);
          setCases(casesData);
          setDonations(donationsData);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
      setLoading(false);
    };
    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || !user) return <DashboardSkeleton />;

  if (user.role === "seeker") {
    const totalRaised = cases.reduce((s, c) => s + c.raised_amount, 0);
    const totalTarget = cases.reduce((s, c) => s + c.target_amount, 0);
    const verified = cases.filter((c) => c.status === "verified").length;

    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-500 mt-1">Manage your support cases</p>
          </div>
          <Link href="/cases/create">
            <Button><Plus className="h-4 w-4 mr-2" /> New Case</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="py-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50">
                <FolderOpen className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cases.length}</p>
                <p className="text-sm text-gray-500">Total Cases</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalRaised)}</p>
                <p className="text-sm text-gray-500">Total Raised</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verified}</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No cases yet</h3>
              <p className="text-gray-500 mt-1">Create your first case to get started</p>
              <Link href="/cases/create">
                <Button className="mt-4"><Plus className="h-4 w-4 mr-2" /> Create Case</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c) => <CaseCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    );
  }

  // Donor dashboard
  const totalDonated = donations.reduce((s, d) => s + d.amount, 0);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-500 mt-1">Your donation activity</p>
        </div>
        <Link href="/cases">
          <Button><Heart className="h-4 w-4 mr-2" /> Browse Cases</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalDonated)}</p>
              <p className="text-sm text-gray-500">Total Donated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50">
              <Heart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{donations.length}</p>
              <p className="text-sm text-gray-500">Donations Made</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      {donations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Donation History</h2>
          <Card>
            <CardContent className="p-0 divide-y divide-gray-100">
              {donations.slice(0, 10).map((d) => (
                <Link key={d.id} href={`/cases/${d.case_id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Case #{d.case_id}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(d.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(d.amount)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Cases you can support</h2>
      {loading ? (
        <DashboardSkeleton />
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No cases available</h3>
            <p className="text-gray-500 mt-1">Check back later for verified cases</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => <CaseCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
