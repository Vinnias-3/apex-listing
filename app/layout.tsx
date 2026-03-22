import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'APEX Listing Company',
  description: 'Find trusted freelancers and businesses in Kenya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
