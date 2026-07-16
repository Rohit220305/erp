export const ActionRegistry = {
  // We will populate this with actual API service imports as we build the modules
  // Example: 
  // 'CURRENCY_LIST': currencyApi.listCurrencies,
  // 'CURRENCY_CREATE': currencyApi.createCurrency,
};

export const getApiAction = (actionKey) => {
  const action = ActionRegistry[actionKey];
  if (!action) {
    console.warn(`Action key "${actionKey}" not found in apiRegistry.`);
    return null;
  }
  return action;
};
