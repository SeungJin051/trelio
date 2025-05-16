import { useState } from 'react';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { Switch } from '@ui/components/switch';

// 메타데이터 정의
const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: '스위치 레이블' },
    checked: { control: 'boolean', description: '스위치 상태' },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium'],
      description: '스위치 크기',
    },
    onChange: { action: 'changed', description: '상태 변경 이벤트 핸들러' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

// 기본 스위치
export const Default: Story = {
  args: {
    checked: false,
    onChange: action('onChange'),
  },
};

// 활성화된 스위치
export const Checked: Story = {
  args: {
    checked: true,
    onChange: action('onChange'),
  },
};

// 레이블 있는 스위치
export const WithLabel: Story = {
  args: {
    checked: false,
    label: '알림 받기',
    onChange: action('onChange'),
  },
};

// 작은 크기 스위치
export const Small: Story = {
  args: {
    checked: false,
    size: 'small',
    label: '작은 스위치',
    onChange: action('onChange'),
  },
};

// 중간 크기 스위치
export const Medium: Story = {
  args: {
    checked: false,
    size: 'medium',
    label: '중간 크기 스위치',
    onChange: action('onChange'),
  },
};

// 다양한 스위치 그룹
export const SwitchGroup: Story = {
  render: () => (
    <div className='flex w-72 flex-col gap-4 p-4'>
      <Switch
        checked={true}
        onChange={action('onChange')}
        label='Wi-Fi'
        size='medium'
      />
      <Switch
        checked={false}
        onChange={action('onChange')}
        label='블루투스'
        size='medium'
      />
      <Switch
        checked={true}
        onChange={action('onChange')}
        label='비행기 모드'
        size='medium'
      />
      <Switch
        checked={false}
        onChange={action('onChange')}
        label='위치 서비스'
        size='medium'
      />
    </div>
  ),
};

// 상호작용하는 스위치
export const Interactive = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className='flex flex-col gap-4 p-4'>
      <Switch
        checked={checked}
        onChange={setChecked}
        label='클릭해서 토글하세요'
      />
      <div className='text-sm'>현재 상태: {checked ? '켜짐' : '꺼짐'}</div>
    </div>
  );
};

// 여러 상호작용 스위치
export const MultipleInteractive = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    sounds: false,
    autoUpdate: true,
  });

  const handleChange = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings({
      ...settings,
      [key]: checked,
    });
  };

  return (
    <div className='w-80 p-4'>
      <h3 className='mb-4 text-lg font-bold'>설정</h3>

      <div className='flex flex-col gap-4'>
        <Switch
          checked={settings.darkMode}
          onChange={handleChange('darkMode')}
          label='다크 모드'
          size='medium'
        />
        <Switch
          checked={settings.notifications}
          onChange={handleChange('notifications')}
          label='알림 수신'
          size='medium'
        />
        <Switch
          checked={settings.sounds}
          onChange={handleChange('sounds')}
          label='소리 효과'
          size='medium'
        />
        <Switch
          checked={settings.autoUpdate}
          onChange={handleChange('autoUpdate')}
          label='자동 업데이트'
          size='medium'
        />
      </div>

      <div className='mt-4 rounded-md bg-gray-100 p-3 text-sm'>
        <pre>{JSON.stringify(settings, null, 2)}</pre>
      </div>
    </div>
  );
};
