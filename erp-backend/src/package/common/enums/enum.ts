export enum Status {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum UsageType {
  FinishedTradable = 'finished_tradable',
  ConsumableNonTradable = 'consumable_non_tradable',
  WipNonTradable = 'wip_non_tradable',
  NonConsumableAsset = 'non_consumable_asset',
}

export enum InventoryType {
  Bulk = 'bulk',
  Discrete = 'discrete',
}

export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

export enum ShelfLifeUnit {
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export enum ExecutionType {
  Flexible = 'Flexible',
  Sequential = 'Sequential',
}