"use client";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import CurrencyListCard from "@/components/currency/CurrencyListCard";
import CurrencyGridCard from "@/components/currency/CurrencyGridCard";
import CurrencyTableRow from "@/components/currency/CurrencyTableRow";
import currencyConfig from "@/config/currency.config.json";
import { listCurrencies, getCurrency, deleteCurrency } from "@/lib/api/currency-api";

export default function CurrencyListing() {
  return (
    <DynamicListing
      schema={currencyConfig}
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
      renderListCard={(item, setSelectedItemForDetails) => (
        <CurrencyListCard
          key={item.id}
          item={item}
          config={currencyConfig}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
      renderGridCard={(item, setSelectedItemForDetails) => (
        <CurrencyGridCard
          key={item.id}
          item={item}
          config={currencyConfig}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
