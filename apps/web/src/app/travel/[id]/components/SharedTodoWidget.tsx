'use client';

import { useEffect, useState } from 'react';

import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoPersonOutline,
  IoTrashOutline,
} from 'react-icons/io5';

import { Avatar, Button, Typography } from '@ui/components';

import { useToast } from '@/hooks/useToast';
import {
  CreateTodoRequest,
  TodoWithAssignee,
  UpdateTodoRequest,
} from '@/types/travel';

interface Participant {
  id: string;
  nickname: string;
  profile_image_url?: string;
  isOnline?: boolean;
}

interface SharedTodoWidgetProps {
  planId: string;
  participants: Participant[];
}

export const SharedTodoWidget: React.FC<SharedTodoWidgetProps> = ({
  planId,
  participants,
}) => {
  const [todos, setTodos] = useState<TodoWithAssignee[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // 투두리스트 조회
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/todos?planId=${planId}`);
      const data = await response.json();

      if (response.ok) {
        setTodos(data.todos || []);
      } else {
        toast.error(data.error || '투두리스트 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('투두리스트 조회 에러:', error);
      toast.error('투두리스트 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새 투두 추가
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;

    try {
      const todoData: CreateTodoRequest = {
        plan_id: planId,
        title: newTodoTitle.trim(),
      };

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });

      const data = await response.json();

      if (response.ok) {
        setTodos((prev) => [data.todo, ...prev]);
        setNewTodoTitle('');
        toast.success('새 할 일이 추가되었습니다.');
      } else {
        toast.error(data.error || '할 일 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('투두 추가 에러:', error);
      toast.error('할 일 추가에 실패했습니다.');
    }
  };

  // 투두 완료/미완료 토글
  const handleToggleTodo = async (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    try {
      const updateData: UpdateTodoRequest = {
        is_completed: !todo.is_completed,
      };

      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setTodos((prev) => prev.map((t) => (t.id === todoId ? data.todo : t)));
        toast.success(
          todo.is_completed
            ? '할 일을 미완료로 변경했습니다.'
            : '할 일을 완료했습니다!'
        );
      } else {
        toast.error(data.error || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('투두 토글 에러:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  // 담당자 지정
  const handleAssignTodo = async (todoId: string, assigneeId: string) => {
    try {
      const updateData: UpdateTodoRequest = {
        assigned_user_id: assigneeId,
      };

      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setTodos((prev) => prev.map((t) => (t.id === todoId ? data.todo : t)));
        toast.success('담당자가 지정되었습니다.');
      } else {
        toast.error(data.error || '담당자 지정에 실패했습니다.');
      }
    } catch (error) {
      console.error('담당자 지정 에러:', error);
      toast.error('담당자 지정에 실패했습니다.');
    }
  };

  // 투두 삭제
  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm('정말로 이 할 일을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== todoId));
        toast.success('할 일이 삭제되었습니다.');
      } else {
        toast.error(data.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('투두 삭제 에러:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  // 컴포넌트 마운트 시 투두리스트 조회
  useEffect(() => {
    fetchTodos();
  }, [planId]);

  const pendingTodos = todos.filter((todo) => !todo.is_completed);
  const completedTodos = todos.filter((todo) => todo.is_completed);

  if (isLoading) {
    return (
      <div className='rounded-2xl bg-white p-6 shadow-sm'>
        <div className='animate-pulse'>
          <div className='mb-4 h-6 w-32 rounded bg-gray-200'></div>
          <div className='space-y-3'>
            <div className='h-12 rounded-lg bg-gray-100'></div>
            <div className='h-12 rounded-lg bg-gray-100'></div>
          </div>
        </div>
      </div>
    );
  }

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
                onClick={() => handleToggleTodo(todo.id)}
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
                  {todo.assignee ? (
                    <Avatar
                      src={todo.assignee.profile_image_url}
                      alt={todo.assignee.nickname}
                      size='small'
                      className='h-4 w-4'
                    />
                  ) : (
                    <IoPersonOutline className='h-3 w-3 text-gray-400' />
                  )}
                  <span className='font-medium text-gray-600'>
                    {todo.assignee?.nickname || '담당자'}
                  </span>
                </button>

                {/* 담당자 드롭다운 */}
                {showAssigneeDropdown === todo.id && (
                  <div className='absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg'>
                    {participants.map((participant) => (
                      <button
                        key={participant.id}
                        onClick={() => {
                          handleAssignTodo(todo.id, participant.id);
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
                        {participant.isOnline && (
                          <div className='h-2 w-2 rounded-full bg-green-400'></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className='text-red-500 opacity-0 transition-opacity duration-200 hover:text-red-700 group-hover:opacity-100'
              >
                <IoTrashOutline className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>

        {pendingTodos.length === 0 && (
          <div className='py-8 text-center'>
            <Typography variant='body2' className='text-gray-500'>
              아직 진행 중인 할 일이 없습니다.
            </Typography>
          </div>
        )}
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
                className='group flex items-center space-x-3 rounded-lg bg-gray-50 p-4'
              >
                <button
                  onClick={() => handleToggleTodo(todo.id)}
                  className='flex h-5 w-5 items-center justify-center rounded-full bg-green-500'
                >
                  <IoCheckmarkCircleOutline className='h-3 w-3 text-white' />
                </button>

                <div className='flex-1'>
                  <Typography
                    variant='body2'
                    className='font-medium text-gray-500 line-through'
                  >
                    {todo.title}
                  </Typography>
                </div>

                {todo.assignee && (
                  <Avatar
                    src={todo.assignee.profile_image_url}
                    alt={todo.assignee.nickname}
                    size='small'
                    className='h-5 w-5'
                  />
                )}

                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className='text-red-500 opacity-0 transition-opacity duration-200 hover:text-red-700 group-hover:opacity-100'
                >
                  <IoTrashOutline className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
