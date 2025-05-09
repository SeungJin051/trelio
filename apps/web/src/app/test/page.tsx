'use client';

import { Button, Checkbox, Typography } from '@ui/components';

export default function Test() {
  return (
    <div className='grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20'>
      <main className='row-start-2 flex flex-col items-center gap-[32px] sm:items-start'>
        <Button colorTheme='red' variant='filled'>
          Click me1
        </Button>
        <Button colorTheme='purple' variant='outlined'>
          Click me1
        </Button>
        <Checkbox checked={false} onChange={() => {}} label='Checkbox' />
        <Typography variant='h1' weight='bold'>
          Hello
        </Typography>
      </main>
    </div>
  );
}
