'use client';

import { useState } from 'react';

import { FaBeer } from 'react-icons/fa';

import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Checkbox,
  Divider,
  Icon,
  Spinner,
  Switch,
  Typography,
} from '@ui/components';

const MainView = () => {
  const [isSmallChecked, setIsSmallChecked] = useState(false);

  return (
    <div className='flex flex-col items-center gap-4'>
      <Button colorTheme='red' variant='filled'>
        Click me1
      </Button>
      <Button colorTheme='purple' variant='outlined'>
        Click me1
      </Button>
      <Checkbox checked={false} onChange={() => {}} label='Checkbox' />
      <Checkbox
        checked={true}
        onChange={() => {}}
        label='Checkbox'
        isRadio={true}
      />
      <Typography variant='h1' weight='bold'>
        Hello
      </Typography>
      <Divider colorTheme='red' />
      <Switch
        checked={isSmallChecked}
        onChange={setIsSmallChecked}
        label='Small Switch'
        size='small'
      />
      <Icon as={FaBeer} size={100} />
      <Badge colorTheme='blue' size='small' variant='outlined'>
        asdf
      </Badge>
      <Badge colorTheme='blue' size='medium' variant='outlined'>
        asdf
      </Badge>
      <Badge colorTheme='blue' size='large' variant='outlined'>
        asdf
      </Badge>
      <Badge colorTheme='blue' size='small' variant='filled'>
        asdf
      </Badge>
      <Badge colorTheme='blue' size='medium' variant='filled'>
        asdf
      </Badge>
      <Spinner size='medium' />
      <AvatarGroup>
        <Avatar size='small' />
        <Avatar size='small' />
        <Avatar size='small' />
      </AvatarGroup>
    </div>
  );
};

export default MainView;
