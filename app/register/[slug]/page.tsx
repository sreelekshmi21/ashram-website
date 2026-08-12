import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen gradient-warm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md animate-fade-in">
            <div className="w-16 h-16 rounded-full gradient-saffron flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
              <span className="text-3xl">📅</span>
            </div>
            <p className="font-heading text-xl font-bold text-forest-dark">
              Loading registration...
            </p>
          </div>
        </div>
      }
    >
      <RegisterClient params={params} />
    </Suspense>
  );
}
