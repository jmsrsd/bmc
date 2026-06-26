'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export type NavItem = { href: string; label: string }

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white hover:bg-[#1C1C1E] transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 left-0 z-40 h-full w-56 bg-[#0B0B0C] border-r border-[#242427] p-4 transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 px-3 flex items-center justify-between">
          <h2 className="text-h2">BMC</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-[#8E8E93] hover:text-white transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-body rounded-lg px-3 py-3 transition-colors hover:bg-[#1C1C1E] hover:text-[#FFFFFF]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
