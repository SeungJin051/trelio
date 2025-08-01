'use client';

import { AnimatePresence, motion } from 'framer-motion';

import LoadingView from '@/components/basic/Loading/Loading';
import { useSession } from '@/hooks/useSession';

import AfterLoginHomeView from './after-login';
import BeforeLoginHomeView from './befor-login';

const HomeView = () => {
  const { session, loading } = useSession();

  return (
    <AnimatePresence mode='wait'>
      {loading ? (
        <LoadingView key='loading' />
      ) : session ? (
        <motion.div
          key='after-login'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <AfterLoginHomeView />
        </motion.div>
      ) : (
        <motion.div
          key='before-login'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <BeforeLoginHomeView />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomeView;
