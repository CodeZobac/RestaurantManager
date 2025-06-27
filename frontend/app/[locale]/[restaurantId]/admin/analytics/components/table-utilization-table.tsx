'use client';

interface TableUtilizationTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export function TableUtilizationTable({ data }: TableUtilizationTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No table utilization data available
      </div>
    );
  }

  // Sort by confirmation rate descending
  const sortedData = [...data].sort((a, b) => (b.confirmation_rate || 0) - (a.confirmation_rate || 0));

  return (
    <div className="overflow-hidden">
      <div className="max-h-64 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Table
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confirmed
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((table, index) => (
              <tr key={table.id || index} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {table.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {table.capacity}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {table.total_reservations || 0}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {table.confirmed_reservations || 0}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <div className="flex-1 mr-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (table.confirmation_rate || 0) >= 80
                              ? 'bg-green-500'
                              : (table.confirmation_rate || 0) >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(table.confirmation_rate || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        (table.confirmation_rate || 0) >= 80
                          ? 'text-green-600'
                          : (table.confirmation_rate || 0) >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {(table.confirmation_rate || 0).toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedData.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No tables found
        </div>
      )}
    </div>
  );
}
