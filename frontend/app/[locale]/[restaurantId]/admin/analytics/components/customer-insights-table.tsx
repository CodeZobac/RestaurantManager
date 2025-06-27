'use client';

import { format, parseISO } from 'date-fns';

interface CustomerInsightsTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export function CustomerInsightsTable({ data }: CustomerInsightsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No customer insights data available
      </div>
    );
  }

  // Sort by total reservations descending
  const sortedData = [...data].sort((a, b) => (b.total_reservations || 0) - (a.total_reservations || 0));

  const getCustomerTypeBadge = (type: string) => {
    const styles = {
      'VIP Customer': 'bg-purple-100 text-purple-800',
      'Regular Customer': 'bg-blue-100 text-blue-800',
      'New Customer': 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reservations
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Party
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Visit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((customer, index) => (
              <tr key={customer.id || index} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </div>
                    {customer.email && (
                      <div className="text-sm text-gray-500">
                        {customer.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {getCustomerTypeBadge(customer.customer_type)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {customer.total_reservations || 0}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {customer.completed_visits || 0}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`font-semibold ${getCompletionRateColor(customer.completion_rate || 0)}`}>
                    {(customer.completion_rate || 0).toFixed(1)}%
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {(customer.avg_party_size || 0).toFixed(1)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {customer.last_visit ? format(parseISO(customer.last_visit), 'MMM dd, yyyy') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedData.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No customers found
        </div>
      )}
      
      {/* Summary Footer */}
      {sortedData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{sortedData.length}</div>
            <div className="text-gray-500">Total Customers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">
              {sortedData.filter(c => c.customer_type === 'VIP Customer').length}
            </div>
            <div className="text-gray-500">VIP Customers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {sortedData.filter(c => c.customer_type === 'Regular Customer').length}
            </div>
            <div className="text-gray-500">Regular Customers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {sortedData.filter(c => c.customer_type === 'New Customer').length}
            </div>
            <div className="text-gray-500">New Customers</div>
          </div>
        </div>
      )}
    </div>
  );
}
