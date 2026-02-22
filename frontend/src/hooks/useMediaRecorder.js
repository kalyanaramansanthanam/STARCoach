import { useState, useRef, useCallback } from 'react'

export default function useMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState(null)
  const [stream, setStream] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startCamera = useCallback(async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    setStream(mediaStream)
    return mediaStream
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const startRecording = useCallback(() => {
    if (!stream) return

    chunksRef.current = []
    setVideoBlob(null)

    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus',
    })

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
  }, [stream])

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
