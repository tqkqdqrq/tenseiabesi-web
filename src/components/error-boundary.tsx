'use client'

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-lg font-semibold">エラーが発生しました</p>
          <p className="text-sm text-muted-foreground text-center">
            予期せぬエラーが発生しました。ページを再読み込みしてください。
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
          >
            再読み込み
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
