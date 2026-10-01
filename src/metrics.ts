// GENERATED FILE - DO NOT EDIT.
//
// Rendered from src/shared/metrics/registry.py in flexibl-payments-pipeline by
// scripts/dashboard/generate_metrics_typescript.py. Change the registry and
// regenerate; an edit here is overwritten and disagrees with what the API
// actually returns.
//
// 40 metrics (39 canonical), 55 alternative names.
//
// Why this exists: both UIs hardcode user-visible strings inline, so the same
// number was labelled "Effective Rate" on one screen, "Eff. rate" on another and
// "ER" in an export. Read METRIC_LABEL instead of typing the string again.

export type MetricQuantity =
  | 'cost_rate'
  | 'pricing_rate'
  | 'net_margin'
  | 'earnings'
  | 'revenue'
  | 'fees'
  | 'volume';

export type MetricVisibility = 'partner' | 'admin' | 'finley' | 'internal';

export interface MetricDefinition {
  /** Stable key. Feed definitions and the admin picker resolve by this. */
  id: string;
  /** The canonical name - use this in anything new. */
  name: string;
  /** The exact string to render. */
  uiLabel: string;
  /** Every other name this metric has been called, so a reader can get from
   *  what they saw on a screen to what it actually is. Recorded, not endorsed. */
  aliases: string[];
  /** The underlying number. Two metrics sharing one are the same thing measured
   *  differently - Payment Margin and Portfolio Margin Rate being the live case. */
  quantity: MetricQuantity | null;
  /** The field on the dashboard API response, where there is one. */
  apiField: string | null;
  visibility: MetricVisibility;
  /** Set when this is really another metric under a second name. */
  aliasOf?: string;
}

export const METRICS: readonly MetricDefinition[] = [
  {
    "id": "transaction_volume",
    "name": "Transaction Volume",
    "uiLabel": "Transaction Volume",
    "aliases": [
      "gpv",
      "Gpv",
      "GPV",
      "converted_gpv",
      "ConvertedGpv",
      "total_volume",
      "totalVolume",
      "TransactionVolume",
      "volume"
    ],
    "quantity": "volume",
    "apiField": "transaction_volume",
    "visibility": "partner"
  },
  {
    "id": "transaction_count",
    "name": "Number of Transactions",
    "uiLabel": "Number of Transactions",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "refund_volume",
    "name": "Refund",
    "uiLabel": "Refund",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "dispute_volume",
    "name": "Dispute",
    "uiLabel": "Dispute",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "effective_rate",
    "name": "Cost Effective Rate",
    "uiLabel": "Cost Effective Rate",
    "aliases": [
      "Effective Rate",
      "Effective Rate $",
      "ER",
      "ER (Effective Rate)",
      "Cost rate",
      "cost_rate",
      "Eff. rate",
      "blended rate",
      "Blended payment cost",
      "Payment cost",
      "cost_effective_rate",
      "averageRate"
    ],
    "quantity": "cost_rate",
    "apiField": "effective_rate",
    "visibility": "partner"
  },
  {
    "id": "payment_margin",
    "name": "Payment Margin",
    "uiLabel": "Payment Margin",
    "aliases": [
      "Net margin",
      "net_margin_rate",
      "payment_margin_rate",
      "Payment margin rate",
      "margin_rate",
      "Take Rate",
      "take_rate_bps",
      "Rate",
      "Platform margin (take rate)"
    ],
    "quantity": "net_margin",
    "apiField": "payment_margin",
    "visibility": "partner"
  },
  {
    "id": "refund_rate",
    "name": "Refund Rate",
    "uiLabel": "Refund Rate",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "dispute_rate",
    "name": "Dispute Rate",
    "uiLabel": "Dispute Rate",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "yoy_volume",
    "name": "YoY Volume",
    "uiLabel": "YoY Volume",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "yoy_count",
    "name": "YoY Count",
    "uiLabel": "YoY Count",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "transaction_average_size",
    "name": "Transaction Average Size",
    "uiLabel": "Transaction Average Size",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "processing_fees",
    "name": "Processing Fees",
    "uiLabel": "Processing Fees",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "network_fees",
    "name": "Network Fees",
    "uiLabel": "Network Fees",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "total_cost",
    "name": "Total Cost",
    "uiLabel": "Total Cost",
    "aliases": [
      "global_fees",
      "total_cost_all_fees",
      "fees",
      "Fees",
      "converted_fees",
      "payment_cost",
      "Net pmt cost"
    ],
    "quantity": "fees",
    "apiField": "total_cost_all_fees",
    "visibility": "partner"
  },
  {
    "id": "total_earnings",
    "name": "Total Earnings",
    "uiLabel": "Total Earnings",
    "aliases": [
      "platform_earnings",
      "Total Earning Collected $",
      "Core Earnings",
      "earning",
      "commission",
      "Commission",
      "transaction_revenue",
      "revenue",
      "Residual Revenue"
    ],
    "quantity": "earnings",
    "apiField": "earnings",
    "visibility": "partner"
  },
  {
    "id": "net_profit",
    "name": "Net Profit",
    "uiLabel": "Net Profit",
    "aliases": [
      "payment_revenue",
      "net_payment_revenue",
      "net payment revenue",
      "margin_eur",
      "margin_absolute"
    ],
    "quantity": "revenue",
    "apiField": "payment_revenue",
    "visibility": "partner"
  },
  {
    "id": "volume_fee",
    "name": "volume_fee",
    "uiLabel": "volume_fee",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "per_auth_fee",
    "name": "per_auth_fee",
    "uiLabel": "per_auth_fee",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "payments_fee",
    "name": "payments_fee",
    "uiLabel": "payments_fee",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "interchange",
    "name": "interchange",
    "uiLabel": "interchange",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "card_scheme",
    "name": "card_scheme",
    "uiLabel": "card_scheme",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "discount",
    "name": "discount",
    "uiLabel": "discount",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "other_fee",
    "name": "other_fee",
    "uiLabel": "other_fee",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "non_transactional_card_scheme",
    "name": "non_transactional_card_scheme",
    "uiLabel": "non_transactional_card_scheme",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "monthly_card_funding_margin",
    "name": "Monthly Card Funding Margin",
    "uiLabel": "Monthly Card Funding Margin",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "attach_rate",
    "name": "Attach Rate",
    "uiLabel": "Attach Rate",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "adoption_rate",
    "name": "Adoption Rate",
    "uiLabel": "Adoption Rate",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "active_adoption_rate",
    "name": "Active Adoption Rate",
    "uiLabel": "Active Adoption Rate",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "take_rate",
    "name": "Take Rate",
    "uiLabel": "Take Rate",
    "aliases": [],
    "quantity": "net_margin",
    "apiField": null,
    "visibility": "internal",
    "aliasOf": "payment_margin"
  },
  {
    "id": "percent_revenue_from_payments",
    "name": "Percent Revenue from Payments",
    "uiLabel": "Percent Revenue from Payments",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "payment_capture_rate",
    "name": "Payment Capture Rate",
    "uiLabel": "Payment Capture Rate",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "capturable_volume_opportunity",
    "name": "Capturable Volume Opportunity",
    "uiLabel": "Capturable Volume Opportunity",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "time_to_first_transaction",
    "name": "Time to First Transaction (T2FT)",
    "uiLabel": "Time to First Transaction (T2FT)",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "merchant_yoy_growth_rate",
    "name": "Merchant YoY Growth Rate",
    "uiLabel": "Merchant YoY Growth Rate",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "portfolio_gmv_growth_rate",
    "name": "Portfolio GMV Growth Rate",
    "uiLabel": "Portfolio GMV Growth Rate",
    "aliases": [],
    "quantity": null,
    "apiField": null,
    "visibility": "internal"
  },
  {
    "id": "pricing_rate",
    "name": "Pricing rate",
    "uiLabel": "Pricing rate",
    "aliases": [
      "Price",
      "vs price",
      "Merchant Cost rate",
      "merchant_rate_bps"
    ],
    "quantity": "pricing_rate",
    "apiField": null,
    "visibility": "admin"
  },
  {
    "id": "portfolio_margin_rate",
    "name": "Portfolio Margin Rate",
    "uiLabel": "Portfolio Margin Rate",
    "aliases": [],
    "quantity": "net_margin",
    "apiField": null,
    "visibility": "admin"
  },
  {
    "id": "all_in_processing_rate",
    "name": "All-In Processing Rate",
    "uiLabel": "All-In Processing Rate",
    "aliases": [],
    "quantity": "pricing_rate",
    "apiField": null,
    "visibility": "finley"
  },
  {
    "id": "wl_payment_margin",
    "name": "WL Payment Margin",
    "uiLabel": "WL Payment Margin",
    "aliases": [],
    "quantity": "net_margin",
    "apiField": null,
    "visibility": "finley"
  },
  {
    "id": "processor_side",
    "name": "Processor Side",
    "uiLabel": "Processor Side",
    "aliases": [],
    "quantity": "net_margin",
    "apiField": null,
    "visibility": "finley"
  }
] as const;

/** id -> the string to render. Use this instead of writing a label inline. */
export const METRIC_LABEL: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(METRICS.map((m) => [m.id, m.uiLabel])),
);

const BY_ANY_NAME = new Map<string, MetricDefinition>();
for (const m of METRICS) {
  for (const n of [m.id, m.name, m.uiLabel, m.apiField, ...m.aliases]) {
    if (n) {
      const key = String(n).trim().toLowerCase();
      if (!BY_ANY_NAME.has(key)) BY_ANY_NAME.set(key, m);
    }
  }
}

/**
 * Names that mean two different quantities depending on where you read them.
 * Deliberately absent from every alias list: resolveMetric returns undefined for
 * these, because picking one would be a guess presented as an answer.
 */
export const AMBIGUOUS_METRIC_NAMES: Readonly<
  Record<string, ReadonlyArray<{ metric: string; quantity: string; meaning: string; where: string }>>
> = Object.freeze({
  "margin": [
    {
      "metric": "payment_margin",
      "quantity": "net_margin",
      "meaning": "a RATE",
      "where": "api/schemas/analytics.py MonthlyMarginEffectiveRateItem (alias \"Margin\") and HighestMerchantPerformanceItem; the admin methodology dialog's rate column"
    },
    {
      "metric": "net_profit",
      "quantity": "revenue",
      "meaning": "an AMOUNT in currency",
      "where": "api/schemas/analytics.py MidMarginAnalysisItem.margin, from KPIFormulas.margin_absolute; the feed's margin_eur; the admin methodology dialog's euro column, adjacent to the rate one"
    }
  ]
});

/** Find a metric by any name it has ever been called. */
export function resolveMetric(name: string): MetricDefinition | undefined {
  return BY_ANY_NAME.get(String(name ?? '').trim().toLowerCase());
}

/** Both meanings of an ambiguous name, or undefined when it is unambiguous. */
export function metricAmbiguity(name: string) {
  return AMBIGUOUS_METRIC_NAMES[String(name ?? '').trim().toLowerCase()];
}
