"use client";

import { Clock3 } from "lucide-react";
import { CourseCheckoutButton } from "@/components/landing/CourseCheckoutButton";

type CheckoutCtaProps = {
  checkoutUrl?: string;
  label: string;
  className?: string;
};

const pageKey = "linkedin-dev-do-zero";
const pagePath = "/linkedin-dev-do-zero";

export function CheckoutCta({ checkoutUrl, label, className = "" }: CheckoutCtaProps) {
  const checkoutReady = Boolean(checkoutUrl && /^https:\/\//i.test(checkoutUrl));

  if (!checkoutReady) {
    return (
      <div className={className}>
        <button
          type="button"
          disabled
          aria-describedby="p011-checkout-status"
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-4 text-center text-sm font-black uppercase tracking-wide text-slate-950 opacity-80 shadow-[0_14px_40px_rgba(34,211,238,.22)] sm:w-auto"
        >
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          Checkout em preparação
        </button>
        <p id="p011-checkout-status" className="mt-3 text-sm leading-6 text-slate-500">
          O link seguro de compra será liberado aqui em breve.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <CourseCheckoutButton
        href={checkoutUrl!}
        label={label}
        pageKey={pageKey}
        pagePath={pagePath}
        hideGlow
        className="w-full bg-none bg-cyan-300 py-4 font-black uppercase tracking-wide text-slate-950 shadow-[0_14px_40px_rgba(34,211,238,.22)] hover:-translate-y-0.5 hover:bg-cyan-200 hover:brightness-100 sm:w-auto"
        eventData={{
          content_name: "LinkedIn Dev do Zero",
          content_category: "Kit digital",
          content_type: "product",
          value: 19.9,
          currency: "BRL",
        }}
      />
    </div>
  );
}
