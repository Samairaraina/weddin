import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

function ConfidenceMeter({ value }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "confidence", value, fill: "#b58b38" }]} startAngle={180} endAngle={0}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background clockWise dataKey="value" cornerRadius={20} />
          <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-maroon text-3xl font-bold">
            {value}%
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ConfidenceMeter;
