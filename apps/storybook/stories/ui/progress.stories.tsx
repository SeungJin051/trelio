import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import {
  Progress,
  ProgressColorTheme,
  ProgressProps,
  ProgressSize,
} from '@ui/components';

const meta: Meta<typeof Progress> = {
  title: '컴포넌트/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '작업 완료 상태나 로딩 상태를 표시하는 커스터마이징 가능한 프로그레스 바 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: '현재 진행률 값 (일반적으로 0-100)',
    },
    max: {
      control: 'number',
      description: '프로그레스의 최대값',
      defaultValue: 100,
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'] as ProgressSize[],
      description: '프로그레스 바의 크기',
    },
    colorTheme: {
      control: 'select',
      options: [
        'blue',
        'green',
        'purple',
        'orange',
        'red',
        'gray',
      ] as ProgressColorTheme[],
      description: '프로그레스 바의 색상 테마',
    },
    animated: {
      control: 'boolean',
      description: '프로그레스 바가 변화를 애니메이션으로 표시할지 여부',
    },
    showValue: {
      control: 'boolean',
      description: '퍼센트 값을 표시할지 여부',
    },
    label: {
      control: 'text',
      description: '프로그레스 바 위에 표시되는 선택적 라벨',
    },
    className: {
      control: 'text',
      description: '컨테이너에 적용할 커스텀 CSS 클래스',
    },
  },
  args: {
    // 모든 스토리의 기본 args
    value: 50,
    max: 100,
    size: 'medium',
    colorTheme: 'blue',
    animated: true,
    showValue: false,
    label: '',
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 75,
  },
};

export const WithLabel: Story = {
  args: {
    value: 60,
    label: '파일 업로드 진행률',
  },
};

export const ShowValue: Story = {
  args: {
    value: 85,
    showValue: true,
  },
};

export const WithLabelAndValue: Story = {
  args: {
    value: 40,
    label: '데이터 처리 중',
    showValue: true,
  },
};

export const SmallSize: Story = {
  args: {
    value: 30,
    size: 'small',
    label: '작은 프로그레스',
    showValue: true,
  },
};

export const LargeSize: Story = {
  args: {
    value: 90,
    size: 'large',
    label: '큰 프로그레스',
    showValue: true,
  },
};

export const GreenTheme: Story = {
  args: {
    value: 55,
    colorTheme: 'green',
    label: '성공 작업',
    showValue: true,
  },
};

export const RedTheme: Story = {
  args: {
    value: 20,
    colorTheme: 'red',
    label: '오류 발생 작업',
    showValue: true,
  },
};

export const PurpleTheme: Story = {
  args: {
    value: 70,
    colorTheme: 'purple',
    label: '특별 작업',
    showValue: true,
  },
};

export const OrangeTheme: Story = {
  args: {
    value: 80,
    colorTheme: 'orange',
    label: '주의 필요 작업',
    showValue: true,
  },
};

export const GrayTheme: Story = {
  args: {
    value: 50,
    colorTheme: 'gray',
    label: '일반 작업',
    showValue: true,
  },
};

export const NotAnimated: Story = {
  args: {
    value: 65,
    animated: false,
    label: '정적 프로그레스',
    showValue: true,
  },
};

export const CustomMax: Story = {
  args: {
    value: 150,
    max: 200,
    label: '커스텀 최대값 (150/200)',
    showValue: true,
  },
};

export const ZeroProgress: Story = {
  args: {
    value: 0,
    label: '아직 시작하지 않음',
    showValue: true,
  },
};

export const FullProgress: Story = {
  args: {
    value: 100,
    label: '작업 완료',
    showValue: true,
    colorTheme: 'green',
  },
};

// 애니메이션을 보여주는 동적인 스토리 예시
const AnimatedProgressDemo = (args: ProgressProps) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((oldValue) => {
        if (oldValue >= (args.max || 100)) {
          return 0;
        }
        return oldValue + 10;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [args.max]);

  return <Progress {...args} value={value} />;
};

export const LiveAnimated: Story = {
  render: AnimatedProgressDemo,
  args: {
    label: '실시간 업데이트',
    showValue: true,
    animated: true,
    colorTheme: 'purple',
  },
  parameters: {
    docs: {
      storyDescription:
        '실시간 값 업데이트를 통한 애니메이션을 보여줍니다. 최대값에 도달하면 값이 초기화됩니다.',
    },
  },
};

export const AllColorThemes: Story = {
  render: (args) => (
    <div
      style={{
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {(
        [
          'blue',
          'green',
          'purple',
          'orange',
          'red',
          'gray',
        ] as ProgressColorTheme[]
      ).map((theme) => (
        <Progress
          key={theme}
          {...args}
          colorTheme={theme}
          label={`테마: ${
            theme === 'blue'
              ? '파랑'
              : theme === 'green'
                ? '초록'
                : theme === 'purple'
                  ? '보라'
                  : theme === 'orange'
                    ? '주황'
                    : theme === 'red'
                      ? '빨강'
                      : '회색'
          }`}
        />
      ))}
    </div>
  ),
  args: {
    value: 65,
    showValue: true,
    animated: false, // 명확성을 위해 이 스택 뷰에서는 애니메이션 비활성화
  },
  parameters: {
    docs: {
      storyDescription: '사용 가능한 모든 색상 테마를 나란히 보여줍니다.',
    },
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div
      style={{
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {(['small', 'medium', 'large'] as ProgressSize[]).map((size) => (
        <Progress
          key={size}
          {...args}
          size={size}
          label={`크기: ${
            size === 'small' ? '작음' : size === 'medium' ? '보통' : '큼'
          }`}
        />
      ))}
    </div>
  ),
  args: {
    value: 75,
    colorTheme: 'blue',
    showValue: true,
  },
  parameters: {
    docs: {
      storyDescription: '사용 가능한 모든 크기를 나란히 보여줍니다.',
    },
  },
};

// 한국적인 상황별 예시들 추가
export const KoreanFoodDelivery: Story = {
  args: {
    value: 30,
    label: '치킨 배달 중',
    showValue: true,
    colorTheme: 'orange',
  },
};

export const OnlineCourseProgress: Story = {
  args: {
    value: 67,
    label: '코딩 강의 수강률',
    showValue: true,
    colorTheme: 'blue',
  },
};

export const ReadingProgress: Story = {
  args: {
    value: 45,
    label: '소설 읽기 진행률',
    showValue: true,
    colorTheme: 'green',
  },
};

export const GameLevelUp: Story = {
  args: {
    value: 88,
    label: '레벨업까지',
    showValue: true,
    colorTheme: 'purple',
  },
};

export const DownloadProgress: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const startDownload = () => {
      if (isDownloading) return;

      setIsDownloading(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDownloading(false);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    };

    const resetDownload = () => {
      setProgress(0);
      setIsDownloading(false);
    };

    return (
      <div
        style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <Progress
          value={Math.min(progress, 100)}
          label='파일 다운로드 중...'
          showValue={true}
          colorTheme={progress >= 100 ? 'green' : 'blue'}
          animated={true}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={startDownload}
            disabled={isDownloading}
            style={{
              padding: '8px 16px',
              backgroundColor: isDownloading ? '#ccc' : '#3182F6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
            }}
          >
            {isDownloading ? '다운로드 중...' : '다운로드 시작'}
          </button>
          <button
            onClick={resetDownload}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            초기화
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      storyDescription:
        '실제 다운로드를 시뮬레이션하는 인터랙티브한 예시입니다.',
    },
  },
};
