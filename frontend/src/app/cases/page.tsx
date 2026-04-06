"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Case } from "@/types";
import { CaseCard } from "@/components/case-card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Heart } from "lucide-react";

export default function CasesListPage() {
  const { user, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;

    const fetchCases = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (urgency) params.set("urgency", urgency);
        const qs = params.toString();
        const data = await api.get<Case[]>(`/api/cases${qs ? `?${qs}` : ""}`);
        setCases(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load cases");
      }
      setLoading(false);
    };
    fetchCases();
  }, [category, urgency, user, authLoading]);

  const filtered = cases.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Cases</h1>
        <p className="text-gray-500 mt-1">Discover verified cases that need your support</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="pl-10"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">
          <option value="">All Categories</option>
          <option value="medical">Medical</option>
          <option value="death">Loss of Member</option>
        </Select>
        <Select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="sm:w-40">
          <option value="">All Urgency</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No cases found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
