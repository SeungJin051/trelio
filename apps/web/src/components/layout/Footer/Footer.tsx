import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className='bg-gray-50'>
      <div className='relative mx-auto max-w-screen-xl px-4 py-8 sm:px-6'>
        <div className='absolute end-4 top-4 sm:end-6 sm:top-6 md:end-8 md:top-8'>
          <Link
            className='inline-block rounded-full bg-blue-600 p-2 text-white shadow-sm transition hover:bg-teal-500 sm:p-3 md:p-4'
            href=''
          >
            <span className='sr-only'>Back to top</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='size-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z'
                clipRule='evenodd'
              />
            </svg>
          </Link>
        </div>

        <div className='md:flex md:items-end md:justify-between'>
          <div>
            <div className='flex justify-center text-blue-600 md:justify-start'>
              Logo Image
            </div>
            <p className='mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-400 md:text-left'>
              팩앤고는 여행 계획 서비스, <br />
              여행 계획을 쉽고 편리하게 관리할 수 있어요 <br />
              <br />
              seungjin051@gmail.com
            </p>
          </div>

          <ul className='mt-12 flex flex-wrap justify-center gap-6 md:mt-0 md:justify-end md:gap-12'>
            <li>
              <Link
                className='text-black transition hover:text-gray-700/75'
                href='https://github.com/SeungJin051'
                target='_blank'
              >
                Github
              </Link>
            </li>

            <li>
              <Link
                className='text-black transition hover:text-gray-700/75'
                href='https://www.instagram.com/__seung_jin__/'
                target='_blank'
              >
                Instagram
              </Link>
            </li>
          </ul>
        </div>

        <p className='mt-12 text-center text-sm text-gray-400 md:text-right'>
          Copyright &copy; 2025. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
