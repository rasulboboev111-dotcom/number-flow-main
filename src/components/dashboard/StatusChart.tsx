import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatusChartProps {
  stats: any;
}

export function StatusChart({ stats }: StatusChartProps) {
  const data = [
    { name: 'Свободен', value: stats.freeNumbers, fill: 'hsl(142, 76%, 45%)' },
    { name: 'Активен', value: stats.activeNumbers, fill: 'hsl(0, 72%, 51%)' },
    { name: 'Забронирован', value: stats.reservedNumbers, fill: 'hsl(217, 91%, 60%)' },
    { name: 'Карантин', value: stats.quarantineNumbers, fill: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 card-hover">
      <h3 className="text-lg font-semibold mb-4">Статистика по статусам</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" horizontal={false} />
            <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 10%)',
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Номеров']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
