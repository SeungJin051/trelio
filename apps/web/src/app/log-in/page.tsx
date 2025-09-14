import { Suspense } from 'react';

import LoginView from './view';

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginView />
    </Suspense>
  );
}
