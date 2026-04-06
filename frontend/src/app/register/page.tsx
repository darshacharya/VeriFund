"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, Heart, HandHeart, ShieldCheck, TrendingUp, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthIllustration } from "@/components/illustrations";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"seeker" | "donor">("donor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, role);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-4xl">
        <div className="hidden lg:flex flex-col items-center justify-center">
          <AuthIllustration className="w-64 h-64" />
          <h2 className="text-xl font-bold text-gray-900 mt-6">Join the Community</h2>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-xs mb-6">
            Thousands trust VeriFund for transparent, verified emergency support.
          </p>
          <div className="space-y-3 w-full max-w-xs">
            {[
              { icon: ShieldCheck, text: "Every case is verified", color: "text-emerald-500" },
              { icon: TrendingUp, text: "Track where funds go", color: "text-blue-500" },
              { icon: Eye, text: "Full transparency", color: "text-amber-500" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
                {text}
              </div>
            ))}
          </div>
        </div>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <div className="text-center">
              <Shield className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
              <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
              <p className="text-sm text-gray-500 mt-1">Join VeriFund to help or get helped</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("donor")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition",
                      role === "donor"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <HandHeart className={cn("h-6 w-6", role === "donor" ? "text-emerald-600" : "text-gray-400")} />
                    <span className={cn("text-sm font-medium", role === "donor" ? "text-emerald-700" : "text-gray-600")}>
                      Donate
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("seeker")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition",
                      role === "seeker"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <Heart className={cn("h-6 w-6", role === "seeker" ? "text-emerald-600" : "text-gray-400")} />
                    <span className={cn("text-sm font-medium", role === "seeker" ? "text-emerald-700" : "text-gray-600")}>
                      Seek Help
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min 6 chars)" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
