import { type Task } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <div
      className={`group flex items-center gap-4 p-4 bg-white border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
        task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Custom Checkbox */}
      <div className='relative'>
        <input type='checkbox' aria-label={task.title} checked={task.completed} onChange={() => onToggle(task.id)} className='sr-only' />
        <div
          onClick={() => onToggle(task.id)}
          className={`w-6 h-6 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {task.completed && (
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className='flex-1 min-w-0'>
        <span
          className={`block text-lg font-medium transition-all duration-200 ${
            task.completed ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
        >
          {task.title}
        </span>
        <div className='flex items-center gap-2 mt-1'>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              task.completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {task.completed ? 'Completed' : 'Pending'}
          </span>
          {/* Date of creation */}
          <span className='text-xs text-gray-400'>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(task.id)}
        className='opacity-0 cursor-pointer group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200'
        title='Delete task'
      >
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
          />
        </svg>
      </button>
    </div>
  );
};
