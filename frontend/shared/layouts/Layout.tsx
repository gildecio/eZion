import React, { PropsWithChildren } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="container">
          {children}
        </div>
      </div>
    </div>
  )
}
