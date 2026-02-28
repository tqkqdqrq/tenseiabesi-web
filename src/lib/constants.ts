import type { MachineStatus } from '@/lib/types'

export const MACHINE_STATUSES: MachineStatus[] = ['未確認', 'あり', 'なし', 'エナ']

export const STATUS_LABELS: Record<MachineStatus, string> = {
  '未確認': '未',
  'あり': 'あり',
  'なし': 'なし',
  'エナ': 'エナ',
}

export const STATUS_COLORS: Record<MachineStatus, { bg: string; text: string; border: string }> = {
  '未確認': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-600' },
  'あり': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-400 dark:border-green-600' },
  'なし': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-400 dark:border-red-600' },
  'エナ': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-400 dark:border-yellow-600' },
}

export const STATUS_ACTIVE_COLORS: Record<MachineStatus, { bg: string; text: string; ring: string }> = {
  '未確認': { bg: 'bg-gray-400 dark:bg-gray-500', text: 'text-white', ring: 'ring-gray-400' },
  'あり': { bg: 'bg-green-500 dark:bg-green-600', text: 'text-white', ring: 'ring-green-500' },
  'なし': { bg: 'bg-red-500 dark:bg-red-600', text: 'text-white', ring: 'ring-red-500' },
  'エナ': { bg: 'bg-yellow-500 dark:bg-yellow-600', text: 'text-white', ring: 'ring-yellow-500' },
}
