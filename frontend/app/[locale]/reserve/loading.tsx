export default function ReserveLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-200 rounded-md animate-pulse max-w-md mx-auto"></div>
          </div>
          
          <div className="space-y-8">
            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="h-6 bg-gray-200 rounded-md animate-pulse max-w-xs"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse max-w-sm mt-2"></div>
              </div>
              
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Date & Time Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="h-6 bg-gray-200 rounded-md animate-pulse max-w-xs"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
            
            {/* Party Details Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="h-6 bg-gray-200 rounded-md animate-pulse max-w-xs"></div>
              </div>
              
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-24 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-6">
              <div className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
