export const LoadingSpinner = () => {
  return (
    <div className='flex items-center justify-center py-12'>
      <div className='flex items-center gap-3'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        <span className='text-gray-600 font-medium'>Loading tasks...</span>
      </div>
    </div>
  );
};

