import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Opportunity Scraper'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} m-0 flex-col flex justify-start items-center bg-gray-300 w-screen min-h-screen h-auto overflow-x-hidden`}>{children}</body>
    </html>
  )
}
