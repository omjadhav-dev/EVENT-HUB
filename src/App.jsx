import React from 'react'
import Header from './Components/Header'
import Footer from './Components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Content */}
      </main>

      <Footer />
    </div>
  );
}
export default App