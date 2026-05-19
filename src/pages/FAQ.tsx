import React from 'react';
import { HelpCircle, ChevronDown, MessageCircle, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';

const faqs = [
  {
    q: "How do I register for a tournament?",
    a: "Select an upcoming tournament from the home page, fill in your Free Fire details, upload the payment screenshot, and click confirm. Our admin will verify your payment within 30-60 minutes."
  },
  {
    q: "When will I get the Room ID and Password?",
    a: "Room ID and Password are released 15-30 minutes before the match start time. You can find them on the specific tournament page if your registration is approved."
  },
  {
    q: "What if I miss my match?",
    a: "Unfortunately, entry fees are non-refundable for missed matches. Please ensure you are ready and in the room at least 10 minutes before the start time."
  },
  {
    q: "How is the prize distributed?",
    a: "After the match ends, results are verified by our admins. Prizes are sent to the winner's provided UPI ID or contact number within 24 hours."
  }
];

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
         <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">FAQ</h1>
         <p className="text-white/40">Got questions? We've got answers.</p>
      </div>

      <div className="space-y-4 mb-24">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-white/5 border border-white/10 rounded-3xl p-6 cursor-pointer open:bg-white/[0.08] transition-all">
            <summary className="flex items-center justify-between list-none font-bold text-lg">
              {faq.q}
              <ChevronDown className="w-5 h-5 text-white/40 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="mt-4 text-white/60 leading-relaxed border-t border-white/5 pt-4">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: MessageCircle, label: "Live Chat", value: "Available 10AM - 10PM" },
          { icon: Mail, label: "Email Support", value: "support@shasak.com" },
          { icon: Phone, label: "WhatsApp", value: "+91 98765 43210" },
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center group hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
               <item.icon className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-[10px] font-black uppercase text-white/40 mb-1">{item.label}</p>
            <p className="font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
