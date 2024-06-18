import React, { KeyboardEventHandler, useContext, useRef } from 'react'

import { ClearOutlined, SendOutlined } from '@ant-design/icons'

import { ChatRole, SendBarProps } from './interface'
import Show from './Show'
import LanguageContext from '../Context/targetLanguageContext'

const SendBar = (props: SendBarProps) => {
  const { loading, disabled, onSend, onClear, onStop } = props

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const onInputAutoSize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.style.height = 'auto'
      onClear()
    }
  }

  const languageContext = useContext(LanguageContext);

  const handleSend = () => {
    const content = inputRef.current?.value

    console.log('handle send: ' + languageContext?.targetLanguage);

    if (content) {
      inputRef.current!.value = ''
      inputRef.current!.style.height = 'auto'
      onSend({
        content,
        role: ChatRole.User
      }, languageContext?.targetLanguage??"中文")
    }
  }

  const onKeydown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.shiftKey) {
      return
    }

    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend()
    }
  }

  return (
    <Show
      fallback={
        <div className="thinking">
          <span>Please wait ...</span>
          <div className="stop" onClick={onStop}>
            Stop
          </div>
        </div>
      }
      loading={loading}
    >
      <div className="send-bar">
        <textarea
          ref={inputRef!}
          className="input"
          disabled={disabled}
          placeholder="Shift + Enter for new line"
          autoComplete="off"
          rows={1}
          onKeyDown={onKeydown}
          onInput={onInputAutoSize}
        />
        <button className="button" title="Send" disabled={disabled} onClick={handleSend}>
          <SendOutlined />
        </button>
        <button className="button" title="Clear" disabled={disabled} onClick={handleClear}>
          <ClearOutlined />
        </button>
      </div>
    </Show>
  )
}

export default SendBar
