import { motion } from 'framer-motion';

// 로딩 컴포넌트
const LoadingView = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className='flex min-h-screen items-center justify-center bg-gradient-to-br'
  >
    <div className='text-center'>
      {/* 로딩 스피너 */}
      <div className='relative mb-8'>
        <div className='mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600'></div>
        <div className='absolute inset-0 mx-auto h-16 w-16 animate-ping rounded-full border-4 border-transparent border-r-blue-400'></div>
      </div>
    </div>
  </motion.div>
);

export default LoadingView;
