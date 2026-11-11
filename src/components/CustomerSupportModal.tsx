import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { SupportTicket, Order } from '../types/index.ts';
import {
  HelpCircle,
  MessageSquare,
  FileQuestion,
  PhoneCall,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: Order[];
}

const FAQS = [
  {
    q: 'How does SmartCart compare prices with Blinkit, Zepto, and others?',
    a: 'SmartCart dynamically fetches official catalog pricing from Blinkit, Zepto, Swiggy Instamart, BigBasket, DMart, and Flipkart. You can directly buy on SmartCart with express delivery or click "View on Official Website" to shop on external platforms.',
  },
  {
    q: 'What is SmartCart Direct Shopping?',
    a: 'SmartCart operates its own express fulfillment network with 15-minute delivery, lowest price match guarantee, direct Razorpay integration, live rider tracking, and doorstep returns.',
  },
  {
    q: 'How long do refunds take?',
    a: 'For UPI, cards, and wallets via Razorpay, refunds are processed within 2-4 hours. In rare banking delays, it may take up to 24-48 business hours.',
  },
  {
    q: 'Are payment details safe on SmartCart?',
    a: 'Yes. SmartCart never stores card numbers, CVV, or UPI PINs. All transactions are securely processed and tokenized by Razorpay with 256-bit bank-grade encryption.',
  },
  {
    q: 'Can I return damaged or expired groceries?',
    a: 'Absolutely! Navigate to My Orders > Request Return/Replacement within 24 hours of delivery. A delivery partner will collect the items or process an instant refund.',
  },
];

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  orders = [],
}) => {
  const { user, getAuthHeader } = useAuth();
  const [activeTab, setActiveTab] = useState<'faq' | 'raise' | 'tickets'>('faq');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // New Ticket Form State
  const [category, setCategory] = useState('Order Delivery Delay');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      const res = await fetch(`/api/support/tickets?userId=${encodeURIComponent(userId)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, user?.uid]);

  if (!isOpen) return null;

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          userId,
          userEmail: user?.email || 'shopper@smartcart.in',
          category,
          orderId: selectedOrderId || null,
          subject,
          message,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets((prev) => [data.ticket, ...prev]);
        setTicketSuccess(`Support Ticket #${data.ticket.id} raised successfully!`);
        setSubject('');
        setMessage('');
        setActiveTab('tickets');
      }
    } catch (err) {
      console.error('Error raising ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-amber-300" />
            <div>
              <h2 className="text-lg font-black">SmartCart Help & Support 24/7</h2>
              <p className="text-xs text-emerald-100">Fast assistance for orders, payments, refunds & queries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-3 px-4 border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'faq'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileQuestion className="w-4 h-4" /> FAQs
          </button>
          <button
            onClick={() => setActiveTab('raise')}
            className={`flex-1 py-3 px-4 border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'raise'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Raise a Complaint
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-3 px-4 border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'tickets'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Clock className="w-4 h-4" /> My Tickets ({tickets.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {ticketSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold p-3 rounded-xl flex items-center justify-between">
              <span>{ticketSuccess}</span>
              <button onClick={() => setTicketSuccess('')} className="font-bold">✕</button>
            </div>
          )}

          {/* TAB 1: FAQS */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs">
                  <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Toll-Free Helpline</p>
                    <p className="text-emerald-800 font-bold">1800-SMART-CART</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2.5 text-xs">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Email Desk</p>
                    <p className="text-blue-800 font-bold">care@smartcart.in</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {FAQS.map((faq, idx) => {
                  const isExp = expandedFaq === idx;
                  return (
                    <div
                      key={faq.q}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExp ? null : idx)}
                        className="w-full p-3.5 text-left text-xs font-bold text-gray-900 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform ${
                            isExp ? 'rotate-180 text-emerald-600' : ''
                          }`}
                        />
                      </button>
                      {isExp && (
                        <div className="px-3.5 pb-3.5 text-xs text-gray-600 border-t border-gray-100 pt-2 leading-relaxed bg-gray-50/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RAISE COMPLAINT */}
          {activeTab === 'raise' && (
            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-medium"
                >
                  <option>Order Delivery Delay</option>
                  <option>Refund / Payment Query</option>
                  <option>Damaged or Missing Grocery Item</option>
                  <option>Price Comparison Discrepancy</option>
                  <option>Other Feedback / Suggestions</option>
                </select>
              </div>

              {orders.length > 0 && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Related Order (Optional)</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-medium"
                  >
                    <option value="">General Query (Not order specific)</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id} (₹{o.totalAmount} - {o.orderStatus})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Milk bottle leaked during transit"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details about what happened. Our operations team will investigate immediately."
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </button>
            </form>
          )}

          {/* TAB 3: TICKETS LIST */}
          {activeTab === 'tickets' && (
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  <p>You have not raised any support tickets yet.</p>
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 text-xs shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-gray-500 text-[11px]">{t.id}</span>
                        <h4 className="font-bold text-gray-900 text-sm mt-0.5">{t.subject}</h4>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                          {t.category}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      "{t.message}"
                    </p>

                    {t.reply && (
                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900">
                        <span className="font-bold text-[11px] text-emerald-800 block">
                          🎧 SmartCart Support Agent Response:
                        </span>
                        <p className="mt-0.5">{t.reply}</p>
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400">
                      Submitted on {new Date(t.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
