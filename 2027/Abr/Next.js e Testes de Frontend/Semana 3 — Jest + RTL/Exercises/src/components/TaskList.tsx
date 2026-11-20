import { type Task } from '../types/Task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskList = ({ tasks, onToggleTask, onDeleteTask }: TaskListProps) => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  if (tasks.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          <svg className='w-12 h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-gray-700 mb-2'>No tasks yet</h3>
        <p className='text-gray-500'>Add your first task above to get started!</p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {/* Task Stats */}
      <div className='flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100'>
        <div className='flex items-center gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>{totalTasks}</div>
            <div className='text-xs text-blue-500 font-medium'>Total Tasks</div>
          </div>
          <div className='w-px h-8 bg-blue-200'></div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>{completedTasks}</div>
            <div className='text-xs text-green-500 font-medium'>Completed</div>
          </div>
          <div className='w-px h-8 bg-blue-200'></div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-orange-600'>{totalTasks - completedTasks}</div>
            <div className='text-xs text-orange-500 font-medium'>Pending</div>
          </div>
        </div>
        <div className='text-right'>
          <div className='text-sm font-medium text-gray-600'>Progress</div>
          <div className='text-lg font-bold text-gray-800'>
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Task Items */}
      <div className='space-y-3'>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
        ))}
      </div>
    </div>
  );
};
