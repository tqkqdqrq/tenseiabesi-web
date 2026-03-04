/**
 * JST (UTC+9) の日付文字列を返す
 */
function getJSTDateString(): string {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().split('T')[0]
}

/**
 * 指定ストアの自動リセットが必要かチェック
 * localStorage の lastResetDate_{storeId} と今日のJST日付を比較
 */
export function shouldAutoReset(storeId: string): boolean {
  const today = getJSTDateString()
  const lastReset = localStorage.getItem(`lastResetDate_${storeId}`)
  return lastReset !== today
}

/**
 * リセット完了をlocalStorageに記録
 */
export function markResetDone(storeId: string): void {
  const today = getJSTDateString()
  localStorage.setItem(`lastResetDate_${storeId}`, today)
}
