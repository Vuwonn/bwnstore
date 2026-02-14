'use client'

import { useState } from 'react'

type ProofImageViewerProps = {
  imageUrl: string
  label?: string
}

export default function ProofImageViewer({ imageUrl, label = 'View proof' }: ProofImageViewerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-orange-700 transition hover:text-orange-800"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Payment proof</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <img src={imageUrl} alt="Payment proof" className="max-h-[75vh] w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
