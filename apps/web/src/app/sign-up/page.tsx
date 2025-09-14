import { Suspense } from 'react';

import SignUpView from './view';

const SignUpPage = () => {
  return (
    <Suspense fallback={<div />}>
      <SignUpView />
    </Suspense>
  );
};

export default SignUpPage;
