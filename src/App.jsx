import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './components/Home';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1">
        <Home/>
      </main>

      <Footer />
    </div>
  );
}
export default App