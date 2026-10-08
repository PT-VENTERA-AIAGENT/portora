'use client'

import { useMemo, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { moveShortlistEntry, removeShortlistEntry, renameShortlist, updateShortlistNote } from '@/app/actions/recruiter'
import { ROLE_LABELS } from '@/lib/portora/constants'
import { formatRate } from '@/lib/portora/format'
import type { InviteStatus, ShortlistEntry, TalentContact, TalentProfile } from '@/lib/supabase/types'
import StatusBadge from '@/components/portora/StatusBadge'
import TalentAvatar from '@/components/portora/TalentAvatar'

export interface ShortlistRow {
  entry: ShortlistEntry
  talent: TalentProfile
  inviteStatus: InviteStatus | null
  contact: TalentContact | null
}

const NEW_LIST = '__new__'

function csvCell(value: string | null | undefined) {
  const v = value ?? ''
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

function exportCsv(rows: ShortlistRow[]) {
  const header = ['Shortlist', 'Nama', 'Role', 'Lokasi', 'Tarif', 'Skill', 'Tools', 'Profil', 'Status undangan', 'WhatsApp', 'Email', 'Catatan']
  const lines = rows.map(({ entry, talent, inviteStatus, contact }) => [
    entry.list_name,
    talent.full_name,
    ROLE_LABELS[talent.role],
    talent.location,
    formatRate(talent.rate_min, talent.rate_max),
    talent.skills.join('; '),
    talent.tools.join('; '),
    `${window.location.origin}/talent/${talent.username}`,
    inviteStatus ?? 'belum diundang',
    contact?.whatsapp,
    contact?.email,
    entry.note,
  ].map(csvCell).join(','))
  const blob = new Blob([`﻿${[header.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `portora-shortlist-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ShortlistsClient({ rows, growth }: { rows: ShortlistRow[]; growth: boolean }) {
  const [pending, startTransition] = useTransition()

  const lists = useMemo(() => {
    const map = new Map<string, ShortlistRow[]>()
    for (const row of rows) {
      const list = map.get(row.entry.list_name) ?? []
      list.push(row)
      map.set(row.entry.list_name, list)
    }
    return [...map.entries()]
  }, [rows])
  const listNames = lists.map(([name]) => name)

  function run(fn: () => Promise<{ error?: string }>, success?: string) {
    startTransition(async () => {
      const result = await fn()
      if (result.error) toast.error(result.error)
      else if (success) toast.success(success)
    })
  }

  function onMove(entryId: string, value: string) {
    if (value === NEW_LIST) {
      const name = prompt('Nama shortlist baru')?.trim()
      if (name) run(() => moveShortlistEntry(entryId, name), `Dipindah ke "${name}"`)
      return
    }
    run(() => moveShortlistEntry(entryId, value), `Dipindah ke "${value}"`)
  }

  function onRename(oldName: string) {
    const name = prompt('Ganti nama shortlist', oldName)?.trim()
    if (name && name !== oldName) run(() => renameShortlist(oldName, name), 'Nama shortlist diganti')
  }

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs mb-2 font-mono" style={{ color: '#6B7280' }}>
            <span>Workspace</span><span>/</span><span style={{ color: '#0A0E1A' }}>Shortlist</span>
          </div>
          <h1 className="text-3xl font-display tracking-tight">Shortlist</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{rows.length} talent tersimpan di {lists.length} shortlist.</p>
        </div>
        {rows.length > 0 && (
          growth ? (
            <button onClick={() => exportCsv(rows)} className="border px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
              Export CSV
            </button>
          ) : (
            <Link href="/company#paket" className="text-xs hover:underline" style={{ color: '#6B7280' }}>Export CSV & shortlist tak terbatas di paket Growth →</Link>
          )
        )}
      </div>

      {rows.length === 0 ? (
        <div className="border rounded-2xl p-10 text-center" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <p className="font-medium mb-1">Shortlist masih kosong</p>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Simpan talent dari halaman Discover dengan ikon bookmark.</p>
          <Link href="/discover" className="inline-block text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>Cari talent</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {lists.map(([name, listRows]) => (
            <section key={name}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-semibold">{name}</h2>
                <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{listRows.length} talent</span>
                <button onClick={() => onRename(name)} disabled={pending} className="text-xs hover:underline" style={{ color: '#1A365D' }}>Ganti nama</button>
              </div>
              <div className="space-y-3">
                {listRows.map(({ entry, talent, inviteStatus, contact }) => (
                  <div key={entry.id} className="border rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <Link href={`/talent/${talent.username}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80">
                        <TalentAvatar name={talent.full_name} url={talent.avatar_url} size={44} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{talent.full_name}</p>
                          <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                            {ROLE_LABELS[talent.role]}{talent.location ? ` · ${talent.location}` : ''}{formatRate(talent.rate_min, talent.rate_max) ? ` · ${formatRate(talent.rate_min, talent.rate_max)}` : ''}
                          </p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {inviteStatus ? <StatusBadge status={inviteStatus} /> : <span className="text-[11px]" style={{ color: '#6B7280' }}>Belum diundang</span>}
                        {contact?.whatsapp && <span className="text-[11px] font-mono" style={{ color: '#0D9488' }}>{contact.whatsapp}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select value={entry.list_name} onChange={e => onMove(entry.id, e.target.value)} disabled={pending}
                          className="border rounded-lg px-2 py-1.5 text-xs outline-none" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                          {listNames.map(n => <option key={n} value={n}>{n}</option>)}
                          <option value={NEW_LIST}>+ Shortlist baru…</option>
                        </select>
                        <button onClick={() => run(() => removeShortlistEntry(entry.id), 'Dihapus dari shortlist')} disabled={pending}
                          className="text-xs border px-2.5 py-1.5 rounded-lg hover:opacity-80" style={{ borderColor: '#E5E7EB', color: '#DC2626' }}>
                          Hapus
                        </button>
                      </div>
                    </div>
                    <textarea
                      defaultValue={entry.note ?? ''}
                      onBlur={e => { if (e.target.value !== (entry.note ?? '')) run(() => updateShortlistNote(entry.id, e.target.value), 'Catatan disimpan') }}
                      rows={1}
                      maxLength={500}
                      placeholder="Catatan internal (mis. cocok untuk campaign Q4)…"
                      className="mt-3 w-full border rounded-lg px-3 py-2 text-sm outline-none resize-y focus:border-navy"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
