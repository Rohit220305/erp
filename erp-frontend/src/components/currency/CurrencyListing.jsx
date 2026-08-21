"use client";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import CurrencyTableRow from "@/components/currency/CurrencyTableRow";
import currencyConfig from "@/config/currency.config.json";
import { listCurrencies, getCurrency, deleteCurrency } from "@/lib/api/currency-api";
export default function CurrencyListing() {
  const customConfig = {
    ...currencyConfig,
    forceView: "table",
    headerIcons: currencyConfig.headerIcons
      ? currencyConfig.headerIcons.filter((icon) => icon !== "view")
      : ["refresh", "search", "filter"],
  };

  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listCurrencies}
      fetchItem={getCurrency}
      deleteFn={deleteCurrency}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <CurrencyTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}

