import React from 'react'
import Header from '../common/Header'
import Footer from '../common/Footer'
import '../../styles/layout/layout.css'

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
