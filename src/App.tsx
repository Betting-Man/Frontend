import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import SingleSetting from './pages/SingleSetting/SingleSetting';
import SinglePlay from './pages/SinglePlay/SinglePlay';
import Host from './pages/Host/Host';
import Join from './pages/Join/Join';

function App() {
  return (
    <div className='mx-auto h-dvh max-w-[600px] overflow-hidden bg-background'>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/single' element={<SingleSetting/>}/>
        <Route path='/single/:roomId' element={<SinglePlay/>}/>
        <Route path='/host' element={<Host/>}/>
        <Route path='/join/:code?' element={<Join/>}/>
      </Routes>
    </div>
  );
}

export default App;
