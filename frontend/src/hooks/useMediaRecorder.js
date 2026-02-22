import { useState, useRef, useCallback } from 'react'

export default function useMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState(null)
  const [stream, setStream] = useState(null)
  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startCamera = useCallback(async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    streamRef.current = mediaStream
    setStream(mediaStream)
    return mediaStream
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setStream(null)
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    chunksRef.current = []
    setVideoBlob(null)

    // Pick a supported MIME type with fallback
    const mimeType = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ].find((t) => MediaRecorder.isTypeSupported(t)) || ''

    const options = mimeType ? { mimeType } : undefined
    const recorder = new MediaRecorder(streamRef.current, options)

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setVideoBlob(blob)
      setIsRecording(false)
    }

    recorder.start(1000)
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  return {
    isRecording,
    videoBlob,
    stream,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
  }
}
