"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/features/admin/components/ui/card";
import type {
  GeneralActivityPoint,
  ReviewsStatusPoint,
} from "../analytics-types";

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid var(--border-soft)",
  backgroundColor: "var(--card)",
};
const labelStyle = { color: "var(--text-muted)", marginBottom: 4 };

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

export function GeneralActivityChart({
  data,
  rangeLabel,
  secondaryLineLabel = "Nuevos usuarios",
}: {
  data: GeneralActivityPoint[];
  rangeLabel: string;
  secondaryLineLabel?: string;
}) {
  if (data.length === 0) {
    return (
      <Card className="col-span-full xl:col-span-8 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{`Actividad (${rangeLabel})`}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sin actividad registrada en este periodo.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full xl:col-span-8 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{`Actividad (${rangeLabel})`}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Barras: actividad de sesión · Líneas: reseñas y {secondaryLineLabel.toLowerCase()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" opacity={0.5} />
              <XAxis dataKey="periodo" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} dy={8} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar yAxisId="left" name="Actividad de sesión" dataKey="usuarios" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Line yAxisId="right" name="Reseñas" type="monotone" dataKey="resenas" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" name={secondaryLineLabel} type="monotone" dataKey="promociones" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function GeneralReviewsStatusChart({ data }: { data: ReviewsStatusPoint[] }) {
  if (data.length === 0) {
    return (
      <Card className="col-span-full xl:col-span-4 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Estado de reseñas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sin reseñas en el sistema.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full xl:col-span-4 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Estado de reseñas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${asNumber(value)}%`, "Participación"]} />
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                outerRadius={94}
                paddingAngle={3}
                dataKey="valor"
                nameKey="estado"
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
