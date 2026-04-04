export default function LowStockTable({ products }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6">

      <h3 className="text-lg font-semibold mb-4">
        Low Stock Products
      </h3>

      <table className="w-full">

        <thead>
          <tr className="text-left border-b">
            <th>Name</th>
            <th>Barcode</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>
          {products?.map((p) => (
            <tr key={p._id} className="border-b">

              <td className="py-2">{p.name}</td>
              <td>{p.barcode}</td>
              <td className="text-red-500 font-semibold">
                {p.stockQuantity}
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}