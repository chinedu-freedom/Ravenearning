"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  Landmark, 
  CreditCard, 
  ChevronRight, 
  Search, 
  X, 
  Check, 
  ShieldCheck,
  Info
} from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";

const SOUTH_AFRICAN_BANKS = [
  "ABSA Bank",
  "African Bank",
  "Albaraka Bank",
  "Bank of Athens (Grobank)",
  "Bidvest Bank",
  "Capitec Bank",
  "Discovery Bank",
  "First National Bank (FNB)",
  "Grindrod Bank",
  "HBZ Bank",
  "Investec Bank",
  "Mercantile Bank",
  "Nedbank",
  "Old Mutual Money Account",
  "Postbank",
  "Sasfin Bank",
  "Standard Bank",
  "TymeBank",
  "Ubank",
  "VBS Mutual Bank",
];

export default function BindAccountPage() {
  const router = useRouter();

  const [realname, setRealname] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user data
  const { data: userRes, refetch: refetchUser } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;

  // Pre-fill existing bank info if present
  useEffect(() => {
    if (user?.bank_details) {
      setRealname(user.bank_details.account_name || user.bank_details.realname || "");
      setSelectedBank(user.bank_details.bank_name || "");
      setAccountNumber(user.bank_details.account_number || "");
    } else if (user) {
      setRealname(user.bank_account_name || user.full_name || "");
      setSelectedBank(user.bank_name || "");
      setAccountNumber(user.bank_account_number || "");
    }
  }, [user]);

  const bindMutation = usePost("/users/bank-details");

  const filteredBanks = SOUTH_AFRICAN_BANKS.filter((b) =>
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!realname.trim()) {
      toast.error("Please enter cardholder name");
      return;
    }
    if (!selectedBank) {
      toast.error("Please select a bank");
      return;
    }
    if (!accountNumber.trim()) {
      toast.error("Please enter bank account number");
      return;
    }
    if (accountNumber.trim().length < 10) {
      toast.error("Account number should be at least 10 digits");
      return;
    }

    try {
      setIsSubmitting(true);
      await bindMutation.mutateAsync({
        account_name: realname.trim(),
        bank_name: selectedBank,
        account_number: accountNumber.trim(),
      });

      await refetchUser();
      setTimeout(() => {
        router.push("/dashboard/account");
      }, 1000);
    } catch (error) {
      // Handled by usePost hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-24 select-none">
      
      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          onClick={() => router.push("/dashboard/account")}
          className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors text-gray-300 border border-white/5 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[16px] font-bold">
          Linked Withdrawal Account
        </h1>
        <div className="w-9" />
      </div>

      <div className="px-4 py-4 space-y-4 max-w-[480px] mx-auto w-full">

        {/* Hero Card - Clean Vibrant Blue */}
        <div className="bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] rounded-[22px] p-5 text-white shadow-xl shadow-sky-950/20 relative overflow-hidden border border-sky-400/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs border border-white/25 text-white px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wider mb-2.5">
            <ShieldCheck size={12} className="text-sky-200" />
            <span>SECURE VAULT</span>
          </div>

          <h2 className="text-white text-[20px] font-bold tracking-tight mb-1">
            Bank Account Binding
          </h2>
          <p className="text-sky-100 text-[12.5px] leading-relaxed">
            Verify your withdrawal destination before submitting transfer requests.
          </p>
        </div>

        {/* Main Input Form Card */}
        <form onSubmit={handleSubmit} className="bg-[#111827] rounded-[20px] p-5 border border-white/5 shadow-md space-y-4">
          
          {/* Realname Field */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-white/90 block">
              Realname
            </label>
            <div className="flex items-center gap-3 bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 focus-within:border-[#0284c7] transition-all">
              <User size={18} className="text-[#38bdf8] shrink-0" />
              <input
                type="text"
                value={realname}
                onChange={(e) => setRealname(e.target.value)}
                placeholder="Enter cardholder name"
                className="bg-transparent outline-none text-white text-[13.5px] w-full placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Bank Field */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-white/90 block">
              Bank
            </label>
            <button
              type="button"
              onClick={() => setShowBankModal(true)}
              className="w-full flex items-center justify-between bg-[#0b0f19] border border-white/10 rounded-[12px] px-3.5 py-3 cursor-pointer hover:border-[#0284c7]/50 transition-all text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Landmark size={18} className="text-[#38bdf8] shrink-0" />
                <span className={`text-[13.5px] truncate ${selectedBank ? "text-white font-medium" : "text-gray-500"}`}>
                  {selectedBank || "Choose bank"}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-400 shrink-0 ml-2" />
            </button>
          </div>

          {/* Bank Account Field */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-white/90 block">
              Bank Account
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:opacity-95 text-white font-bold py-3.5 rounded-[12px] text-[15px] shadow-lg shadow-sky-500/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Save Bank Account"
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
              1. Please ensure you enter the correct bank account information before linking your account.
            </p>
            <p>
              2. After successful linking, please double-check that the linked bank account information is correct to avoid withdrawal failure!
            </p>
            <p>
              3. If you encounter any problems during the linking process, please contact online customer service for assistance!
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
                  <button onClick={() => setBankSearch("")}>
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
