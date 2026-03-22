'use client'
import { useEffect, useState } from 'react'

export default function ApplicationsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-serif text-white mb-2">
        Your Applications
      </h1>
      <p className="text-white/50 mb-8">
        Track companies that have reached out to you.
      </p>
      <div className="border border-white/10 border-dashed rounded-xl p-16 text-center">
        <p className="text-white/40">No applications yet.</p>
        <p className="text-white/30 text-sm mt-2">
          Make sure your profile is complete and 
          "Open to work" is turned on.
        </p>
      </div>
    </div>
  )
}
