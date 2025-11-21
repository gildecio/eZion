import Link from 'next/link'
import React from 'react'

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <div className="peers ai-c fxw-nw">
            <div className="peer peer-greed">
              <Link href="/" className="sidebar-link td-n">
                <div className="peers ai-c fxw-nw">
                  <div className="peer">
                    <div className="logo">
                      <img src="/assets/static/images/logo.svg" alt="logo" />
                    </div>
                  </div>
                  <div className="peer peer-greed">
                    <h5 className="lh-1 mB-0 logo-text">Adminator</h5>
                  </div>
                </div>
              </Link>
            </div>
            <div className="peer">
              <div className="mobile-toggle sidebar-toggle">
                <a href="#" className="td-n">
                  <i className="ti-arrow-circle-left" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu scrollable pos-r">
          <li className="nav-item mT-30">
            <Link href="/" className="sidebar-link">
              <span className="icon-holder">
                <i className="c-blue-500 ti-home" />
              </span>
              <span className="title">Dashboard</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/email" className="sidebar-link">
              <span className="icon-holder">
                <i className="c-brown-500 ti-email" />
              </span>
              <span className="title">Email</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/compose" className="sidebar-link">
              <span className="icon-holder">
                <i className="c-blue-500 ti-share" />
              </span>
              <span className="title">Compose</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/calendar" className="sidebar-link">
              <span className="icon-holder">
                <i className="c-deep-orange-500 ti-calendar" />
              </span>
              <span className="title">Calendar</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/chat" className="sidebar-link">
              <span className="icon-holder">
                <i className="c-deep-purple-500 ti-comment-alt" />
              </span>
              <span className="title">Chat</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/charts" className="sidebar-link">
              <span className="icon-holder">
                <i className="c-indigo-500 ti-bar-chart" />
              </span>
              <span className="title">Charts</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/forms" className="sidebar-link">
              <span className="icon-holder">
                <i className="c-light-blue-500 ti-pencil" />
              </span>
              <span className="title">Forms</span>
            </Link>
          </li>

          <li className="nav-item dropdown">
            <a className="sidebar-link" href="#">
              <span className="icon-holder">
                <i className="c-pink-500 ti-palette" />
              </span>
              <span className="title">UI Elements</span>
            </a>
          </li>

          <li className="nav-item dropdown">
            <a className="dropdown-toggle" href="#">
              <span className="icon-holder">
                <i className="c-orange-500 ti-layout-list-thumb" />
              </span>
              <span className="title">Tables</span>
              <span className="arrow">
                <i className="ti-angle-right" />
              </span>
            </a>
            <ul className="dropdown-menu">
                <li>
                <Link href="/basic-table" className="sidebar-link">Basic Table</Link>
              </li>
              <li>
                <Link href="/datatable" className="sidebar-link">Data Table</Link>
              </li>
            </ul>
          </li>

          <li className="nav-item dropdown">
            <a className="dropdown-toggle" href="#">
              <span className="icon-holder">
                <i className="c-purple-500 ti-map" />
              </span>
              <span className="title">Maps</span>
              <span className="arrow">
                <i className="ti-angle-right" />
              </span>
            </a>
            <ul className="dropdown-menu">
              <li>
                <Link href="/google-maps">Google Map</Link>
              </li>
              <li>
                <Link href="/vector-maps">Vector Map</Link>
              </li>
            </ul>
          </li>

          <li className="nav-item dropdown">
            <a className="dropdown-toggle" href="#">
              <span className="icon-holder">
                <i className="c-red-500 ti-files" />
              </span>
              <span className="title">Pages</span>
              <span className="arrow">
                <i className="ti-angle-right" />
              </span>
            </a>
            <ul className="dropdown-menu">
              <li>
                <Link href="/blank" className="sidebar-link">Blank</Link>
              </li>
              <li>
                <Link href="/404" className="sidebar-link">404</Link>
              </li>
              <li>
                <Link href="/500" className="sidebar-link">500</Link>
              </li>
              <li>
                <Link href="/signin" className="sidebar-link">Sign In</Link>
              </li>
              <li>
                <Link href="/signup" className="sidebar-link">Sign Up</Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  )
}
