import { AuthPanel } from "@/components/AuthPanel";
import { LogoMark } from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-8 py-12">
      <div className="text-center">
        <LogoMark className="mx-auto h-16 w-16 text-gold" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink">Welcome</h1>
        <div className="mx-auto mt-3 h-px w-14 bg-gold" />
        <p className="mt-4 text-sm leading-relaxed text-stone">
          Investors browse the collection freely. Professionals receive a private office
          with listings, enquiries, and Pi-denominated placement.
        </p>
      </div>
      <div className="rounded-2xl border border-hairline bg-white shadow-soft p-8">
        <AuthPanel />
      </div>
    </div>
  );
}
