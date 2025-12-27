import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Grid from './components/Grid'

function App() {
  return (
    <main className="w-full h-[90vh] flex items-center justify-center">
      <section className="w-[700px] h-[700px]">
        <Grid />
      </section>
    </main>
  );
}

export default App;

