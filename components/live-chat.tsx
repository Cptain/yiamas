"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { PaperPlaneRightIcon, SmileyIcon, UsersIcon, ChatCircleIcon, CheckIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  GIFT_BY_ID,
  PRESET_BY_ID,
  categoryColor,
  type ChatMessage,
} from "@/lib/festival-data"

const EMOJI_LIST = [
  "😄", "😂", "😍", "👏", "🙌", "👊",
  "❤️", "💙", "💛", "🙏", "🎉", "🍺",
  "😎", "🥰", "😱", "🙋", "💃", "🕺",
  "🎶", "🏆", "⭐", "💯", "🕊️", "🔥",
]

const NAME_COLOR_VARS = ["--primary", "--accent", "--terracotta", "--chart-4", "--chart-5"]

function nameColor(user: string) {
  let sum = 0
  for (let i = 0; i < user.length; i++) sum += user.charCodeAt(i)
  return NAME_COLOR_VARS[sum % NAME_COLOR_VARS.length]
}

function userStyle(msg: { user: string; isYou?: boolean }) {
  return { color: msg.isYou ? "var(--accent)" : `var(${nameColor(msg.user)})` }
}

function DonationLine({ msg }: { msg: ChatMessage }) {
  const gift = msg.giftId ? GIFT_BY_ID[msg.giftId] : undefined
  if (!gift) return null
  const preset = msg.presetId ? PRESET_BY_ID[msg.presetId] : undefined
  const Icon = preset?.icon ?? gift.icon
  const color = categoryColor(gift.category)
  return (
    <div className={`chat__donation chat__donation--${color} animate-chat-in`}>
      <Icon className="chat__donation-icon" />
      <p className="chat__donation-text">
        <span className="chat__user" style={userStyle(msg)}>
          {msg.user}
        </span>{" "}
        <span className="chat__donation-verb">έστειλε</span>{" "}
        <span className="chat__donation-gift">
          {msg.quantity && msg.quantity > 1 ? `${msg.quantity}× ` : ""}
          {msg.label ? msg.label.toLowerCase() : gift.name}
        </span>
        <span className="chat__donation-amount">{(msg.amount ?? 0).toFixed(2)}€</span>
        {msg.text && <span className="chat__donation-msg"> — {msg.text}</span>}
      </p>
    </div>
  )
}

type LiveChatProps = {
  messages: ChatMessage[]
  viewers: number
  onSend: (text: string, nickname: string) => void
  nickname: string
  onNicknameChange: (name: string) => void
}

const NICKNAME_KEY = "yiamas:nickname"

function NicknamePrompt({ onSave, onDismiss }: { onSave: (name: string) => void; onDismiss: () => void }) {
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  return (
    <div className="chat__nickname-backdrop" onClick={onDismiss}>
      <div className="chat__nickname-popup" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Εισαγωγή χρήστη">
        <p className="chat__nickname-title">Πώς να σε πούμε;</p>
        <form onSubmit={handleSubmit} className="chat__nickname-form">
          <div className="chat__nickname-field">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Το ψευδώνυμό σου…"
              maxLength={30}
              className="chat__nickname-input"
            />
            <button type="submit" disabled={!draft.trim()} className="chat__nickname-submit" aria-label="Αποθήκευση">
              <CheckIcon weight="bold" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function LiveChat({ messages, viewers, onSend, nickname, onNicknameChange }: LiveChatProps) {
  const [value, setValue] = useState("")
  const [nicknamePromptOpen, setNicknamePromptOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const emojiRef = useRef<HTMLDivElement>(null)
  const composingRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!emojiOpen) return
    function handleOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [emojiOpen])

  function submit() {
    const text = value.trim()
    if (!text) return
    onSend(text, nickname || "Ανώνυμος")
    setValue("")
  }

  function handleInputFocus() {
    if (!nickname) setNicknamePromptOpen(true)
  }

  function handleNicknameSave(name: string) {
    try { localStorage.setItem(NICKNAME_KEY, name) } catch { /* ignore */ }
    onNicknameChange(name)
    setNicknamePromptOpen(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="chat">
      {nicknamePromptOpen && (
        <NicknamePrompt
          onSave={handleNicknameSave}
          onDismiss={() => setNicknamePromptOpen(false)}
        />
      )}
      {/* Header */}
      <div className="chat__header">
        <div className="chat__title">
          <ChatCircleIcon />
          <h2>Ζωντανή Συνομιλία</h2>
        </div>
        <div className="chat__viewers">
          <UsersIcon />
          {viewers.toLocaleString()}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="chat__messages">
        {messages.map((msg) =>
          msg.giftId ? (
            <DonationLine key={msg.id} msg={msg} />
          ) : (
            <div key={msg.id} className="chat__message animate-chat-in">
              <span className="chat__user" style={userStyle(msg)}>
                {msg.user}
              </span>
              <span className="chat__message-sep">: </span>
              <span className="chat__message-text">{msg.text}</span>
            </div>
          ),
        )}
      </div>

      {/* Input */}
      <div className="chat__footer">
        <div className="chat__input-row">
          <div ref={emojiRef} className="chat__emoji-wrap">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Επιλογή emoji"
              aria-expanded={emojiOpen}
              onClick={() => setEmojiOpen((o) => !o)}
              className="chat__emoji-btn"
            >
              <SmileyIcon />
            </Button>
            {emojiOpen && (
              <div className="chat__emoji-picker" role="dialog" aria-label="Emoji">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="chat__emoji-item"
                    onClick={() => {
                      setValue((v) => v + emoji)
                      setEmojiOpen(false)
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={handleInputFocus}
            onCompositionStart={() => (composingRef.current = true)}
            onCompositionEnd={() => (composingRef.current = false)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !composingRef.current &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Πες κάτι στο πλήθος…"
            aria-label="Μήνυμα συνομιλίας"
            maxLength={200}
            className="chat__input"
          />
          <Button
            type="button"
            size="icon"
            onClick={submit}
            disabled={!value.trim()}
            aria-label="Αποστολή μηνύματος"
            className="chat__send"
          >
            <PaperPlaneRightIcon />
          </Button>
        </div>
        <p
          className="chat__note"
          title="Να είσαι ευγενικός, φιλότιμο πάνω απ' όλα."
        >
          Να είσαι ευγενικός, φιλότιμο πάνω απ' όλα.
        </p>
      </div>
    </div>
  )
}
