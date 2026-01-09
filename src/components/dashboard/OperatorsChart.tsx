import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const getOperatorColor = (name: string, index: number) => {
  const mapping: Record<string, string> = {
    'Мегафон Таджикистан': 'hsl(142, 71%, 45%)', // Green
    'Tcell': 'hsl(283, 39%, 53%)',               // Purple
    'Babilon-M': 'hsl(45, 93%, 47%)',            // Yellow
    'Zet-Mobile': 'hsl(199, 89%, 48%)',          // Blue
    'O Moda': 'hsl(0, 72%, 51%)',                // Red
    'TK Mobile': 'hsl(210, 100%, 50%)',          // Bright Blue
    'Somoncom': 'hsl(24, 94%, 50%)',             // Orange
    'Indigo Tajikistan': 'hsl(262, 80%, 50%)',    // Indigo
  };

  const normalizedName = name.trim();
  if (mapping[normalizedName]) return mapping[normalizedName];

  // Fallback palette
  const PALETTE = ['hsl(183, 74%, 44%)', 'hsl(270, 70%, 60%)', 'hsl(45, 93%, 47%)', 'hsl(0, 72%, 51%)'];
  return PALETTE[index % PALETTE.length];
};

export function OperatorsChart() {
  const { data: operators = [] } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => (await api.get('/operators')).data,
  });

  const data = operators.map((op: any, index: number) => ({
    name: op.name,
    value: op.numbersCount || 0,
    color: getOperatorColor(op.name, index),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5 card-hover">
      <h3 className="text-lg font-semibold mb-4">Распределение по операторам</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 10%)',
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Номеров']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
