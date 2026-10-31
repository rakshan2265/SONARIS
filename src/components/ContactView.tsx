import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Building, User, HelpCircle, Globe, Shield } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: 'Model / Backend Integration',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inquiryTypes = [
    'Model / Backend Integration',
    'Dataset Contribution',
    'Marine Research Partnership',
    'General Inquiry',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#04162e] to-[#0a305e] text-white p-8 rounded-2xl border border-[#0f3b70] shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-400/30">
            <Mail className="w-3.5 h-3.5" />
            <span>Connect with the SONARIS Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Contact SONARIS</h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Collaborate with our marine conservation engineers, integrate your custom computer vision models, 
            or contribute side-scan sonar datasets to help clean our oceans.
          </p>
        </div>

        {/* Ambient subtle light glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-blue-400/10 blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Message Received!</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                Thank you for reaching out to SONARIS. A marine technologist from our team will review your inquiry and reply within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    organization: '',
                    inquiryType: 'Model / Backend Integration',
                    subject: '',
                    message: '',
                  });
                }}
                className="mt-4 px-5 py-2 rounded-xl bg-[#1a73e8] text-white text-xs font-semibold hover:bg-[#1557b0] transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <MessageSquare className="w-4 h-4 text-[#1a73e8]" />
                <h2 className="text-sm font-bold text-slate-800">Send an Inquiry</h2>
              </div>

              {/* Inquiry Type Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Inquiry Type</label>
                <div className="flex flex-wrap gap-2">
                  {inquiryTypes.map((type) => {
                    const isSelected = formData.inquiryType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, inquiryType: type })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#1a73e8] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid 2 Columns: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dr. Alex Rivera"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex.rivera@marine.org"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Organization & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / University</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Oceanic Research Institute"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <div className="relative">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Backend integration questions"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your dataset, model architecture, or how we can assist..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Direct Contacts</h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1a73e8] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-slate-800">Support & APIs</span>
                  <span className="text-[11px] text-slate-400">api-support@sonaris.ai</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-slate-800">Marine Labs</span>
                  <span className="text-[11px] text-slate-400">labs.sonaris.ai</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-slate-800">Data Partnerships</span>
                  <span className="text-[11px] text-slate-400">data@sonaris.ai</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/80 border border-blue-200/70 p-5 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-[#0c4a6e]">Ready for Backend Teammates</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              If you are integrating your ML service right now, check the 
              <code className="mx-1 bg-white px-1 py-0.5 rounded text-blue-700 font-mono text-[10px] border border-blue-200">
                src/services/detectionService.ts
              </code> 
              file to configure your local endpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
