"use client";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import Script from "next/script";

const PLANS = [
  {
    name: "Starter",
    price: "₹4,999",
    billing: "/month",
    features: [
      "Access to 500+ verified profiles",
      "5 AI reachouts/month",
      "Basic filters",
    ],
    highlight: false,
    planId: "plan_starter"
  },
  {
    name: "Growth",
    price: "₹14,999",
    billing: "/month",
    features: [
      "Full access to database",
      "100 AI reachouts/month",
      "Advanced Github filters",
      "Export to ATS"
    ],
    highlight: true,
    planId: "plan_growth"
  },
  {
    name: "Enterprise",
    price: "Custom",
    billing: "",
    features: [
      "Unlimited access",
      "Unlimited AI reachouts",
      "Dedicated account manager",
      "API access"
    ],
    highlight: false,
    planId: "plan_enterprise"
  }
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === "plan_enterprise") {
      window.location.href = "mailto:sales@gitpitch.demo";
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_123",
        amount: data.amount,
        currency: "INR",
        name: "Gitpitch",
        description: `Subscription to ${planId}`,
        order_id: data.orderId,
        handler: function (response: any) {
          alert("Payment successful! " + response.razorpay_payment_id);
          // Normally would sync with backend here or let webhook handle it
        },
        prefill: {
          name: "Gitpitch User",
          email: "user@example.com",
        },
        theme: {
          color: "#c8f060"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();

    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-20 px-6 lg:px-8 bg-[#0a0a08]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Simple, transparent pricing</h1>
          <p className="text-white/60 text-lg">Invest in top tech talent. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={clsx(
                "card p-8 flex flex-col relative",
                plan.highlight ? "border-[#c8f060]/30 shadow-[0_0_30px_rgba(200,240,96,0.1)]" : "border-white/10"
              )}
            >
              {plan.highlight && (
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#c8f060] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                   Most Popular
                 </div>
              )}
              
              <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6 border-b border-white/10 pb-6">
                <span className="text-4xl font-serif text-white">{plan.price}</span>
                <span className="text-white/40 mb-1">{plan.billing}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#c8f060] shrink-0" />
                    <span className="text-white/70 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(plan.planId)}
                disabled={loading === plan.planId}
                className={clsx(
                  "w-full flex justify-center py-3 rounded-lg text-sm font-medium transition-colors border",
                  plan.highlight 
                    ? "bg-[#c8f060] text-black border-transparent hover:bg-[#b0d84a]" 
                    : "bg-transparent text-white border-white/20 hover:border-white/50"
                )}
              >
                {loading === plan.planId ? <Loader2 className="w-5 h-5 animate-spin" /> : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
