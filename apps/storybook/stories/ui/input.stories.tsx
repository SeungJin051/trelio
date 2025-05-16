import { useState } from 'react';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import {
  FaEnvelope,
  FaLock,
  FaPhoneAlt,
  FaSearch,
  FaUser,
} from 'react-icons/fa';

import { Input } from '@ui/components/input';

// 메타데이터 정의
const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: '입력 필드의 플레이스홀더 텍스트',
    },
    label: { control: 'text', description: '입력 필드 위에 표시되는 레이블' },
    helperText: {
      control: 'text',
      description: '입력 필드 아래에 표시되는 도움말 텍스트',
    },
    errorText: { control: 'text', description: '입력 필드의 오류 메시지' },
    disabled: { control: 'boolean', description: '비활성화 상태' },
    clearable: {
      control: 'boolean',
      description: '입력 내용을 지울 수 있는 버튼 표시',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
      description: '입력 필드 타입',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
      description: '입력 필드 변형',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: '입력 필드 크기',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// 기본 입력 필드
export const Default: Story = {
  args: {
    placeholder: '텍스트를 입력하세요',
    className: 'w-72',
  },
};

// 레이블이 있는 입력 필드
export const WithLabel: Story = {
  args: {
    label: '이름',
    placeholder: '이름을 입력하세요',
    className: 'w-72',
  },
};

// 다양한 크기의 입력 필드
export const Sizes: Story = {
  render: () => (
    <div className='flex w-72 flex-col gap-4'>
      <Input
        size='sm'
        label='작은 크기 (sm)'
        placeholder='작은 크기 입력 필드'
      />
      <Input
        size='default'
        label='기본 크기 (default)'
        placeholder='기본 크기 입력 필드'
      />
      <Input size='lg' label='큰 크기 (lg)' placeholder='큰 크기 입력 필드' />
    </div>
  ),
};

// 다양한 상태의 입력 필드
export const Variants: Story = {
  render: () => (
    <div className='flex w-72 flex-col gap-4'>
      <Input
        variant='default'
        label='기본 상태'
        placeholder='기본 입력 필드'
        helperText='기본 상태의 입력 필드입니다.'
      />
      <Input
        variant='success'
        label='성공 상태'
        placeholder='성공 상태 입력 필드'
        value='올바른 정보입니다'
        helperText='입력이 유효합니다.'
      />
      <Input
        variant='error'
        label='오류 상태'
        placeholder='오류 상태 입력 필드'
        value='잘못된 정보'
        errorText='입력이 유효하지 않습니다.'
      />
    </div>
  ),
};

// 비활성화된 입력 필드
export const Disabled: Story = {
  args: {
    label: '비활성화된 필드',
    placeholder: '입력할 수 없습니다',
    disabled: true,
    className: 'w-72',
  },
};

// 아이콘이 있는 입력 필드
export const WithIcons: Story = {
  render: () => (
    <div className='flex w-72 flex-col gap-4'>
      <Input
        leftIcon={<FaUser />}
        label='왼쪽 아이콘'
        placeholder='사용자 이름'
      />
      <Input
        rightIcon={<FaSearch />}
        label='오른쪽 아이콘'
        placeholder='검색어를 입력하세요'
      />
      <Input
        leftIcon={<FaEnvelope />}
        rightIcon={<FaSearch />}
        label='양쪽 아이콘'
        placeholder='이메일 검색'
      />
    </div>
  ),
};

// 지울 수 있는(clearable) 입력 필드
export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState('지울 수 있는 텍스트');

    return (
      <div className='w-72'>
        <Input
          label='지울 수 있는 입력 필드'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          clearable
          onClear={() => setValue('')}
          placeholder='텍스트를 입력하세요'
        />
      </div>
    );
  },
};

// 비밀번호 입력 필드
export const Password: Story = {
  render: () => {
    const [value, setValue] = useState('password123');

    return (
      <div className='w-72'>
        <Input
          type='password'
          label='비밀번호'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='비밀번호를 입력하세요'
          helperText='비밀번호는 8자 이상이어야 합니다'
        />
      </div>
    );
  },
};

// 도움말과 오류 메시지 입력 필드
export const HelperAndError: Story = {
  render: () => (
    <div className='flex w-72 flex-col gap-4'>
      <Input
        label='도움말이 있는 필드'
        placeholder='사용자 ID'
        helperText='영문, 숫자 조합으로 4~12자리'
      />
      <Input
        label='오류 메시지가 있는 필드'
        placeholder='사용자 ID'
        value='admin!'
        errorText='영문, 숫자만 입력 가능합니다'
      />
    </div>
  ),
};

// 다양한 타입의 입력 필드
export const InputTypes: Story = {
  render: () => (
    <div className='flex w-72 flex-col gap-4'>
      <Input
        type='text'
        label='텍스트'
        placeholder='일반 텍스트'
        leftIcon={<FaUser />}
      />
      <Input
        type='password'
        label='비밀번호'
        placeholder='비밀번호'
        leftIcon={<FaLock />}
      />
      <Input
        type='email'
        label='이메일'
        placeholder='example@email.com'
        leftIcon={<FaEnvelope />}
      />
      <Input
        type='tel'
        label='전화번호'
        placeholder='010-0000-0000'
        leftIcon={<FaPhoneAlt />}
      />
      <Input type='number' label='숫자' placeholder='0' />
    </div>
  ),
};

// 상호작용하는 입력 필드
export const Interactive = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // 간단한 유효성 검사
    if (newValue.length > 0 && newValue.length < 3) {
      setError('3글자 이상 입력해주세요');
    } else {
      setError(undefined);
    }
  };

  return (
    <div className='w-72 space-y-4'>
      <Input
        label='실시간 유효성 검사'
        value={value}
        onChange={handleChange}
        placeholder='3글자 이상 입력하세요'
        errorText={error}
        clearable
        onClear={() => {
          setValue('');
          setError(undefined);
        }}
      />
      {!error && value && value.length >= 3 && (
        <div className='text-sm text-green-600'>유효한 입력입니다!</div>
      )}
    </div>
  );
};

// 폼 예시
export const FormExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 간단한 유효성 검사
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let errorMessage = '';

    switch (name) {
      case 'name':
        if (value.trim().length < 2) {
          errorMessage = '이름은 2글자 이상이어야 합니다';
        }
        break;
      case 'email':
        if (value && !value.includes('@')) {
          errorMessage = '유효한 이메일 주소를 입력하세요';
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          errorMessage = '비밀번호는 6자 이상이어야 합니다';
        }
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필드 검증
    let isValid = true;
    Object.entries(formData).forEach(([key, value]) => {
      validateField(key, value);
      if (!value || errors[key as keyof typeof errors]) {
        isValid = false;
      }
    });

    if (isValid) {
      action('form-submit')(formData);
      alert(`폼 제출 성공!\n이름: ${formData.name}\n이메일: ${formData.email}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='w-80 space-y-4 rounded-md border p-6'
    >
      <h3 className='mb-4 text-lg font-bold'>회원가입</h3>

      <Input
        label='이름'
        name='name'
        leftIcon={<FaUser />}
        clearable
        value={formData.name}
        onChange={handleChange}
        placeholder='이름을 입력하세요'
        errorText={errors.name}
        required
      />

      <Input
        label='이메일'
        name='email'
        type='email'
        leftIcon={<FaEnvelope />}
        clearable
        value={formData.email}
        onChange={handleChange}
        placeholder='이메일을 입력하세요'
        errorText={errors.email}
        helperText='로그인에 사용됩니다'
        required
      />

      <Input
        label='비밀번호'
        name='password'
        type='password'
        leftIcon={<FaLock />}
        value={formData.password}
        onChange={handleChange}
        placeholder='비밀번호를 입력하세요'
        errorText={errors.password}
        helperText='6자 이상 입력해주세요'
        required
      />

      <button
        type='submit'
        className='mt-4 w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600'
      >
        가입하기
      </button>
    </form>
  );
};
