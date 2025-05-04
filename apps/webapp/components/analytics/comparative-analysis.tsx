"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { performance, data, doa } from "@/lib/mock-data/comparative-mock";

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  payload,
  label,
  active,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
      <p className="text-sm">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm">
          {`${entry.name}: ${entry.value}%`}
        </p>
      ))}
    </div>
  );
};

const CustomAlocationTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 text-white p-3 rounded shadow-md">
        <p className="text-sm font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-purple-300">
            {`Allocation : ${entry.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
const CustomEfficiencyTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white text-sm rounded p-2 shadow-md">
        <p className="font-semibold">{label}</p>
        <p className="text-green-400">Efficiency Ratio : {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export function ComparativeDashboard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">
          Comparative Analytics
        </CardTitle>
        <CardDescription>
          Benchmarking against other DAOs and industry standard
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pb-10 pt-0">
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Benchmark</TabsTrigger>
            <TabsTrigger value="performance">Performance Radar</TabsTrigger>
            <TabsTrigger value="doa">DAO Ranking</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="data" className="mt-0 pt-4">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#7c3aed"
                    dot={true}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Allocation Tab */}
          <TabsContent value="performance" className="mt-0 pt-4">
            <div className="w-full h-96 bg-black p-4 rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performance}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#ccc" />
                  <YAxis type="category" dataKey="name" stroke="#ccc" />
                  <Tooltip content={<CustomAlocationTooltip />} />
                  <Legend
                    wrapperStyle={{ color: "white" }}
                    formatter={(value) => (
                      <span className="text-sm text-white">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="current"
                    fill="#a855f7"
                    name="Current Quarter"
                    barSize={20}
                  />
                  <Bar
                    dataKey="previous"
                    fill="#8b5cf6"
                    name="Previous Quarter"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="doa" className="mt-0 pt-4">
            <div className="w-full h-96 bg-black p-4 rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={doa}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={<CustomEfficiencyTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#00FF99"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      stroke: "#fff",
                      strokeWidth: 1,
                      fill: "#00FF99",
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
