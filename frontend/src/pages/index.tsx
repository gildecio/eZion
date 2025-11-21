import Head from 'next/head'
import React from 'react'
import Layout from '../components/Layout'
import LegacyPage from '../components/LegacyPage'

export default function Home() {
  return (
    <>
      <Head>
        <title>eZion - Blank (Index)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout>
        {/* Use the legacy blank page as the index content */}
        <LegacyPage url="/blank.html" />
      </Layout>
    </>
  )
}