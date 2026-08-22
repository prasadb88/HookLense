import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const VolumeChart = ({ data }) => {
  if (!data || !data.length) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E232F" vertical={false} />
          <XAxis dataKey="time" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F1117',
              borderColor: '#1E232F',
              borderRadius: '8px',
              color: '#FFF',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          />
          <Area
            type="monotone"
            dataKey="success"
            stroke="#10B981"
            fillOpacity={1}
            fill="url(#colorSuccess)"
            name="Successful"
          />
          <Area
            type="monotone"
            dataKey="failed"
            stroke="#EF4444"
            fillOpacity={1}
            fill="url(#colorFailed)"
            name="Failed"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeChart;
