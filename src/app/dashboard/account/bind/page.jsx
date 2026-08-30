"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Globe,
  Wallet,
  CheckCircle2
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
      if (user.full_name && !actualName) setActualName(user.full_name);
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

    if (!password) {
      toast.error("Please enter your withdrawal password to confirm");
      return;
    }

    if (walletType === "usdt") {
      if (!usdtAddress.trim()) {
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
            toast.success("USDT Wallet address saved successfully!");
            refetchUser();
            router.push("/dashboard/account");
          }
        }
      );
      return;
    }

    // Default Bank Account validation
    if (!actualName.trim()) {
      toast.error("Please enter actual name");
      return;
    }
    if (!selectedBank) {
      toast.error("Please select your bank name");
      return;
    }
    if (!accountNumber.trim()) {
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
          toast.success("Bank account saved successfully!");
          refetchUser();
          router.push("/dashboard/account");
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto [&::-webkit-scrollbar]:hidden pb-20 select-none">
      
      {/* Header Bar */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          type="button"
          onClick={() => router.push("/dashboard/account")}
          className="mr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-white/90 text-[16px] font-bold tracking-tight">
          Bind Wallet / Payment Method
        </h1>
      </div>

      <div className="px-4 py-4 max-w-[480px] mx-auto w-full space-y-4">
        
        {/* Wallet Type Switcher Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* South Africa Bank Tab */}
          <button
            type="button"
            onClick={() => setWalletType("bank")}
            className={`p-3.5 rounded-[16px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
              walletType === "bank"
                ? "bg-[#0284c7]/10 border-[#0284c7] ring-1 ring-[#0284c7]/50"
                : "bg-[#111827] border-white/5 text-gray-400 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#0284c7]/20 text-[#38bdf8] flex items-center justify-center">
                <Landmark size={17} />
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                walletType === "bank" ? "border-[#38bdf8] bg-[#0284c7]" : "border-gray-600"
              }`}>
                {walletType === "bank" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <div>
              <span className="text-white font-bold text-[13.5px] block leading-tight">
                South Africa Bank
              </span>
              <span className="text-gray-400 text-[11px]">
                ZAR Direct Payout
              </span>
            </div>
          </button>

          {/* USDT Crypto Wallet Tab */}
          <button
            type="button"
            onClick={() => setWalletType("usdt")}
            className={`p-3.5 rounded-[16px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
              walletType === "usdt"
                ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50"
                : "bg-[#111827] border-white/5 text-gray-400 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Globe size={17} />
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                walletType === "usdt" ? "border-amber-400 bg-amber-500" : "border-gray-600"
              }`}>
                {walletType === "usdt" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <div>
              <span className="text-white font-bold text-[13.5px] block leading-tight">
                USDT Wallet
              </span>
              <span className="text-amber-400 text-[11px] font-semibold">
                TRC20 / BEP20 Crypto
              </span>
            </div>
          </button>
        </div>

        {/* Existing Bound Info Card if available */}
        {((walletType === "bank" && bankDetails.account_number) || (walletType === "usdt" && bankDetails.usdt_address)) && (
          <div className="bg-[#111827] border border-[#38bdf8]/20 rounded-[18px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0284c7]/20 text-[#38bdf8] flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-gray-400 block font-medium">Currently Bound {walletType === "usdt" ? "USDT Address" : "Bank Account"}</span>
              <span className="text-white font-bold text-[13.5px] truncate block">
                {walletType === "usdt" 
                  ? `${bankDetails.usdt_network || "TRC20"}: ${bankDetails.usdt_address}`
                  : `${bankDetails.bank_name} - ${bankDetails.account_number}`}
              </span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-[#111827] rounded-[20px] p-5 border border-white/5 shadow-md space-y-4">
          
          {walletType === "bank" ? (
            /* South Africa Bank Form Fields */
            <>
              {/* Account Holder Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-white/90 block">
                  Actual Name / Account Holder
                </label>
                <div className="flex items-center gap-3 bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
                  <User size={18} className="text-[#38bdf8] shrink-0" />
                  <input
                    type="text"
                    value={actualName}
                    onChange={(e) => setActualName(e.target.value)}
                    placeholder="Enter full name on bank account"
                    className="bg-transparent outline-none text-white text-[13.5px] w-full placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Select Bank Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-white/90 block">
                  Bank Name
                </label>
                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  className="w-full flex items-center justify-between bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 cursor-pointer hover:border-[#0284c7]/50 transition-all text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Landmark size={18} className="text-[#38bdf8] shrink-0" />
                    <span className={`text-[13.5px] truncate ${selectedBank ? "text-white font-medium" : "text-gray-500"}`}>
                      {selectedBank || "Choose South Africa Bank"}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 shrink-0 ml-2" />
                </button>
              </div>

              {/* Bank Account Number */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-white/90 block">
                  Bank Account Number
                </label>
                <div className="flex items-center gap-3 bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
                  <CreditCard size={18} className="text-[#38bdf8] shrink-0" />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter your bank account number"
                    className="bg-transparent outline-none text-white text-[13.5px] w-full placeholder:text-gray-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* USDT Crypto Wallet Form Fields */
            <>
              {/* Select Network */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-white/90 block">
                  Select Crypto Network
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["TRC20", "BEP20"].map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setUsdtNetwork(net)}
                      className={`py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all cursor-pointer ${
                        usdtNetwork === net
                          ? "bg-[#0284c7] text-white border-[#0284c7] shadow-sm"
                          : "bg-[#0b0f19] text-gray-400 border-white/10 hover:border-white/20"
                      }`}
                    >
                      USDT-{net}
                    </button>
                  ))}
                </div>
              </div>

              {/* USDT Address Input */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-white/90 block">
                  USDT ({usdtNetwork}) Receiving Address
                </label>
                <div className="flex items-center gap-3 bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
                  <Wallet size={18} className="text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={usdtAddress}
                    onChange={(e) => setUsdtAddress(e.target.value)}
                    placeholder={`Enter your ${usdtNetwork} USDT wallet address...`}
                    className="bg-transparent outline-none text-white font-mono text-[13px] w-full placeholder:text-gray-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Withdrawal Password Confirmation Field */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[13px] font-semibold text-white/90 block">
              Withdrawal Password
            </label>
            <div className="flex items-center gap-3 bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
              <Lock size={18} className="text-[#38bdf8] shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter withdrawal password to confirm"
                className="bg-transparent outline-none text-white text-[13.5px] w-full placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white shrink-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:opacity-95 text-white font-bold py-3.5 rounded-[12px] text-[15px] shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              walletType === "usdt" ? "Save USDT Wallet Address" : "Save Bank Account"
            )}
          </button>

        </form>

        {/* Friendly Reminder Notice Card */}
        <div className="bg-[#111827] rounded-[20px] p-5 border border-white/5 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#0284c7]/20 border border-[#0284c7]/30 text-[#38bdf8] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
              NOTICE
            </span>
            <h3 className="text-white/90 font-bold text-[14px]">
              Friendly Reminder:
            </h3>
          </div>

          <div className="space-y-2 text-[12px] text-gray-300 leading-relaxed pl-1">
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

      {/* Bank Selection Bottom Sheet Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowBankModal(false)}
          />

          <div className="relative bg-[#111827] w-full max-w-[480px] mx-auto rounded-t-[24px] border-t border-white/10 overflow-hidden flex flex-col max-h-[75vh] z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white text-[15px] font-bold">Select Bank</h3>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-white/5">
              <div className="flex items-center gap-2 bg-[#0b0f19] border border-white/10 rounded-[10px] px-3 py-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bank name..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="bg-transparent outline-none text-white text-[13px] w-full placeholder:text-gray-500"
                />
                {bankSearch && (
                  <button type="button" onClick={() => setBankSearch("")}>
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Bank List */}
            <div className="overflow-y-auto flex-1 p-2 divide-y divide-white/5">
              {filteredBanks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-[13px]">
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
                      className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer rounded-lg ${
                        isSelected ? "bg-[#0284c7]/20 text-[#38bdf8]" : "text-white/90"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Landmark size={16} className={isSelected ? "text-[#38bdf8]" : "text-gray-400"} />
                        <span className="text-[13.5px] font-medium">{bank}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-[#38bdf8]" />}
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
