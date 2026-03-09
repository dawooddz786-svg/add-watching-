import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageCircle, HeadphonesIcon, ExternalLink, HelpCircle, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Support() {
  const faqs = [
    { q: 'How do I start earning?', a: 'Deposit at least 1500 PKR, wait 24 hours after approval, and start watching ads in the Tasks section.' },
    { q: 'What is the minimum withdrawal?', a: 'The minimum withdrawal amount is 500 PKR.' },
    { q: 'How long does withdrawal take?', a: 'Withdrawals are usually processed within 24 to 48 hours.' },
    { q: 'Can I have multiple accounts?', a: 'No, only one account is allowed per person to ensure fairness.' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Support Center</h1>
        <p className="text-slate-500">We're here to help you with any issues</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-600" /> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-lg shadow-emerald-200">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <HeadphonesIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2">Contact Us</h3>
            <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
              Our support team is available 24/7 to assist you. Feel free to reach out via email.
            </p>
            <a 
              href="mailto:dawooddz786@gmail.com"
              className="w-full py-4 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" /> Send Email
            </a>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Other Channels</h3>
            <div className="space-y-3">
              <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between transition-colors group">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-700">WhatsApp Support</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>
              <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between transition-colors group">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-bold text-slate-700">Tutorial Videos</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
