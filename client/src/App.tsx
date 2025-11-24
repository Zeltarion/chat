import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

import RoomListPage from './components/RoomListPage';
import ChatPage from './components/ChatPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RoomListPage/>}/>
      <Route path="/room/:roomId" element={<ChatPage/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
};

export default App;