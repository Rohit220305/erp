export enum ProductionBatchStatus {
  Pending = 'Pending',
  StockReceived = 'StockReceived',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Processed = 'Processed',
  Cancelled = 'Cancelled',
}

export enum ProductionBatchProcessStatus {
  YetToStart = 'YetToStart',
  ReadytoStart = 'ReadytoStart',
  InProgress = 'InProgress',
  Skipped = 'Skipped',
  Completed = 'Completed',
  Resumed = 'Resumed',
  Paused = 'Paused',
}

export enum MaterialType {
  Entry = 'Entry',
  Exit = 'Exit',
}

export enum MaterialStatus {
  YetToOrder = 'YetToOrder',
  OrderPlaced = 'OrderPlaced',
  OrderReceived = 'OrderReceived',
  OrderPartiallyReceived = 'OrderPartiallyReceived',
}

export enum MaterialRequestStatus {
  Pending = 'Pending',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export enum LogType {
  Consumption = 'Consumption',
  Production = 'Production',
}

export enum ProductionBatchTimelineAction {
  Started = 'Started',
  Paused = 'Paused',
  Resumed = 'Resumed',
  Completed = 'Completed',
  Skipped = 'Skipped',
}
