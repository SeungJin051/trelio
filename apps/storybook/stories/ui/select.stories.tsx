import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { MultiSelect, Select, type SelectOption } from '@ui/components';

// Select 컴포넌트 스토리
const selectMeta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  args: {
    label: '통화 선택',
    options: [
      { value: 'KRW', label: 'KRW - 원화' },
      { value: 'USD', label: 'USD - 달러' },
      { value: 'JPY', label: 'JPY - 엔화' },
      { value: 'EUR', label: 'EUR - 유로' },
      { value: 'GBP', label: 'GBP - 파운드' },
    ] satisfies SelectOption[],
  },
};

export default selectMeta;
type SelectStory = StoryObj<typeof Select>;

export const Basic: SelectStory = {
  args: {
    value: 'KRW',
  },
};

export const WithPlaceholder: SelectStory = {
  args: {
    value: undefined, // value가 없을 때 placeholder가 보입니다.
    placeholder: '통화를 선택하세요',
  },
};

export const Required: SelectStory = {
  args: {
    value: undefined,
    required: true,
    placeholder: '통화를 선택하세요',
  },
};

export const Disabled: SelectStory = {
  args: {
    value: 'KRW',
    disabled: true,
  },
};

export const WithError: SelectStory = {
  args: {
    value: undefined,
    error: '통화를 선택해주세요',
    required: true,
  },
};

export const LongOptions: SelectStory = {
  args: {
    label: '국가 선택',
    value: undefined,
    placeholder: '국가를 선택해주세요',
    options: [
      { value: 'KR', label: '대한민국' },
      { value: 'US', label: '미국' },
      { value: 'JP', label: '일본' },
      { value: 'EU', label: '유럽 연합' },
      { value: 'GB', label: '영국' },
      { value: 'CN', label: '중국' },
      { value: 'AU', label: '호주' },
      { value: 'CA', label: '캐나다' },
    ] satisfies SelectOption[],
  },
};

export const MultiSelectDisableLabelAnimation: StoryObj<typeof MultiSelect> = {
  render: (args) => {
    const [value, setValue] = useState<string[]>(['KRW', 'USD']);
    return (
      <MultiSelect
        {...args}
        label='통화 선택'
        placeholder='통화를 선택하세요'
        options={[
          { value: 'KRW', label: 'KRW - 원화' },
          { value: 'USD', label: 'USD - 달러' },
          { value: 'JPY', label: 'JPY - 엔화' },
        ]}
        value={value}
        onChange={setValue}
        disableLabelAnimation
      />
    );
  },
};
