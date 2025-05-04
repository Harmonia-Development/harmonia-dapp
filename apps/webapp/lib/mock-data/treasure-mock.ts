import {
  BenchMarkDataItem,
  AllocationData,
  efficiencyData,
} from "../types/treasure-types";

export const data: BenchMarkDataItem[] = [
  { category: "Governance", metricA: 90, metricB: 75, metricC: 95 },
  { category: "Treasury", metricA: 85, metricB: 70, metricC: 90 },
  { category: "Engagement", metricA: 80, metricB: 65, metricC: 92 },
  { category: "Growth", metricA: 82, metricB: 60, metricC: 88 },
  { category: "Innovation", metricA: 88, metricB: 72, metricC: 94 },
];

export const allocation: AllocationData[] = [
  { category: "Governance", Harmonia: 9.2, IndustryAverage: 7.5 },
  { category: "Treasury", Harmonia: 8.5, IndustryAverage: 7.0 },
  { category: "Engagement", Harmonia: 7.8, IndustryAverage: 6.5 },
  { category: "Growth", Harmonia: 8.0, IndustryAverage: 7.2 },
  { category: "Innovation", Harmonia: 8.9, IndustryAverage: 7.8 },
  { category: "Security", Harmonia: 9.0, IndustryAverage: 7.6 },
];

export const efficiency: efficiencyData[] = [
  { name: "Uniswap", score: 94, color: "#ef4444" }, // red-500
  { name: "MakerDAO", score: 92, color: "#f59e0b" }, // amber-500
  { name: "Harmonia", score: 91, color: "#8b5cf6" }, // violet-500
  { name: "Aave", score: 89, color: "#3b82f6" }, // blue-500
  { name: "Compound", score: 87, color: "#22c55e" }, // green-500
];
