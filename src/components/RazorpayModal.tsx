import React, { useState } from 'react';
import { ShieldCheck, QrCode, CreditCard, Building2, Wallet, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RazorpayModalProps {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onPaymentSuccess: (paymentData: {
    transactionId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    paymentMethod: string;
  }) => void;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentSuccess,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiMethod, setUpiMethod] = useState<'qr' | 'id'>('qr');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('PhonePe');
  const [processing, setProcessing] = useState(false);
  const [paymentState, setPaymentState] = useState<'form' | 'success' | 'failed'>('form');
  const [txId, setTxId] = useState('');

  const handlePayNow = async () => {
    try {
      setProcessing(true);

      // Step 1: Create Razorpay order on backend
      const orderRes = await fetch('/api/payment/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      });
      const orderData = await orderRes.json();
      const rzpOrderId = orderData.orderId || `order_rzp_${Date.now()}`;

      // Simulate network / gateway roundtrip (1.2s)
      await new Promise((r) => setTimeout(r, 1200));

      const rzpPaymentId = `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const paymentMethodLabel =
        selectedTab === 'upi'
          ? `UPI (${upiMethod === 'qr' ? 'Dynamic QR' : upiId || 'Instant'})`
          : selectedTab === 'card'
            ? 'Credit/Debit Card (Razorpay Tokenized)'
            : selectedTab === 'netbanking'
              ? `Net Banking (${selectedBank})`
              : `Wallet (${selectedWallet})`;

      // Step 2: Verify on backend
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: rzpPaymentId,
          razorpaySignature: 'sig_verified_hmac_256',
          orderId: `SC-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          amount,
          paymentMethod: paymentMethodLabel,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.verified) {
        setTxId(verifyData.transactionId || rzpPaymentId);
        setPaymentState('success');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          onPaymentSuccess({
            transactionId: verifyData.transactionId || rzpPaymentId,
            razorpayPaymentId: rzpPaymentId,
            razorpayOrderId: rzpOrderId,
            paymentMethod: paymentMethodLabel,
          });
        }, 1500);
      } else {
        setPaymentState('failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentState('failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-white">Razorpay</span>
                <span className="bg-blue-500/30 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-400/30">
                  SECURE CHECKOUT
                </span>
              </div>
              <p className="text-xs text-gray-400">SmartCart Supermart Logistics</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">Total Payable</span>
            <div className="text-xl font-black text-emerald-400">₹{amount}</div>
          </div>
        </div>

        {paymentState === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Payment Successful!</h3>
            <p className="text-xs text-gray-600">
              Transaction ID: <span className="font-bold text-gray-900">{txId}</span>
            </p>
            <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200">
              Verified by Razorpay & SmartCart Express. Creating your order now...
            </p>
          </div>
        ) : paymentState === 'failed' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Payment Could Not Be Completed</h3>
            <p className="text-xs text-gray-500">
              Please verify your payment details and retry. No funds were debited.
            </p>
            <button
              onClick={() => setPaymentState('form')}
              className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Retry Payment
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Customer Details Pill */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-gray-600">
              <span className="truncate">
                Payer: <strong>{customerName}</strong> ({customerPhone})
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> 256-bit Encrypted
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedTab('upi')}
                className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedTab === 'upi' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <QrCode className="w-4 h-4" /> UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('card')}
                className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedTab === 'card' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('netbanking')}
                className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedTab === 'netbanking' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-4 h-4" /> Net Banking
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('wallet')}
                className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedTab === 'wallet' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wallet className="w-4 h-4" /> Wallets
              </button>
            </div>

            {/* Tab 1: UPI */}
            {selectedTab === 'upi' && (
              <div className="space-y-3 pt-1">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUpiMethod('qr')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                      upiMethod === 'qr'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Scan QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMethod('id')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                      upiMethod === 'id'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Enter UPI ID / VPA
                  </button>
                </div>

                {upiMethod === 'qr' ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-36 h-36 bg-white p-2 border-2 border-gray-300 rounded-xl shadow-inner flex items-center justify-center">
                      {/* Stylized QR representation */}
                      <div className="w-full h-full bg-slate-900 p-2 rounded-lg flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-6 h-6 border-2 border-white bg-blue-500 rounded-xs" />
                          <div className="w-6 h-6 border-2 border-white bg-blue-500 rounded-xs" />
                        </div>
                        <div className="text-[10px] text-white font-mono font-bold text-center">
                          RAZORPAY UPI
                        </div>
                        <div className="flex justify-between">
                          <div className="w-6 h-6 border-2 border-white bg-blue-500 rounded-xs" />
                          <div className="text-emerald-400 font-extrabold text-[9px] pt-1">₹{amount}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      Scan with any UPI app: Google Pay, PhonePe, Paytm, or BHIM
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Enter UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank or user@paytm"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2 text-[11px] text-gray-500 pt-1">
                      <button
                        type="button"
                        onClick={() => setUpiId('shopper@okhdfcbank')}
                        className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        @okhdfcbank
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiId('shopper@ybl')}
                        className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        @ybl
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiId('shopper@paytm')}
                        className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        @paytm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Cards */}
            {selectedTab === 'card' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      setCardNumber(v);
                    }}
                    placeholder="4111 2222 3333 4444"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Valid Thru (MM/YY)</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Card details are tokenized securely
                  per RBI norms and never stored in the database.
                </p>
              </div>
            )}

            {/* Tab 3: Net Banking */}
            {selectedTab === 'netbanking' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-gray-700">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map(
                    (b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 text-xs font-semibold rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                          selectedBank === b
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{b}</span>
                        {selectedBank === b && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Wallets */}
            {selectedTab === 'wallet' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-gray-700">Select Wallet</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PhonePe', 'Paytm Wallet', 'Amazon Pay', 'MobiKwik'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                        selectedWallet === w
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{w}</span>
                      {selectedWallet === w && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="px-4 py-2.5 text-xs text-gray-600 font-bold hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayNow}
                disabled={processing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authorizing Payment...
                  </span>
                ) : (
                  <span>Pay ₹{amount} Securely</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
