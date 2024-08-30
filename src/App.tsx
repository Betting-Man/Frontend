import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Outlet, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import SingleSetting from './pages/SingleSetting/SingleSetting';
import SinglePlay from './pages/SinglePlay/SinglePlay';

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/single' element={<SingleSetting/>}/>
        <Route path='/single/:roomId' element={<SinglePlay/>}/>
      </Routes>
    </div>
  );
}

export default App;
