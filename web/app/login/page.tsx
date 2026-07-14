import { AuthPanel } from "@/components/AuthPanel";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Sign in to HomePi Hub</h1>
        <p className="mt-2 text-sm text-slate-500">
          Investors browse free. Agents get a dashboard, listings, and Pi-priced ad
          products.
        </p>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-white p-6">
        <AuthPanel />
      </div>
    </div>
  );
}
