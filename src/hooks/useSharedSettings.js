import { useState, useEffect } from "react";

export function useSharedSettings() {
  const [currency, setCurrencyState] = useState("USDT");
  const [showBalance, setShowBalanceState] = useState(true);

  useEffect(() => {
    // Read initial values from localStorage
    const savedCurrency = localStorage.getItem("preferredCurrency");
    const savedVisibility = localStorage.getItem("balanceVisible");
    
    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedVisibility !== null) setShowBalanceState(savedVisibility === "true");

    // Listen for custom events to sync state across components
    const handleCustomChange = (e) => {
      const { key, value } = e.detail;
      if (key === "preferredCurrency") setCurrencyState(value);
      if (key === "balanceVisible") setShowBalanceState(value === "true");
    };

    window.addEventListener("settingsChanged", handleCustomChange);
    return () => window.removeEventListener("settingsChanged", handleCustomChange);
  }, []);

  const setCurrency = (val) => {
    setCurrencyState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem("preferredCurrency", newVal);
      window.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: { key: 'preferredCurrency', value: newVal }
      }));
      return newVal;
    });
  };

  const setShowBalance = (val) => {
    setShowBalanceState(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem("balanceVisible", newVal.toString());
      window.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: { key: 'balanceVisible', value: newVal.toString() }
      }));
      return newVal;
    });
  };

  return { currency, setCurrency, showBalance, setShowBalance };
}
