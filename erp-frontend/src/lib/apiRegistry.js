import * as currencyApi from './api/currency-api';

export const ActionRegistry = {
  'CURRENCY_LIST': currencyApi.listCurrencies,
  'CURRENCY_GET': currencyApi.getCurrency,
  'CURRENCY_CREATE': currencyApi.createCurrency,
  'CURRENCY_UPDATE': currencyApi.updateCurrency,
  'CURRENCY_DELETE': currencyApi.deleteCurrency,
};

export const getApiAction = (actionKey) => {
  const action = ActionRegistry[actionKey];
  if (!action) {
    console.warn(`Action key "${actionKey}" not found in apiRegistry.`);
    return null;
  }
  return action;
};
