import { useEffect, useRef, useState } from 'react'
import { Mic, Square, FileText, Search, Trash2, Pencil, Check, X, Copy, Plus, AudioLines, Languages } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS = API.replace(/^http/, 'ws') + '/ws/transcribe'

export default function App() {
  const [records, setRecords] = useState([])
  const [transcript, setTranscript] = useState('')
  const [language, setLanguage] = useState('Auto-detected')
  const [title, setTitle] = useState('My transcription')
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editText, setEditText] = useState('')
  const [notice, setNotice] = useState('')
  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const audioRef = useRef(null)
  const processorRef = useRef(null)
  const transcriptRef = useRef('')

  const refresh = async () => {
    try { const r = await fetch(`${API}/api/transcriptions`); if (r.ok) setRecords(await r.json()) }
    catch { setNotice('Backend is not reachable. Start the FastAPI server and refresh.') }
  }
  useEffect(() => { refresh() }, [])

  const appendText = (text, lang) => {
    transcriptRef.current = [transcriptRef.current, text].filter(Boolean).join(' ')
    setTranscript(transcriptRef.current)
    if (lang) setLanguage(lang)
  }

  const startRecording = async () => {
    try {
      setNotice('')
      transcriptRef.current = ''; setTranscript(''); setLanguage('Auto-detected')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } })
      streamRef.current = stream
      const audio = new (window.AudioContext || window.webkitAudioContext)()
      audioRef.current = audio
      const source = audio.createMediaStreamSource(stream)
      const processor = audio.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor
      const socket = new WebSocket(WS)
      wsRef.current = socket
      socket.binaryType = 'arraybuffer'
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'transcript') appendText(data.text, data.language)
        if (data.type === 'error') setNotice(data.message || 'Transcription error')
      }
      socket.onopen = () => {
        processor.onaudioprocess = (event) => {
          if (socket.readyState !== WebSocket.OPEN) return
          const input = event.inputBuffer.getChannelData(0)
          const ratio = audio.sampleRate / 16000
          const length = Math.floor(input.length / ratio)
          const output = new Float32Array(length)
          for (let i = 0; i < length; i++) {
            const start = Math.floor(i * ratio), end = Math.floor((i + 1) * ratio)
            let sum = 0, count = 0
            for (let j = start; j < Math.min(end, input.length); j++) { sum += input[j]; count++ }
            output[i] = count ? sum / count : 0
          }
          socket.send(output.buffer)
        }
        source.connect(processor); processor.connect(audio.destination)
        setRecording(true); setNotice('Listening… speak naturally in Hindi, English, or a mix.')
      }
      socket.onerror = () => setNotice('WebSocket connection failed. Check that the backend is running.')
    } catch (e) { setNotice(e.message || 'Microphone permission is required.') }
  }

  const stopRecording = async () => {
    setRecording(false); setBusy(true)
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current.onaudioprocess = null }
    if (audioRef.current) await audioRef.current.close().catch(() => {})
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    const socket = wsRef.current
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'stop' }))
      await new Promise(resolve => { socket.addEventListener('message', function handler(e) { if (JSON.parse(e.data).type === 'stopped') { socket.removeEventListener('message', handler); resolve() } }); setTimeout(resolve, 12000) })
      socket.close()
    }
    setBusy(false); setNotice('Recording finished. Save your transcript to keep it in history.')
  }

  const save = async () => {
    if (!transcript.trim()) { setNotice('Speak first or enter a transcript before saving.'); return }
    setBusy(true)
    try {
      const r = await fetch(`${API}/api/transcriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim() || 'Untitled transcription', transcript: transcript.trim(), language }) })
      if (!r.ok) throw new Error('Save failed')
      const item = await r.json(); setRecords(prev => [item, ...prev]); setNotice('Transcription saved to history.')
    } catch { setNotice('Could not save. Check backend/database connection.') }
    finally { setBusy(false) }
  }

  const deleteRecord = async (id) => {
    if (!confirm('Delete this transcription?')) return
    try { await fetch(`${API}/api/transcriptions/${id}`, { method: 'DELETE' }); setRecords(prev => prev.filter(x => x.id !== id)); setNotice('Transcription deleted.') }
    catch { setNotice('Delete failed.') }
  }
  const beginEdit = (item) => { setEditing(item.id); setEditTitle(item.title); setEditText(item.transcript) }
  const updateRecord = async (id) => {
    try {
      const r = await fetch(`${API}/api/transcriptions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editTitle, transcript: editText }) })
      if (!r.ok) throw new Error()
      const item = await r.json(); setRecords(prev => prev.map(x => x.id === id ? item : x)); setEditing(null); setNotice('Changes updated.')
    } catch { setNotice('Update failed.') }
  }
  const copyText = async (text) => { await navigator.clipboard.writeText(text); setNotice('Transcript copied to clipboard.') }
  const filtered = records.filter(r => `${r.title} ${r.transcript} ${r.language}`.toLowerCase().includes(query.toLowerCase()))

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><AudioLines size={22}/></div><div><b>VoxNote</b><small>AI TRANSCRIPTION</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      <div className="nav-active"><FileText size={18}/> Transcriptions <span>{records.length}</span></div>
      <div className="side-bottom"><div className="model-dot"/><div><b>Whisper AI</b><small>Self-hosted model</small></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><div className="eyebrow">AI WORKSPACE / TRANSCRIBE</div><h1>Speech to Text</h1></div><div className="status-pill"><span/> System ready</div></header>
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}
      <section className="hero-grid">
        <div className="record-card">
          <div className="section-head"><div><span className="kicker">LIVE CAPTURE</span><h2>Speak. We’ll write.</h2><p>Capture your thoughts in real time with multilingual AI.</p></div><div className="mic-symbol"><AudioLines size={24}/></div></div>
          <div className={`live-box ${recording ? 'is-live' : ''}`}>
            <div className="live-label"><span className={recording ? 'pulse' : ''}/>{recording ? 'LIVE TRANSCRIPTION' : 'READY TO RECORD'}</div>
            <div className="transcript-area">{transcript || <span className="placeholder">Your words will appear here as you speak…</span>}</div>
            <div className="live-footer"><span><Languages size={15}/> {language}</span><span>{transcript.trim() ? transcript.trim().split(/\s+/).length : 0} words</span></div>
          </div>
          <div className="record-actions">
            {!recording ? <button className="primary-btn" onClick={startRecording} disabled={busy}><Mic size={18}/> {busy ? 'Processing…' : 'Start recording'}</button> : <button className="stop-btn" onClick={stopRecording}><Square size={16} fill="currentColor"/> Stop recording</button>}
            <button className="secondary-btn" onClick={() => { transcriptRef.current=''; setTranscript(''); setNotice('Transcript cleared.') }} disabled={recording}><X size={16}/> Clear</button>
          </div>
          <div className="save-row"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name this transcription"/><button onClick={save} disabled={busy || !transcript.trim()}><Plus size={16}/> Save to history</button></div>
        </div>
        <div className="tips-card"><span className="kicker">QUICK GUIDE</span><h3>Made for natural speech</h3><div className="tip"><div className="tip-num">01</div><div><b>Choose your language naturally</b><p>Switch between Hindi and English in the same sentence.</p></div></div><div className="tip"><div className="tip-num">02</div><div><b>Speak in short phrases</b><p>Clear pauses help the model return cleaner chunks.</p></div></div><div className="tip"><div className="tip-num">03</div><div><b>Save your important notes</b><p>Keep transcripts organized and editable in your history.</p></div></div><div className="model-note"><span className="model-dot"/><div><b>Powered by Faster-Whisper</b><small>Open-source · Runs on your backend</small></div></div></div>
      </section>
      <section className="history-section">
        <div className="history-heading"><div><span className="kicker">YOUR LIBRARY</span><h2>Transcription history <span>{records.length}</span></h2></div><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search transcripts…"/></div></div>
        <div className="history-list">
          {filtered.map(item => <article className="history-item" key={item.id}>
            {editing === item.id ? <div className="edit-form"><input value={editTitle} onChange={e => setEditTitle(e.target.value)}/><textarea value={editText} onChange={e => setEditText(e.target.value)} rows="3"/><div><button className="icon-btn success" onClick={() => updateRecord(item.id)} title="Save"><Check size={17}/></button><button className="icon-btn" onClick={() => setEditing(null)} title="Cancel"><X size={17}/></button></div></div> : <>
              <div className="history-icon"><FileText size={19}/></div><div className="history-body"><div className="history-title">{item.title}</div><p>{item.transcript}</p><div className="meta">{item.language} <span>·</span> {new Date(item.created_at).toLocaleString()}</div></div>
              <div className="item-actions"><button className="icon-btn" onClick={() => copyText(item.transcript)} title="Copy"><Copy size={16}/></button><button className="icon-btn" onClick={() => beginEdit(item)} title="Edit"><Pencil size={16}/></button><button className="icon-btn danger" onClick={() => deleteRecord(item.id)} title="Delete"><Trash2 size={16}/></button></div>
            </>}
          </article>)}
          {!filtered.length && <div className="empty-state"><FileText size={28}/><b>{query ? 'No matching transcripts' : 'No transcriptions yet'}</b><p>{query ? 'Try another search term.' : 'Your saved speech notes will appear here.'}</p></div>}
        </div>
      </section>
      <footer>VoxNote <span>•</span> Built for the Procucev AI Tech assignment</footer>
    </main>
  </div>
}
