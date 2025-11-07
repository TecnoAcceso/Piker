import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'

export default function QRScanner({ onScanSuccess, onError, onClose }) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const qrScannerRef = useRef(null)

  useEffect(() => {
    let scanner = null
    let mounted = true

    const startScanner = async () => {
      try {
        // Detect mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        const isHTTPS = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1'

        // Check camera support
        if (!QrScanner.hasCamera()) {
          throw new Error('No se encontró ninguna cámara disponible')
        }

        setIsScanning(true)
        setError(null)

        // Wait for video element to be ready (longer on mobile)
        await new Promise(resolve => setTimeout(resolve, isMobile ? 500 : 300))

        if (!videoRef.current || !mounted) {
          return
        }

        // Try to get available cameras first
        let cameraId = null
        try {
          const cameras = await QrScanner.listCameras(true)
          if (cameras && cameras.length > 0) {
            // Prefer back camera
            const backCamera = cameras.find(cam => 
              cam.label.toLowerCase().includes('back') || 
              cam.label.toLowerCase().includes('rear') ||
              cam.label.toLowerCase().includes('environment')
            )
            cameraId = backCamera ? backCamera.id : cameras[0].id
            console.log('Cámaras disponibles:', cameras.map(c => c.label))
            console.log('Usando cámara:', backCamera ? backCamera.label : cameras[0].label)
          }
        } catch (camError) {
          console.warn('No se pudieron listar las cámaras:', camError)
        }

        // Create scanner instance with better mobile configuration
        scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (mounted && result?.data) {
              console.log('QR escaneado exitosamente:', result.data)
              onScanSuccess?.(result.data, result)
            }
          },
          {
            // Use specific camera if available, otherwise prefer back camera
            preferredCamera: cameraId ? cameraId : 'environment',
            // Return detailed scan result
            returnDetailedScanResult: true,
            // Highlight scan region
            highlightScanRegion: true,
            highlightCodeOutline: true,
            // Better performance on mobile
            maxScansPerSecond: isMobile ? 5 : 10,
          }
        )

        qrScannerRef.current = scanner

        // Start scanning
        console.log('Iniciando escáner QR...')
        try {
          await scanner.start()
          console.log('Escáner QR iniciado correctamente')
          if (mounted) {
            setIsScanning(false)
          }
        } catch (startError) {
          // If back camera fails, try front camera
          if (cameraId && startError.message?.includes('environment')) {
            console.log('Cámara trasera falló, intentando con cámara frontal...')
            try {
              const cameras = await QrScanner.listCameras(true)
              const frontCamera = cameras?.find(cam => 
                cam.label.toLowerCase().includes('front') || 
                cam.label.toLowerCase().includes('user')
              )
              
              if (frontCamera) {
                // Destroy current scanner and create new one with front camera
                await scanner.destroy().catch(() => {})
                
                scanner = new QrScanner(
                  videoRef.current,
                  (result) => {
                    if (mounted && result?.data) {
                      console.log('QR escaneado exitosamente:', result.data)
                      onScanSuccess?.(result.data, result)
                    }
                  },
                  {
                    preferredCamera: frontCamera.id,
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    maxScansPerSecond: isMobile ? 5 : 10,
                  }
                )
                
                qrScannerRef.current = scanner
                await scanner.start()
                console.log('Escáner QR iniciado con cámara frontal')
                if (mounted) {
                  setIsScanning(false)
                }
              } else {
                throw startError
              }
            } catch (fallbackError) {
              throw startError // Throw original error
            }
          } else {
            throw startError
          }
        }
      } catch (err) {
        console.error('Error starting scanner - Detalles completos:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          userAgent: navigator.userAgent,
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          hasCamera: QrScanner.hasCamera(),
        })
        
        if (mounted) {
          setIsScanning(false)
          let errorMsg = 'Error al acceder a la cámara'
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
          const isHTTPS = window.location.protocol === 'https:' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1'
          
          // More specific error handling
          if (err.name === 'NotAllowedError' || err.message?.includes('Permission') || err.message?.includes('permission denied')) {
            errorMsg = isMobile
              ? 'Permisos de cámara denegados. Ve a Configuración del navegador y permite el acceso a la cámara para este sitio.'
              : 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración de tu navegador.'
          } else if (err.name === 'NotFoundError' || err.message?.includes('No camera') || err.message?.includes('camera not found')) {
            errorMsg = 'No se encontró ninguna cámara disponible en tu dispositivo.'
          } else if (err.name === 'NotReadableError' || err.message?.includes('in use') || err.message?.includes('could not start')) {
            errorMsg = 'La cámara está siendo usada por otra aplicación. Por favor, ciérrala e intenta de nuevo.'
          } else if (err.message?.includes('https') || err.message?.includes('secure context')) {
            if (!isHTTPS) {
              errorMsg = isMobile
                ? 'Se requiere HTTPS para acceder a la cámara. Si estás en desarrollo, usa localhost o configura HTTPS.'
                : 'La cámara solo está disponible en HTTPS o localhost.'
            } else {
              errorMsg = 'Error al acceder a la cámara. Verifica los permisos y que la cámara no esté siendo usada por otra aplicación.'
            }
          } else if (err.message?.includes('OverconstrainedError') || err.message?.includes('constraint')) {
            errorMsg = 'La configuración de cámara solicitada no es compatible con tu dispositivo.'
          } else if (err.message) {
            errorMsg = err.message
          }
          
          setError(errorMsg)
          onError?.(err)
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      const cleanup = async () => {
        const scannerInstance = scanner || qrScannerRef.current
        if (scannerInstance) {
          try {
            // Check if scanner has stop method before calling
            if (scannerInstance.stop && typeof scannerInstance.stop === 'function') {
              const stopPromise = scannerInstance.stop()
              if (stopPromise && typeof stopPromise.catch === 'function') {
                await stopPromise.catch(() => {
                  // Ignore stop errors
                })
              }
            }
          } catch (stopError) {
            // Ignore stop errors
            console.warn('Error stopping scanner:', stopError)
          }
          
          try {
            // Check if scanner has destroy method before calling
            if (scannerInstance.destroy && typeof scannerInstance.destroy === 'function') {
              const destroyPromise = scannerInstance.destroy()
              if (destroyPromise && typeof destroyPromise.catch === 'function') {
                await destroyPromise.catch(() => {
                  // Ignore destroy errors
                })
              }
            }
          } catch (destroyError) {
            // Ignore destroy errors
            console.warn('Error destroying scanner:', destroyError)
          }
        }
        qrScannerRef.current = null
      }
      cleanup()
    }
  }, [onScanSuccess, onError])

  const handleClose = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.stop && typeof qrScannerRef.current.stop === 'function') {
          await qrScannerRef.current.stop().catch(() => {})
        }
        if (qrScannerRef.current.destroy && typeof qrScannerRef.current.destroy === 'function') {
          await qrScannerRef.current.destroy().catch(() => {})
        }
      } catch (err) {
        // Ignore errors
        console.warn('Error closing scanner:', err)
      }
      qrScannerRef.current = null
    }
    onClose?.()
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full rounded-lg overflow-hidden min-h-[300px] bg-black"
        playsInline
        muted
      />
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white text-sm">Iniciando cámara...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-center p-4">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
