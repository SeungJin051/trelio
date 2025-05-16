import HydratePage from '@/components/HydratePage';
import getQueryClient from '@/lib/query/queryClient';

import MainView from './main/view';

const Web = () => {
  return (
    <HydratePage queryClient={getQueryClient()}>
      <MainView />
    </HydratePage>
  );
};

export default Web;
