import { useState } from 'react';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from '@ui/components/checkbox';

// 메타데이터 정의
const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: '체크박스 레이블' },
    disabled: { control: 'boolean', description: '비활성화 상태' },
    checked: { control: 'boolean', description: '체크 상태' },
    isRadio: { control: 'boolean', description: '라디오 버튼 스타일로 표시' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// 기본 체크박스
export const Default: Story = {
  args: {
    label: '기본 체크박스',
    checked: false,
    onChange: action('onChange'),
  },
};

// 체크된 상태
export const Checked: Story = {
  args: {
    label: '체크된 체크박스',
    checked: true,
    onChange: action('onChange'),
  },
};

// 비활성화 상태
export const Disabled: Story = {
  args: {
    label: '비활성화 체크박스',
    checked: false,
    disabled: true,
    onChange: action('onChange'),
  },
};

// 체크된 비활성화 상태
export const CheckedDisabled: Story = {
  args: {
    label: '체크된 비활성화 체크박스',
    checked: true,
    disabled: true,
    onChange: action('onChange'),
  },
};

// 라디오 버튼 스타일
export const RadioStyle: Story = {
  args: {
    label: '라디오 버튼 스타일',
    checked: false,
    isRadio: true,
    onChange: action('onChange'),
  },
};

// 실제 상호작용 체크박스
export const Interactive = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className='flex flex-col gap-4 p-4'>
      <Checkbox
        label='상호작용 체크박스'
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <div className='text-sm'>
        현재 상태: {checked ? '체크됨' : '체크 해제됨'}
      </div>
    </div>
  );
};

// 여러 체크박스 그룹
export const CheckboxGroup = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const options = ['사과', '바나나', '오렌지', '포도'];

  const handleChange = (option: string) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className='p-4'>
      <div className='mb-2 font-bold'>좋아하는 과일을 선택하세요:</div>
      <div className='flex flex-col gap-2'>
        {options.map((option) => (
          <Checkbox
            key={option}
            label={option}
            checked={selected.includes(option)}
            onChange={() => handleChange(option)}
          />
        ))}
      </div>
      {selected.length > 0 && (
        <div className='mt-4 text-sm'>선택한 과일: {selected.join(', ')}</div>
      )}
    </div>
  );
};
