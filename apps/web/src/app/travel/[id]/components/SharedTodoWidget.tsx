'use client';

import { useState } from 'react';

import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoPersonOutline,
} from 'react-icons/io5';

import { Avatar, Button, Typography } from '@ui/components';

interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  createdAt: string;
}

interface Participant {
  id: string;
  nickname: string;
  profile_image_url?: string;
}

interface SharedTodoWidgetProps {
  todos: TodoItem[];
  participants: Participant[];
  onAddTodo: (title: string) => void;
  onToggleTodo: (id: string) => void;
  onAssignTodo: (todoId: string, assigneeId: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const SharedTodoWidget: React.FC<SharedTodoWidgetProps> = ({
  todos,
  participants,
  onAddTodo,
  onToggleTodo,
  onAssignTodo,
  onDeleteTodo,
}) => {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState<
    string | null
  >(null);

  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      onAddTodo(newTodoTitle.trim());
      setNewTodoTitle('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const pendingTodos = todos.filter((todo) => !todo.isCompleted);
  const completedTodos = todos.filter((todo) => todo.isCompleted);

  return (
    <div className='rounded-2xl bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <Typography variant='h6' className='font-semibold text-gray-900'>
          공동 할 일
        </Typography>
        <div className='flex items-center space-x-2'>
          <div className='h-2 w-2 rounded-full bg-green-400'></div>
          <Typography variant='caption' className='text-gray-500'>
            {pendingTodos.length}개 남음
          </Typography>
        </div>
      </div>

      {/* 할 일 추가 */}
      <div className='mb-6'>
        <div className='flex items-center space-x-2'>
          <div className='relative flex-1'>
            <input
              type='text'
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='새로운 할 일을 입력하세요...'
              className='w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200'
            />
            <IoAddOutline className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          </div>
          <Button
            onClick={handleAddTodo}
            colorTheme='blue'
            size='small'
            disabled={!newTodoTitle.trim()}
            className='h-11 w-11 rounded-lg p-0 shadow-sm'
          >
            <IoAddOutline className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* 진행 중인 할 일 */}
      <div className='mb-6'>
        <Typography variant='body2' className='mb-3 font-medium text-gray-700'>
          진행 중 ({pendingTodos.length})
        </Typography>
        <div className='space-y-3'>
          {pendingTodos.map((todo) => (
            <div
              key={todo.id}
              className='group flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm'
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className='flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 transition-colors duration-200 hover:border-blue-500'
              >
                <IoCheckmarkCircleOutline className='h-3 w-3 text-transparent' />
              </button>

              <div className='flex-1'>
                <Typography
                  variant='body2'
                  className='font-medium text-gray-900'
                >
                  {todo.title}
                </Typography>
              </div>

              {/* 담당자 지정 */}
              <div className='relative'>
                <button
                  onClick={() =>
                    setShowAssigneeDropdown(
                      showAssigneeDropdown === todo.id ? null : todo.id
                    )
                  }
                  className='flex items-center space-x-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs transition-all duration-200 hover:border-blue-300 hover:bg-gray-50'
                >
                  {todo.assigneeAvatar ? (
                    <Avatar
                      src={todo.assigneeAvatar}
                      alt={todo.assigneeName || ''}
                      size='small'
                      className='h-4 w-4'
                    />
                  ) : (
                    <IoPersonOutline className='h-3 w-3 text-gray-400' />
                  )}
                  <span className='font-medium text-gray-600'>
                    {todo.assigneeName || '담당자'}
                  </span>
                </button>

                {/* 담당자 드롭다운 */}
                {showAssigneeDropdown === todo.id && (
                  <div className='absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg'>
                    {participants.map((participant) => (
                      <button
                        key={participant.id}
                        onClick={() => {
                          onAssignTodo(todo.id, participant.id);
                          setShowAssigneeDropdown(null);
                        }}
                        className='flex w-full items-center space-x-3 px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-gray-100'
                      >
                        <Avatar
                          src={participant.profile_image_url}
                          alt={participant.nickname}
                          size='small'
                          className='h-5 w-5'
                        />
                        <span className='font-medium text-gray-700'>
                          {participant.nickname}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 완료된 할 일 */}
      {completedTodos.length > 0 && (
        <div>
          <Typography
            variant='body2'
            className='mb-3 font-medium text-gray-700'
          >
            완료됨 ({completedTodos.length})
          </Typography>
          <div className='space-y-2'>
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className='flex items-center space-x-3 rounded-lg bg-gray-50 p-4'
              >
                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-green-500'>
                  <IoCheckmarkCircleOutline className='h-3 w-3 text-white' />
                </div>

                <div className='flex-1'>
                  <Typography
                    variant='body2'
                    className='font-medium text-gray-500 line-through'
                  >
                    {todo.title}
                  </Typography>
                </div>

                {todo.assigneeAvatar && (
                  <Avatar
                    src={todo.assigneeAvatar}
                    alt={todo.assigneeName || ''}
                    size='small'
                    className='h-5 w-5'
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
