import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { ApplyForm } from "@/components/ApplyForm";
import { LogoMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <LogoMark className="mx-auto h-14 w-14 text-gold" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink">Join as a Professional</h1>
        <div className="mx-auto mt-3 h-px w-14 bg-gold" />
        <p className="mt-4 text-sm leading-relaxed text-stone">
          Sign in first — then submit your credentials for review.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink hover:bg-gold-light"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (user.role === "AGENT") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">You&apos;re already in.</h1>
        <div className="mx-auto mt-3 h-px w-14 bg-gold" />
        <p className="mt-4 text-sm text-stone">Your professional account is active.</p>
        <Link
          href="/agent"
          className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink hover:bg-gold-light"
        >
          Open your Private Office
        </Link>
      </div>
    );
  }

  const application = await prisma.professionalApplication.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
          The Founding Season
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          Apply for a Professional Account
        </h1>
        <div className="mx-auto mt-3 h-px w-16 bg-gold" />
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone">
          Verified professionals consign to the collection, receive private enquiries, and
          acquire placement in Pi. Every application is reviewed by our team.
        </p>
      </div>

      {application?.status === "PENDING" ? (
        <div className="rounded-2xl border border-gold-dark/40 bg-ivory p-8 text-center">
          <p className="text-lg font-bold tracking-tight text-ink">Under review.</p>
          <p className="mt-2 text-sm text-stone">
            Your application from {application.createdAt.toLocaleDateString()} is with our
            team. You&apos;ll gain access to your Private Office upon approval.
          </p>
        </div>
      ) : application?.status === "REJECTED" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-base font-bold text-red-900">
              Your previous application was declined.
            </p>
            {application.reviewNotes && (
              <p className="mt-2 text-sm text-red-800">{application.reviewNotes}</p>
            )}
            <p className="mt-2 text-xs text-red-700">
              You may reapply below with corrected or additional information.
            </p>
          </div>
          <div className="rounded-2xl border border-hairline bg-white shadow-soft p-8">
            <ApplyForm />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-hairline bg-white shadow-soft p-8">
          <ApplyForm />
        </div>
      )}
    </div>
  );
}
