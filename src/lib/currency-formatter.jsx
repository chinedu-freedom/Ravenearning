import { NumericFormat } from "react-number-format";
import { useFetchData } from "@/hooks/useApi";

export default function CurrencyFormatter({ amount }) {
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const symbol = settingsRes?.settings?.currency_symbol || "R";

  if (amount === undefined || amount === null) return null;

  return (
    <NumericFormat
      value={amount}
      displayType="text"
      thousandSeparator=","
      prefix={symbol}
    />
  );
}
