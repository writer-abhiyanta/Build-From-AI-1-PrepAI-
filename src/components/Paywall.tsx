import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, CheckCircle2, Loader2, Zap, Globe, CreditCard } from 'lucide-react';

export function Paywall({ user, onPaymentSuccess }: { user: any; onPaymentSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string>('IN'); // Default to IN, but user can toggle or we can auto-detect
  
  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // 999 INR for India, 27 USD (~2200 INR roughly) for foreign
      // We will just pass the currency to our backend
      const amount = country === 'IN' ? 999 * 100 : 27 * 100; 
      const currency = country === 'IN' ? 'INR' : 'USD';

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create order. Please check Razorpay keys in environment variables.');
      }

      const order = await response.json();

      const options = {
        key: typeof import.meta !== 'undefined' ? (import.meta as any).env.VITE_RAZORPAY_KEY_ID : '',
        amount: order.amount.toString(),
        currency: order.currency,
        name: 'PrepAI Premium',
        description: 'Yearly Access to Career Suite',
        image: 'https://cdn.lucide.dev/icons/briefcase.svg',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              // Update firestore subscription
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, { subscriptionStatus: 'active' });
              onPaymentSuccess();
            } else {
              setError("Payment signature verification failed.");
            }
          } catch (err: any) {
            setError(err.message || "Failed to verify payment");
          }
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#10b981', // emerald-500
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        setError(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment integration error. Ensure Razorpay is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Premium Features */}
        <div className="bg-emerald-900 p-12 text-white relative flex flex-col justify-between overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
               <ShieldCheck className="w-10 h-10 text-emerald-400" />
               <h2 className="text-2xl font-black tracking-tight">PrepAI Premium</h2>
             </div>
             
             <h3 className="text-4xl font-black mb-6 leading-tight">Elevate your career prep to the next level.</h3>
             <p className="text-emerald-100/80 mb-10 text-lg">
               Unlock the full suite of AI-powered tools and secure your dream job.
             </p>

             <ul className="space-y-5">
               <li className="flex items-start gap-4">
                 <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                 <span className="font-medium text-emerald-50 text-lg">Unlimited AI Mock Interviews</span>
               </li>
               <li className="flex items-start gap-4">
                 <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                 <span className="font-medium text-emerald-50 text-lg">Executive Resume Analyzer & Builder</span>
               </li>
               <li className="flex items-start gap-4">
                 <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                 <span className="font-medium text-emerald-50 text-lg">AI Project Idea Generator</span>
               </li>
             </ul>
           </div>
           
           <div className="relative z-10 pt-10 border-t border-emerald-800/50 mt-10 text-emerald-400/60 font-bold uppercase tracking-widest text-sm flex gap-6">
              <span className="flex items-center gap-2"><Globe className="w-4 h-4"/> No Trials</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4"/> Instant Access</span>
           </div>
        </div>

        {/* Right Side: Checkout Form */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-3xl font-black text-slate-900 mb-2">Subscribe</h3>
            <p className="text-slate-500 font-medium">Choose your billing region</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setCountry('IN')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${country === 'IN' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              India (INR)
            </button>
            <button 
              onClick={() => setCountry('US')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${country === 'US' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              International (USD)
            </button>
          </div>

          <div className="mb-10 text-center p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100">
            <div className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">Yearly Plan</div>
            <div className="text-5xl font-black text-slate-900 mb-2">
              {country === 'IN' ? '₹999' : '$27'}
            </div>
            <div className="text-slate-500 font-medium mb-6">per year, billed annually</div>
            
            <div className="pt-6 border-t border-emerald-100 flex flex-col items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Supported Payment Methods</span>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-1">🏦 Bank / Card</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-1">💳 Razorpay</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-1">📱 Google Pay</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-1">⚡ PhonePe</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
            {loading ? 'Processing...' : 'Pay & Unlock'}
          </button>
          
          <p className="text-center text-xs font-semibold text-slate-400 mt-6 flex items-center justify-center gap-2">
            Secure payments via <span className="text-slate-700">Razorpay</span>
            {/* Using a unicode lock symbol */}
            🔒
          </p>
        </div>

      </div>
    </div>
  );
}
