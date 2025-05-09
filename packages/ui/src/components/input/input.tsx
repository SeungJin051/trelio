import React, { forwardRef } from 'react';

import { cn } from '@ui/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  label?: string;
  children?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className={cn(className)}>
        {label && <label htmlFor={props.id}>{label}</label>}
        <input {...props} ref={ref} type='text' />
      </div>
    );
  }
);

Input.displayName = 'Input';
