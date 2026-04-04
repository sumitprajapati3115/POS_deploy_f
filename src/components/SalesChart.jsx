import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({ data }) {

  const chartData = data.map((item) => ({
    date: new Date(item._id).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    sales: item.totalSales,
  }));

  return (

    <div className="bg-white p-4 rounded-lg shadow">

      <h2 className="text-lg font-semibold mb-4">
        Last 7 Days Sales
      </h2>

      <div className="h-64">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="sales"
              stroke="#16a34a"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}