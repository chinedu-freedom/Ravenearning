"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Landmark, 
  Lock, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Search, 
  X, 
  Check, 
  Wallet,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";

const SOUTH_AFRICA_BANKS = [
  "Capitec Bank",
  "First National Bank (FNB)",
  "ABSA Bank",
  "Standard Bank",
  "Nedbank",
  "TymeBank",
  "African Bank",
  "Discovery Bank",
  "Bank Zero",
  "Bidvest Bank",
  "Grindrod Bank",
  "SASFIN Bank"
];

export default function BindWalletPage() {
  const router = useRouter();

  // Selected Wallet Type: "bank" | "usdt"
  const [walletType, setWalletType] = useState("bank");

  // Bank Form State
  const [actualName, setActualName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // USDT Form State
  const [usdtNetwork, setUsdtNetwork] = useState("TRC20");
  const [usdtAddress, setUsdtAddress] = useState("");

  // Common Password & UI State
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  // Fetch current user details & saved bank/usdt details
  const { data: userRes, refetch: refetchUser } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  const bankDetails = user?.bank_details || {};

  // Pre-fill existing saved bank & usdt details
  useEffect(() => {
    if (user) {
      if (bankDetails.account_name) setActualName(bankDetails.account_name);
      if (bankDetails.bank_name) setSelectedBank(bankDetails.bank_name);
      if (bankDetails.account_number) setAccountNumber(bankDetails.account_number);
      if (bankDetails.usdt_address) setUsdtAddress(bankDetails.usdt_address);
      if (bankDetails.usdt_network) setUsdtNetwork(bankDetails.usdt_network);
    }
  }, [user, bankDetails]);

  // Filter bank search
  const filteredBanks = SOUTH_AFRICA_BANKS.filter((b) =>
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const { mutate: saveDetails, isPending: isSubmitting } = usePost("/users/bank-details", ["user-profile"]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user?.has_withdrawal_pin) {
      toast.dismiss();
      toast.error("Please create your withdrawal password first in Account Settings");
      router.push("/dashboard/account/withdrawal-password");
      return;
    }

    if (!password) {
      toast.dismiss(); 
      toast.error("Please enter your withdrawal password to confirm");
      return;
    }

    if (walletType === "usdt") {
      if (!usdtAddress.trim()) {
        toast.dismiss(); 
        toast.error("Please enter your USDT wallet address");
        return;
      }

      saveDetails(
        {
          wallet_type: "usdt",
          usdt_address: usdtAddress.trim(),
          usdt_network: usdtNetwork,
          password
        },
        {
          onSuccess: () => {
            toast.dismiss();
            toast.success("USDT Wallet linked successfully");
            refetchUser();
            router.push("/dashboard/account");
          }
        }
      );
      return;
    }

    // Default Bank Account validation
    if (!actualName.trim()) {
      toast.dismiss(); 
      toast.error("Please enter actual name");
      return;
    }
    if (!selectedBank) {
      toast.dismiss(); 
      toast.error("Please select your bank name");
      return;
    }
    if (!accountNumber.trim()) {
      toast.dismiss(); 
      toast.error("Please enter your bank account number");
      return;
    }

    saveDetails(
      {
        wallet_type: "bank",
        account_name: actualName.trim(),
        bank_name: selectedBank,
        account_number: accountNumber.trim(),
        password
      },
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success("Bank account linked successfully");
          refetchUser();
          router.push("/dashboard/account");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start select-none">
      
      {/* Top Header Bar - White background, Text on left, Logo on right */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100/90 px-5 h-16 flex items-center justify-between shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/account")}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-slate-900 text-[19px] sm:text-[21px] font-black tracking-tight leading-tight">
            Bind Payment Method
          </h1>
        </div>
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200/80 shrink-0"
          />
        </div>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24 select-none">
        
        {/* Destination Type Selection using Full Width Radio Selectable Divs */}
        <div className="space-y-2">
          <label className="text-slate-900 text-[14px] font-bold tracking-tight block px-0.5">
            Select Destination Type
          </label>

          <div className="space-y-2">
            {/* South Africa Bank Option */}
            <div
              onClick={() => setWalletType("bank")}
              className={`w-full p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                walletType === "bank"
                  ? "bg-slate-50/80 border-[#0f172a] shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  walletType === "bank" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <Landmark size={18} />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-slate-900 block leading-tight">
                    South Africa Bank (Rand)
                  </span>
                  <span className="text-[11.5px] text-slate-500 font-medium">
                    Local South African bank account payout
                  </span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                walletType === "bank" ? "border-[#0f172a]" : "border-slate-300"
              }`}>
                {walletType === "bank" && (
                  <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
                )}
              </div>
            </div>

            {/* USDT Crypto Option */}
            <div
              onClick={() => setWalletType("usdt")}
              className={`w-full p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                walletType === "usdt"
                  ? "bg-slate-50/80 border-[#0f172a] shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  walletType === "usdt" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <Wallet size={18} />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-slate-900 block leading-tight">
                    USDT Wallet (Crypto)
                  </span>
                  <span className="text-[11.5px] text-slate-500 font-medium">
                    TRC20 / BEP20 cryptocurrency address
                  </span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                walletType === "usdt" ? "border-[#0f172a]" : "border-slate-300"
              }`}>
                {walletType === "usdt" && (
                  <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Existing Bound Info Card if available */}
        {((walletType === "bank" && bankDetails.account_number) || (walletType === "usdt" && bankDetails.usdt_address)) && (
          <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11.5px] text-slate-500 block font-medium">
                Currently Bound {walletType === "usdt" ? "USDT Address" : "Bank Account"}
              </span>
              <span className="text-slate-900 font-bold text-[13.5px] truncate block mt-0.5">
                {walletType === "usdt" 
                  ? `${bankDetails.usdt_network || "TRC20"}: ${bankDetails.usdt_address}`
                  : `${bankDetails.bank_name} - ${bankDetails.account_number}`}
              </span>
            </div>
          </div>
        )}


        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-5 border border-slate-200/90 shadow-2xs space-y-4">
          
          {walletType === "bank" ? (
            /* South Africa Bank Form Fields */
            <>
              {/* Account Holder Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-900 block">
                  Actual Name / Account Holder
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 transition-all">
                  <User size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={actualName}
                    onChange={(e) => setActualName(e.target.value)}
                    placeholder="Enter full name on bank account"
                    className="bg-transparent outline-none text-slate-900 text-[13.5px] font-semibold w-full placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Select Bank Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-900 block">
                  Bank Name
                </label>
                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3 cursor-pointer hover:border-slate-300 hover:bg-white transition-all text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Landmark size={18} className="text-slate-400 shrink-0" />
                    <span className={`text-[13.5px] truncate font-semibold ${selectedBank ? "text-slate-900" : "text-slate-400 font-normal"}`}>
                      {selectedBank || "Choose South Africa Bank"}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 shrink-0 ml-2" />
                </button>
              </div>

              {/* Bank Account Number */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-900 block">
                  Bank Account Number
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 transition-all">
                  <CreditCard size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter your bank account number"
                    className="bg-transparent outline-none text-slate-900 font-mono text-[13.5px] font-semibold w-full placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </>
          ) : (
            /* USDT Crypto Wallet Form Fields */
            <>
              {/* Select Network */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-900 block">
                  Select Crypto Network
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["TRC20", "BEP20"].map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setUsdtNetwork(net)}
                      className={`py-2.5 px-3 rounded-md border text-[13px] font-bold transition-all cursor-pointer ${
                        usdtNetwork === net
                          ? "bg-[#0f172a] text-white border-[#0f172a] shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      USDT-{net}
                    </button>
                  ))}
                </div>
              </div>

              {/* USDT Address Input */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-900 block">
                  USDT ({usdtNetwork}) Receiving Address
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 transition-all">
                  <Wallet size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={usdtAddress}
                    onChange={(e) => setUsdtAddress(e.target.value)}
                    placeholder={`Enter your ${usdtNetwork} USDT wallet address...`}
                    className="bg-transparent outline-none text-slate-900 font-mono text-[13px] font-semibold w-full placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </>
          )}

          {/* Withdrawal Password Authorization Field */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[13px] font-bold text-slate-900 block">
              Withdrawal Password
            </label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3 focus-within:bg-white focus-within:border-slate-400 transition-all">
              <Lock size={18} className="text-slate-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter withdrawal password to confirm"
                className="bg-transparent outline-none text-slate-900 text-[13.5px] font-semibold w-full placeholder:text-slate-400 placeholder:font-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11.5px] text-slate-500 font-normal pl-0.5">
              Enter your existing withdrawal password to authorize and save your payout details.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0f172a] hover:bg-[#021d3c] text-white font-bold py-3.5 rounded-md text-[14.5px] shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              walletType === "usdt" ? "Save USDT Wallet Address" : "Save Bank Account"
            )}
          </button>

        </form>

        {/* Important Guidelines Card */}
        <div className="bg-white rounded-lg p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#0f172a] font-bold text-[14px]">
            <Info size={16} className="shrink-0 text-[#0f172a]" />
            <span>Important Guidelines</span>
          </div>

          <div className="space-y-2 text-[12px] text-slate-600 leading-relaxed pl-1 font-normal">
            <p>
              1. Please ensure you double-check your account details before saving to avoid withdrawal delays.
            </p>
            <p>
              2. Both South Africa Bank Accounts and USDT Crypto Wallet addresses are supported for payouts.
            </p>
            <p>
              3. If you encounter any problems during the binding process, please contact online customer support.
            </p>
          </div>
        </div>

      </div>

      {/* Bank Selection Bottom Sheet Modal - Light Theme */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowBankModal(false)}
          />

          <div className="relative bg-white w-full max-w-[480px] mx-auto rounded-t-[20px] border-t border-slate-200 overflow-hidden flex flex-col max-h-[75vh] z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-900 text-[16px] font-bold">Select Bank</h3>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search bank name..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="bg-transparent outline-none text-slate-900 text-[13px] w-full placeholder:text-slate-400 font-medium"
                />
                {bankSearch && (
                  <button type="button" onClick={() => setBankSearch("")}>
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Bank List */}
            <div className="overflow-y-auto flex-1 p-2 divide-y divide-slate-100">
              {filteredBanks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-[13px]">
                  No bank found matching "{bankSearch}"
                </div>
              ) : (
                filteredBanks.map((bank) => {
                  const isSelected = selectedBank === bank;
                  return (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => {
                        setSelectedBank(bank);
                        setShowBankModal(false);
                        setBankSearch("");
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer rounded-lg ${
                        isSelected ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Landmark size={16} className={isSelected ? "text-[#0f172a]" : "text-slate-400"} />
                        <span className="text-[13.5px]">{bank}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-[#0f172a]" />}
                    </button>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
