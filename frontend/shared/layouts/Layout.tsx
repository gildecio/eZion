import React, { PropsWithChildren } from 'react'
import Sidebar from './Sidebar'
import { Footer } from '@/shared/components/Footer'

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="container">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}
