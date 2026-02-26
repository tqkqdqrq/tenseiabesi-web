import type { Tables } from '@/lib/database.types'

// DB Row types
export type Profile = Tables<'profiles'>
export type Store = Tables<'stores'>
export type Machine = Tables<'machines'>
export type SlotGroup = Tables<'groups'>
export type GroupMember = Tables<'group_members'>
export type GroupStore = Tables<'group_stores'>
export type GroupMachine = Tables<'group_machines'>

// Extended types with JOINs
export type GroupMachineWithProfiles = GroupMachine & {
  contributor: Profile | null
  last_updater: Profile | null
}

export type GroupMemberWithProfile = GroupMember & {
  profile: Profile | null
}

// Status
export type MachineStatus = '未確認' | 'あり' | 'なし' | 'エナ'

// Broadcast payload
export type MachineChangeType =
  | 'statusUpdated'
  | 'countUpdated'
  | 'memoUpdated'
  | 'added'
  | 'deleted'
  | 'reset'
  | 'reordered'

export interface MachineChange {
  machine_id: string
  change_type: MachineChangeType
  changer_user_id: string
  changer_name: string
  store_id: string
}

// Presence
export interface PresenceUser {
  user_id: string
  display_name: string
  joined_at: number
}

// Highlight
export interface HighlightInfo {
  changer_name: string
  change_type: MachineChangeType
}

// RPC results
export interface JoinGroupResult {
  success: boolean
  error?: string
  message?: string
  group_name?: string
}
