"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  Shield, ShieldCheck, Heart, TrendingUp, FileText, Eye, ArrowRight,
  CheckCircle, Users, HeartPulse,
} from "lucide-react";
import {
  HeroIllustration, VerifiedIllustration, TrackingIllustration,
  TransparencyIllustration, CommunityIllustration,
} from "@/components/illustrations";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
                <ShieldCheck className="h-4 w-4" /> Verified Emergency Support
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                Transparent Funding for{" "}
                <span className="text-emerald-600">Real Emergencies</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                VeriFund ensures every case is verified, every rupee is tracked, and every donor
                sees exactly where their contribution goes. No more guesswork.
              </p>
              <div className="mt-10 flex items-center gap-4 flex-wrap justify-center lg:justify-start">
                {user ? (
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                    <Button size="lg">
                      Go to Dashboard <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg">
                        Get Started <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/cases">
                      <Button variant="outline" size="lg">
                        Browse Cases
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <HeroIllustration className="w-full max-w-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { label: "Verified Cases", value: "100%", icon: ShieldCheck },
              { label: "Fund Tracking", value: "Real-time", icon: TrendingUp },
              { label: "Document Verified", value: "Every one", icon: FileText },
              { label: "Donor Visibility", value: "Full", icon: Eye },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <Icon className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How VeriFund Works</h2>
            <p className="mt-3 text-lg text-gray-500">Three simple steps to verified support</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create a Case",
                desc: "Seekers submit their emergency case with documents, fund breakdowns, and a detailed story.",
                icon: HeartPulse,
                color: "bg-rose-50 text-rose-600",
                lineColor: "from-rose-200 to-emerald-200",
              },
              {
                step: "2",
                title: "Get Verified",
                desc: "Our admin team reviews every case, verifies documents, and ensures authenticity before going live.",
                icon: ShieldCheck,
                color: "bg-emerald-50 text-emerald-600",
                lineColor: "from-emerald-200 to-purple-200",
              },
              {
                step: "3",
                title: "Receive Support",
                desc: "Donors contribute with confidence. Every expense is tracked and visible with receipts.",
                icon: Heart,
                color: "bg-purple-50 text-purple-600",
                lineColor: "",
              },
            ].map(({ step, title, desc, icon: Icon, color }, i) => (
              <div key={step} className="relative text-center group">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-gray-200" />
                )}
                <div className={`relative inline-flex items-center justify-center h-20 w-20 rounded-2xl ${color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-9 w-9" />
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-100">
                    {step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why VeriFund?</h2>
            <p className="mt-3 text-lg text-gray-500">Built different from the ground up</p>
          </div>

          {/* Feature showcase with alternating layout */}
          <div className="space-y-16 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 mb-4">
                  Core Feature
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Every Case is Verified</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our admin team reviews every submission - documents, medical records, and identity proofs.
                  Only genuine emergencies make it to donors. No scams, no fakes.
                </p>
                <ul className="space-y-2">
                  {["ID proof verification", "Medical document review", "Admin approval before listing"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                <VerifiedIllustration className="w-48 h-48 sm:w-56 sm:h-56" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center md:order-1">
                <TrackingIllustration className="w-48 h-48 sm:w-56 sm:h-56" />
              </div>
              <div className="md:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 mb-4">
                  Transparency
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Every Rupee</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  See exactly where funds go with detailed breakdowns and receipt uploads.
                  Real-time progress tracking and expense accountability.
                </p>
                <ul className="space-y-2">
                  {["Detailed fund breakdowns", "Receipt uploads for every expense", "Real-time donation tracking"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Smaller feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Document Verification", desc: "ID proofs, medical docs, bills - all verified.", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
              { title: "Real-time Updates", desc: "Progress, surgeries, and recovery milestones.", icon: CheckCircle, color: "text-rose-600", bg: "bg-rose-50" },
              { title: "Full Transparency", desc: "Know where every rupee goes.", icon: Eye, color: "text-amber-600", bg: "bg-amber-50" },
              { title: "Community Trust", desc: "Repeat donors who trust the system.", icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
            ].map(({ title, desc, icon: Icon, color, bg }) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${bg} mb-4`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-100 mb-6 backdrop-blur-sm">
            <Heart className="h-4 w-4" /> Join thousands making a difference
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to make a difference?</h2>
          <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto">
            Whether you need help or want to help - VeriFund is the trusted platform
            for verified emergency support.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-emerald-900/20">
                Create Account <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/cases">
              <Button size="lg" variant="outline" className="border-emerald-300 text-white hover:bg-emerald-500">
                Browse Cases
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-gray-900">VeriFund</span>
            </div>
            <p className="text-sm text-gray-400 text-center">Verified Emergency Support with Full Transparency</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
