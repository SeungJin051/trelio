import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import {
  Progress,
  ProgressColorTheme,
  ProgressProps,
  ProgressSize,
} from '@ui/components';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A customizable progress bar component to display task completion or loading states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'The current progress value (typically 0-100).',
    },
    max: {
      control: 'number',
      description: 'The maximum value for the progress.',
      defaultValue: 100,
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'] as ProgressSize[],
      description: 'The size of the progress bar.',
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
      description: 'The color theme of the progress bar.',
    },
    animated: {
      control: 'boolean',
      description: 'Whether the progress bar should animate changes.',
    },
    showValue: {
      control: 'boolean',
      description: 'Whether to display the percentage value.',
    },
    label: {
      control: 'text',
      description: 'An optional label displayed above the progress bar.',
    },
    className: {
      control: 'text',
      description: 'Custom CSS class for the container.',
    },
  },
  args: {
    // Default args for all stories
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

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    value: 75,
  },
};

export const WithLabel: Story = {
  args: {
    value: 60,
    label: 'Upload Progress',
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
    label: 'Processing Data',
    showValue: true,
  },
};

export const SmallSize: Story = {
  args: {
    value: 30,
    size: 'small',
    label: 'Small Progress',
    showValue: true,
  },
};

export const LargeSize: Story = {
  args: {
    value: 90,
    size: 'large',
    label: 'Large Progress',
    showValue: true,
  },
};

export const GreenTheme: Story = {
  args: {
    value: 55,
    colorTheme: 'green',
    label: 'Green Theme',
    showValue: true,
  },
};

export const RedTheme: Story = {
  args: {
    value: 20,
    colorTheme: 'red',
    label: 'Error Prone Task',
    showValue: true,
  },
};

export const PurpleTheme: Story = {
  args: {
    value: 70,
    colorTheme: 'purple',
    label: 'Purple Theme',
    showValue: true,
  },
};

export const OrangeTheme: Story = {
  args: {
    value: 80,
    colorTheme: 'orange',
    label: 'Warning Level',
    showValue: true,
  },
};

export const GrayTheme: Story = {
  args: {
    value: 50,
    colorTheme: 'gray',
    label: 'Neutral Task',
    showValue: true,
  },
};

export const NotAnimated: Story = {
  args: {
    value: 65,
    animated: false,
    label: 'Static Progress',
    showValue: true,
  },
};

export const CustomMax: Story = {
  args: {
    value: 150,
    max: 200,
    label: 'Custom Max Value (150/200)',
    showValue: true,
  },
};

export const ZeroProgress: Story = {
  args: {
    value: 0,
    label: 'Not Started',
    showValue: true,
  },
};

export const FullProgress: Story = {
  args: {
    value: 100,
    label: 'Completed',
    showValue: true,
    colorTheme: 'green',
  },
};

// Example of a more dynamic story to show animation
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
    label: 'Live Update',
    showValue: true,
    animated: true,
    colorTheme: 'purple',
  },
  parameters: {
    docs: {
      storyDescription:
        'Demonstrates the animation with live value updates. The value resets after reaching max.',
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
          label={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        />
      ))}
    </div>
  ),
  args: {
    value: 65,
    showValue: true,
    animated: false, // Disable animation for this stacked view for clarity
  },
  parameters: {
    docs: {
      storyDescription: 'Shows all available color themes side-by-side.',
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
          label={`Size: ${size.charAt(0).toUpperCase() + size.slice(1)}`}
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
      storyDescription: 'Shows all available sizes side-by-side.',
    },
  },
};
