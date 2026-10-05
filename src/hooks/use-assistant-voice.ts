'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { assistantApi } from '@/lib/api/assistant'

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export type VoiceInputMode = 'native' | 'server' | 'unsupported'

/**
 * Voice input for the assistant:
 * 1. Web Speech API when the browser supports it (Chrome/Edge — free, on-device UX)
 * 2. Fallback: MediaRecorder → POST /assistant/transcribe (server Whisper)
 * 3. Neither available → unsupported (mic button hidden, text always works)
 */
export function useAssistantVoiceInput(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const mode: VoiceInputMode =
    typeof window === 'undefined'
      ? 'unsupported'
      : getSpeechRecognition()
        ? 'native'
        : typeof window.MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
          ? 'server'
          : 'unsupported'

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (mode === 'native') {
      const Recognition = getSpeechRecognition()!
      const recognition = new Recognition()
      recognition.lang = navigator.language?.startsWith('hi') ? 'hi-IN' : 'en-IN'
      recognition.interimResults = false
      recognition.continuous = false
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0]?.transcript ?? '')
          .join(' ')
          .trim()
        if (transcript) onTranscript(transcript)
      }
      recognition.onerror = (event: any) => {
        setError(
          event?.error === 'not-allowed'
            ? 'Microphone access was denied. You can keep typing instead.'
            : 'Could not hear you. Please try again or type your question.'
        )
        setIsRecording(false)
      }
      recognition.onend = () => setIsRecording(false)
      recognitionRef.current = recognition
      recognition.start()
      setIsRecording(true)
      return
    }

    if (mode === 'server') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        chunksRef.current = []
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data)
        }
        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop())
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          if (blob.size === 0) return
          setIsTranscribing(true)
          try {
            const result = await assistantApi.transcribe(blob)
            if (result.text) onTranscript(result.text)
          } catch {
            setError('Transcription failed. Please type your question instead.')
          } finally {
            setIsTranscribing(false)
          }
        }
        recorderRef.current = recorder
        recorder.start()
        setIsRecording(true)
      } catch {
        setError('Microphone access was denied. You can keep typing instead.')
      }
    }
  }, [mode, onTranscript])

  useEffect(() => () => stop(), [stop])

  return { mode, isRecording, isTranscribing, error, start, stop, clearError: () => setError(null) }
}

/** Speak assistant replies aloud via the browser's speech synthesis (free). */
export function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const plain = text
    .replace(/[*_#`>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return
  const utterance = new SpeechSynthesisUtterance(plain.slice(0, 1200))
  // Devanagari content → Hindi voice
  utterance.lang = /[ऀ-ॿ]/.test(plain) ? 'hi-IN' : 'en-IN'
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
