import Link from 'next/link'
export default function Home() {
  return(
    <div>
      <h1 className="text-3xl font-bold underline">
        Amadeus System
      </h1>
      <Link href="/chat">Chat</Link>
    </div>
  )
}