'use client'

import { useEffect } from 'react'

export function ServiceWorkerProvider() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        // paksa cek update setiap load
        registration.update()

        // listen kalau ada update baru SW
        registration.onupdatefound = () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.onstatechange = () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // optional: bisa tampilkan notif “update available”
                console.log('Service Worker updated')
              }
            }
          }
        }
      } catch (error) {
        console.error('SW registration failed:', error)
      }
    }

    registerSW()
  }, [])

  return null
}