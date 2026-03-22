'use client'

interface ContactButtonProps {
  listingName: string
  phone: string
}

export default function ContactButton({ listingName, phone }: ContactButtonProps) {
  return (
    <button
      onClick={() => alert(`Contact ${listingName} via: ${phone}`)}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
    >
      Contact {listingName}
    </button>
  )
}
