import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>eZion</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="page-container">
        <h1>Frontend Next.js</h1>
        <p>Estrutura Next.js aplicada. Conteúdo legado disponível nas páginas HTML existentes.</p>
        <p>
          <Link href="/index.html">Abrir Dashboard legado</Link>
        </p>
      </main>
    </>
  )
}