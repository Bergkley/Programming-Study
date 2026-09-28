import { useState } from 'react';

import { UserProvider } from './contexts/UserContext';

import UserInfo from './components/UserInfo';
import UserActions from './components/UserActions';
import Counter from './components/Counter';
import ThemeButton from './components/ThemeButton';

export default function App() {
  const [theme, setTheme] = useState('light');

  console.log('App renderizou');

  return (
    <UserProvider>
      <div>
        <h1>Context API + Re-renders</h1>

        <hr />

        <UserInfo />

        <UserActions />

        <hr />

        <Counter />

        <hr />

        <ThemeButton theme={theme} setTheme={setTheme} />
      </div>
    </UserProvider>
  );
}
