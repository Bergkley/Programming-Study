import { useState } from 'react';

interface TaskFormProps {
  onAddTask: (title: string) => void;
}

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title);
      setTitle('');
    }
  };

  return (
    <div className='mb-8'>
      <form onSubmit={handleSubmit} className='relative'>
        <div className='flex gap-3'>
          <div className='flex-1 relative'>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder='What needs to be done?'
              className={`w-full px-4 py-3 pr-12 border-2 rounded-xl text-gray-700 placeholder-gray-400 transition-all duration-200 ${
                isFocused ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg' : 'border-gray-200 hover:border-gray-300'
              } focus:outline-none`}
            />
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
              <svg
                className={`w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
              </svg>
            </div>
          </div>
          <button
            type='submit'
            disabled={!title.trim()}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              title.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            } focus:outline-none focus:ring-4 focus:ring-blue-100`}
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};
