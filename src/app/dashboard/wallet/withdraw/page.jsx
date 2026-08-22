"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  Landmark,
  Building2,
  ChevronRight,
  Loader2,
  X
} from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import Link from "next/link";

function WithdrawContent() {
  const router = useRouter();

  const [amount, setAmount] = useState("100");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch settings & current user profile
  const { data: settingsRes, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";
  const minWithdrawal = Number(settings.min_withdrawal || 100);
  const maxWithdrawal = Number(settings.max_withdrawal || 5000000);
  const feePercent = Number(settings.withdrawal_charge || 15);

  const { data: userRes, refetch: refetchUser, isLoading: isLoadingUser } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  const availableBalance = Number(user?.balance || user?.wallet_balance || 0);
  const withdrawableBalance = Number(user?.withdrawable_balance !== undefined ? user.withdrawable_balance : availableBalance);

  // Bound bank details
  const bankDetails = user?.bank_details;
  const bankName = bankDetails?.bank_name || "Capitec Bank";
  const accountNumber = bankDetails?.account_number || "1052847890";
  const accountName = bankDetails?.account_name || user?.phone || "Account Holder";
  const maskedAccount = accountNumber.length >= 4 
    ? `**** ${accountNumber.slice(-4)}`
    : `**** 7890`;

  const hasLinkedBank = Boolean(bankDetails?.account_number && bankDetails?.bank_name);

  const numAmount = Number(amount) || 0;
  const serviceFee = (numAmount * (feePercent / 100));
  const receiveAmount = Math.max(0, numAmount - serviceFee);

  const formatAmount = (num) => {
    return Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const { mutate: submitWithdrawal, isPending } = usePost("/users/withdraw");

  const handleOpenConfirm = () => {
    if (!hasLinkedBank) {
      toast.error("Please link your bank account first");
      router.push("/dashboard/account/bind");
      return;
    }

    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (numAmount < minWithdrawal) {
      toast.error(`Minimum withdrawal amount is ${currencySymbol}${minWithdrawal.toLocaleString()}`);
      return;
    }

    if (numAmount > maxWithdrawal) {
      toast.error(`Maximum withdrawal amount is ${currencySymbol}${maxWithdrawal.toLocaleString()}`);
      return;
    }

    const maxAllowed = Math.max(withdrawableBalance, availableBalance);
    if (numAmount > maxAllowed) {
      toast.error("Insufficient withdrawable balance");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    submitWithdrawal(
      {
        amount: numAmount,
        method: `Bank Transfer (${bankName})`,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName
      },
      {
        onSuccess: () => {
          setShowConfirmModal(false);
          refetchUser();
          router.push("/dashboard/account/withdrawal");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col justify-start">
      
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-[#f4f7fb] px-4 pt-3 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer -ml-1"
            aria-label="Go Back"
          >
            <ArrowLeft size={22} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-slate-900 text-[20px] font-bold tracking-tight leading-tight">
              Withdrawal
            </h1>
            <p className="text-slate-400 text-[12px] font-medium leading-tight mt-0.5">
              Transfer funds
            </p>
          </div>
        </div>

        {/* History Link */}
        <Link
          href="/dashboard/account/withdrawal"
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 text-[13px] font-semibold transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-200/50"
        >
          <RotateCcw size={14} className="stroke-[2.2]" />
          <span>History</span>
        </Link>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-2 space-y-3.5 pb-24 select-none">
        
        {/* Top 3-Column Hero Card */}
        <div className="bg-[#03254c] rounded-[18px] p-4 text-white shadow-md shadow-blue-950/15 grid grid-cols-3 divide-x divide-white/10 text-center items-center">
          
          {/* Col 1: Available Balance */}
          <div className="px-1.5">
            <div className="text-sky-100 text-[11.5px] font-medium">
              Available Balance
            </div>
            <div className="text-[#f59e0b] text-[16px] font-black tracking-tight mt-1 truncate">
              {currencySymbol}{formatAmount(availableBalance)}
            </div>
          </div>

          {/* Col 2: Withdrawable */}
          <div className="px-1.5">
            <div className="text-sky-100 text-[11.5px] font-medium">
              Withdrawable
            </div>
            <div className="text-[#f59e0b] text-[16px] font-black tracking-tight mt-1 truncate">
              {currencySymbol}{formatAmount(withdrawableBalance)}
            </div>
          </div>

          {/* Col 3: Fee */}
          <div className="px-1.5">
            <div className="text-sky-100 text-[11.5px] font-medium">
              Fee
            </div>
            <div className="text-[#f59e0b] text-[17px] font-black tracking-tight mt-1">
              {feePercent}%
            </div>
          </div>

        </div>

        {/* Linked Bank Card */}
        <Link
          href="/dashboard/account/bind"
          className="bg-white border border-slate-200 rounded-[16px] p-3.5 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-all cursor-pointer block group"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              hasLinkedBank 
                ? "bg-slate-100 text-slate-700 group-hover:bg-slate-200/70" 
                : "bg-blue-50 text-[#03254c]"
            }`}>
              <Landmark size={20} className="stroke-[1.8]" />
            </div>
            <div>
              <div className="text-slate-900 font-bold text-[14px] leading-tight">
                {hasLinkedBank ? bankName : "Link Bank Account"}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 font-mono text-[12px]">
                  {hasLinkedBank ? maskedAccount : "Tap to link withdrawal destination"}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  hasLinkedBank
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-blue-50 text-[#03254c] border border-blue-200"
                }`}>
                  {hasLinkedBank ? "Linked" : "Required"}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </Link>

        {/* Amount Input Card */}
        <div className="bg-white border border-slate-200 rounded-[16px] p-4 shadow-2xs space-y-2">
          <label className="text-slate-500 text-[12px] font-medium block">
            Amount
          </label>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="text-slate-900 font-bold text-[22px]">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="text-slate-900 font-bold text-[24px] font-mono outline-none w-full bg-transparent placeholder:text-slate-300"
            />
          </div>
          <p className="text-slate-400 text-[11.5px] font-medium pt-0.5">
            Minimum withdrawal: {currencySymbol}{minWithdrawal.toLocaleString()}
          </p>
        </div>

        {/* Breakdown Calculation Card */}
        <div className="bg-white border border-slate-200 rounded-[16px] p-4 shadow-2xs divide-y divide-slate-100 text-[13px] space-y-3">
          <div className="flex items-center justify-between text-slate-600">
            <span>Service fee ({feePercent}%)</span>
            <span className="text-slate-900 font-bold font-mono">
              {currencySymbol}{numAmount > 0 ? formatAmount(serviceFee) : "0"}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 pt-3">
            <span>Receive amount</span>
            <span className="text-[#f59e0b] font-black text-[16px] font-mono">
              {currencySymbol}{numAmount > 0 ? formatAmount(receiveAmount) : "0"}
            </span>
          </div>
        </div>

        {/* Submit Withdrawal Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpenConfirm}
            disabled={isPending}
            className="w-full bg-[#03254c] hover:bg-[#021d3c] active:scale-[0.99] transition-all text-white font-bold py-3.5 rounded-[12px] text-[15px] shadow-md shadow-blue-950/15 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Submit withdrawal</span>
            )}
          </button>
        </div>

      </div>

      {/* Confirm Withdrawal Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[22px] max-w-[380px] w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="text-center pt-1">
              <h3 className="text-slate-900 font-bold text-[16px] leading-tight">
                Confirm withdrawal
              </h3>
              <p className="text-slate-400 text-[11.5px] mt-1 font-medium">
                You are about to withdraw
              </p>
              <div className="text-[#03254c] text-[28px] font-black tracking-tight mt-2 font-mono">
                {currencySymbol}{formatAmount(numAmount)}
              </div>
            </div>

            {/* Table Details */}
            <div className="border-t border-b border-slate-100 py-3 space-y-2.5 text-[12.5px]">
              <div className="flex items-center justify-between text-slate-500">
                <span>Service fee ({feePercent}%)</span>
                <span className="text-slate-900 font-bold font-mono">
                  {currencySymbol}{formatAmount(serviceFee)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Receive amount</span>
                <span className="text-slate-900 font-bold font-mono">
                  {currencySymbol}{formatAmount(receiveAmount)}
                </span>
              </div>
              <div className="flex items-start justify-between text-slate-500 pt-1">
                <span>To</span>
                <div className="text-right">
                  <div className="text-slate-900 font-bold">
                    {bankName}
                  </div>
                  <div className="text-slate-500 font-mono text-[11.5px]">
                    {maskedAccount}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-[13.5px] transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isPending}
                className="flex-1 bg-[#03254c] hover:bg-[#021d3c] active:scale-[0.99] text-white font-bold py-3 rounded-xl text-[13.5px] shadow-sm transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-75"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function WithdrawalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#03254c]" />
      </div>
    }>
      <WithdrawContent />
    </Suspense>
  );
}
