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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { data, allocation, efficiency } from "@/lib/mock-data/treasure-mock";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload as any; // Cast to any to access custom properties
    return (
      <div className="bg-gray-800 text-white text-sm p-2 rounded shadow">
        <p className="font-semibold">{item.name}</p>
        <p>Score : {item.score}/100</p>
      </div>
    );
  }

  return null;
};

export function TreasuryDashboard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">
          Treasury Performance
        </CardTitle>
        <CardDescription>
          Financial metrics and Treasury efficiency
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pb-10 pt-0">
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Performance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          {/* benchmark */}
          <TabsContent value="data" className="mt-0 pt-4">
            <div className="h-[400px] w-full">
              {" "}
              {/* Ensure fixed height */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="category" stroke="#ccc" />
                  <YAxis stroke="#ccc" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f1f1f",
                      border: "none",
                      color: "white",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.1)" }}
                  />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                  <Bar dataKey="metricA" fill="#A259FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="metricB" fill="#7C82A1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="metricC" fill="#00FF99" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="mt-0 pt-4">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={allocation}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="category" stroke="#ccc" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#555" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f1f1f",
                      border: "none",
                      color: "#fff",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      name === "Harmonia" ? "Harmonia" : "Industry Average",
                    ]}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Radar
                    name="Harmonia"
                    dataKey="Harmonia"
                    stroke="#A259FF"
                    fill="#A259FF"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Industry Average"
                    dataKey="IndustryAverage"
                    stroke="#7C82A1"
                    fill="#7C82A1"
                    fillOpacity={0.3}
                  />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="mt-0 pt-4">
            <div className="w-full h-[400px] bg-black p-4 rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={efficiency}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                >
                  <XAxis
                    type="number"
                    domain={[80, 100]}
                    tick={{ fill: "#fff", fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#fff", fontSize: 14 }}
                    width={100}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "#ffffff22" }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {efficiency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
