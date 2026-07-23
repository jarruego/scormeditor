import { useEffect, useMemo, useRef, useState } from 'react'
import { SettingsWindow } from './SettingsModal'
import { CloudTeamModal } from './CloudTeamModal'
import { CloudTrashModal } from './CloudTrashModal'
import { Icon } from './Icon'
import { confirmDialog } from '../store/confirm'
import { useCourseStore } from '../store/courseStore'
import { isCloudConfigured } from '../cloud/client'
import { useCloudSessionStore } from '../cloud/session'
import { signInWithMagicLink, signOut } from '../cloud/auth'
import {
  listOrganizations, createOrganization, listDocuments, createCloudDocument,
  getLatestVersion, downloadVersionBlob, renameDocument, moveDocumentToFolder, trashDocument,
} from '../cloud/documents'
import { listFolders, createFolder, renameFolder, deleteFolder, listMyFolderRoles } from '../cloud/folders'
import { listMyRoles } from '../cloud/members'
import { saveCurrentProject } from '../cloud/sync'
import type { CloudOrganization, CloudDocument, CloudFolder, OrgRole, FolderRole } from '../cloud/types'
import { buildProjectBlob, loadProjectFromBlob, clearLocalLink, persistToIndexedDb } from '../store/autosave'
import { FolderAccessModal } from './FolderAccessModal'

type SortBy = 'name' | 'updated'

function sortByCriteria<T extends { updated_at: string }>(list: T[], sortBy: SortBy, name: (item: T) => string): T[] {
  return [...list].sort((a, b) =>
    sortBy === 'name' ? name(a).localeCompare(name(b), 'es') : b.updated_at.localeCompare(a.updated_at),
  )
}

/**
 * Renombrado inline al estilo `InlineRename` (mismo aspecto: lápiz → input),
 * pero con confirmación explícita en vez de comitear cada pulsación: aquí
 * cada cambio es una llamada de red (Supabase), así que solo se envía UNA
 * vez, al perder el foco o pulsar Enter — no en cada tecla.
 */
function CloudRename({ value, onCommit, title }: { value: string; onCommit: (next: string) => void; title: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) { setDraft(value); requestAnimationFrame(() => inputRef.current?.select()) }
  }, [editing, value])

  function commit() {
    setEditing(false)
    const next = draft.trim()
    if (next && next !== value) onCommit(next)
  }

  if (!editing) {
    return (
      <>
        <span className="ed-rename-text">{value}</span>
        <button type="button" className="ed-rename" title={title} aria-label={title}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true) }}
          onKeyDown={(e) => e.stopPropagation()}>
          <Icon name="pencil" size={13} />
        </button>
      </>
    )
  }
  return (
    <input
      ref={inputRef}
      className="ed-rename-input"
      value={draft}
      aria-label={title}
      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        // stopPropagation: cuando esto vive dentro de una fila-carpeta
        // clicable (role="button" con Enter para abrir), Intro debe
        // confirmar el renombrado, no además "abrir" la carpeta.
        if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commit() }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setEditing(false) }
      }}
    />
  )
}

/** Botón «Mover a…» con desplegable (mismo patrón que los menús Archivo/Ajustes de la Toolbar).
 *  `folders` debe llegar ya filtrada a carpetas donde el usuario tiene acceso de edición — mover
 *  a una carpeta solo de lectura, o quitarle la carpeta («Sin carpeta», exclusivo del owner de
 *  la organización — sin carpeta no hay concesión que comprobar), lo rechazaría el servidor. */
function MoveMenu({ doc, folders, onMove, disabled, isOwner }: {
  doc: CloudDocument
  folders: CloudFolder[]
  onMove: (folderId: string | null) => void
  disabled: boolean
  isOwner: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const targets = folders.filter((f) => f.id !== doc.folder_id)

  return (
    <div className="ed-menu" ref={ref}>
      <button className="ed-menu-trigger ed-btn-ghost" disabled={disabled} onClick={() => setOpen((o) => !o)} title="Mover a otra carpeta">
        <Icon name="folder" size={13} /> Mover a…
      </button>
      {open && (
        <div className="ed-menu-list" role="menu">
          {isOwner && doc.folder_id !== null && (
            <button role="menuitem" onClick={() => { setOpen(false); onMove(null) }}>— Sin carpeta —</button>
          )}
          {targets.map((f) => (
            <button key={f.id} role="menuitem" onClick={() => { setOpen(false); onMove(f.id) }}>{f.name}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function confirmDiscard() {
  return confirmDialog({
    title: 'Reemplazar el curso abierto',
    message: 'Esto reemplazará el curso que tienes abierto. Los cambios que no hayas subido o guardado se perderán. ¿Continuar?',
    confirmLabel: 'Continuar',
    danger: true,
  })
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Slug simple para el alta de organización: minúsculas, sin acentos, guiones. */
// .toLowerCase() ya pasa Á→á, É→é… así que el mapa solo necesita minúsculas.
const ACCENTS: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n' }
function slugify(s: string) {
  const base = s.trim().toLowerCase().split('').map((c) => ACCENTS[c] ?? c).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '')
  return base || `org-${Date.now()}`
}

/**
 * Ventana «Nube»: alta/login (enlace mágico), organizaciones, explorador de
 * carpetas/proyectos (un solo nivel, sin subcarpetas) y subir/abrir. La
 * gestión de equipo vive aparte (`CloudTeamModal`, botón junto al título).
 * Fase 1 del análisis de arquitectura de nube: sincronización manual
 * («subir»/«abrir»), sin autoguardado continuo ni bloqueos — eso llega en
 * fases posteriores. Oculta por completo si no hay credenciales de Supabase
 * configuradas (`isCloudConfigured`).
 */
export function CloudModal({ onClose }: { onClose: () => void }) {
  const session = useCloudSessionStore((s) => s.session)
  const checkingSession = !useCloudSessionStore((s) => s.checked)
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const [orgs, setOrgs] = useState<CloudOrganization[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [newOrgName, setNewOrgName] = useState('')
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [trashModalOpen, setTrashModalOpen] = useState(false)

  const [docs, setDocs] = useState<CloudDocument[]>([])
  const [uploadTitle, setUploadTitle] = useState('')

  const [folders, setFolders] = useState<CloudFolder[]>([])
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderSearch, setFolderSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  // Carpeta que se está explorando ahora mismo (un solo nivel: null = raíz).
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  // Carpeta elegida para la PRÓXIMA subida: por defecto sigue a la que se
  // esté explorando (si navegas dentro de una carpeta y subes, cae ahí),
  // pero es un campo aparte para poder elegir otra sin tener que navegar antes.
  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null)

  const [myRoles, setMyRoles] = useState<Record<string, OrgRole>>({})
  // Rol de ORGANIZACIÓN: sigue gobernando lo que es de la organización entera
  // (crear carpetas, gestionar equipo, papelera, «Sin carpeta»). Para
  // editar/renombrar/mover/subir dentro de una carpeta o documento concretos
  // manda `canEditFolder` (permisos por carpeta, migración
  // `20260723000004_permisos_por_carpeta`), no este `canEdit` plano.
  const isOwner = !!orgId && myRoles[orgId] === 'owner'
  const canEdit = !!orgId && (myRoles[orgId] === 'owner' || myRoles[orgId] === 'editor')
  // Tus concesiones explícitas de `folder_access` (no incluye las carpetas
  // que ves solo por ser owner de la organización — para eso ya basta `isOwner`).
  const [myFolderRoles, setMyFolderRoles] = useState<Record<string, FolderRole>>({})
  const canEditFolder = (folderId: string | null) => isOwner || (folderId !== null && myFolderRoles[folderId] === 'editor')
  // Carpetas donde SÍ se puede subir/mover — el destino de un documento
  // nuevo, o de «Mover a…», nunca puede ser una carpeta de solo lectura.
  const editableFolders = useMemo(
    () => folders.filter((f) => canEditFolder(f.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folders, myFolderRoles, isOwner],
  )
  const [folderAccessTarget, setFolderAccessTarget] = useState<CloudFolder | null>(null)
  const currentOrg = orgs.find((o) => o.id === orgId)

  useEffect(() => {
    if (!accountMenuOpen) return
    function onDown(e: MouseEvent) { if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) setAccountMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [accountMenuOpen])

  // Documentos agrupados por carpeta (null = sin carpeta / raíz), para el explorador.
  const docsByFolder = useMemo(() => {
    const map = new Map<string | null, CloudDocument[]>()
    for (const d of docs) {
      const key = d.folder_id
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    }
    return map
  }, [docs])

  const visibleFolders = useMemo(() => {
    const q = folderSearch.trim().toLowerCase()
    const filtered = q ? folders.filter((f) => f.name.toLowerCase().includes(q)) : folders
    return sortByCriteria(filtered, sortBy, (f) => f.name)
  }, [folders, folderSearch, sortBy])

  function sortedDocs(list: CloudDocument[]) {
    return sortByCriteria(list, sortBy, (d) => d.title)
  }

  const course = useCourseStore((s) => s.course)
  const cloudDocumentId = useCourseStore((s) => s.cloudDocumentId)
  const cloudOrgId = useCourseStore((s) => s.cloudOrgId)
  const projectDirty = useCourseStore((s) => s.projectDirty)
  const cloudStale = useCourseStore((s) => s.cloudStale)
  const cloudLockHolderEmail = useCourseStore((s) => s.cloudLockHolderEmail)
  // Rol EFECTIVO sobre el documento que tienes abierto ahora mismo (no el rol
  // de organización): lo calcula/mantiene src/cloud/watch.ts al vuelo, así
  // que aquí solo se lee — gobierna «Actualizar en la nube» sobre ESE
  // documento, que puede depender de una concesión de carpeta distinta de tu
  // rol de organización.
  const cloudMyRole = useCourseStore((s) => s.cloudMyRole)
  const canEditCurrent = cloudMyRole === 'owner' || cloudMyRole === 'editor'

  // Organizaciones (+ tu rol en cada una, + tus concesiones por carpeta) al
  // iniciar sesión; preselecciona la ya vinculada, si la hay.
  useEffect(() => {
    if (!session) { setOrgs([]); setOrgId(null); setMyRoles({}); setMyFolderRoles({}); return }
    setBusy(true)
    setError(null)
    Promise.all([listOrganizations(), listMyRoles(), listMyFolderRoles()])
      .then(([list, roles, folderRoles]) => {
        setOrgs(list)
        setMyRoles(roles)
        setMyFolderRoles(folderRoles)
        setOrgId(cloudOrgId && list.some((o) => o.id === cloudOrgId) ? cloudOrgId : (list[0]?.id ?? null))
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setBusy(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    setUploadTitle(course.course.title || 'Curso sin título')
  }, [course.course.title])

  async function refreshDocs(forOrgId: string) {
    setDocs(await listDocuments(forOrgId))
  }

  // La carpeta destino de la próxima subida sigue a la que se está
  // explorando (navegar dentro de una carpeta la preselecciona), pero queda
  // libre para cambiarla aparte sin tener que navegar.
  useEffect(() => {
    setUploadFolderId(currentFolderId)
  }, [currentFolderId])

  // Quien no es owner NO puede subir «Sin carpeta» (el servidor lo rechaza:
  // sin carpeta no hay concesión que comprobar). Si la carpeta que se estaba
  // explorando (o ninguna) no es editable para esta persona, se cae a la
  // primera carpeta editable que tenga — así el <select> controlado nunca
  // queda desincronizado con lo que de verdad se va a subir.
  useEffect(() => {
    if (isOwner) return
    if (uploadFolderId && editableFolders.some((f) => f.id === uploadFolderId)) return
    setUploadFolderId(editableFolders[0]?.id ?? null)
  }, [isOwner, editableFolders, uploadFolderId])

  // Documentos + carpetas al cambiar de organización; vuelve a la raíz del explorador.
  useEffect(() => {
    setCurrentFolderId(null)
    setFolderSearch('')
    if (!orgId) { setDocs([]); setFolders([]); return }
    setBusy(true)
    setError(null)
    Promise.all([refreshDocs(orgId), listFolders(orgId).then(setFolders)])
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setBusy(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

  async function onCreateFolder() {
    if (!orgId || !newFolderName.trim()) return
    setBusy(true)
    setError(null)
    try {
      await createFolder(orgId, newFolderName.trim())
      setNewFolderName('')
      setCreatingFolder(false)
      setFolders(await listFolders(orgId))
      // Quien crea la carpeta se concede 'editor' sobre ella automáticamente
      // (trigger en el servidor) — sin esto, `myFolderRoles` no lo reflejaría
      // hasta la próxima vez que se abriera ☁ Nube.
      setMyFolderRoles(await listMyFolderRoles())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onRenameFolder(folderId: string, name: string) {
    if (!orgId) return
    setBusy(true)
    setError(null)
    try {
      await renameFolder(folderId, name)
      setFolders(await listFolders(orgId))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onDeleteFolder(folderId: string) {
    const ok = await confirmDialog({
      title: 'Borrar carpeta',
      message: 'Los proyectos que contiene NO se borran: quedan sin carpeta. ¿Continuar?',
      confirmLabel: 'Borrar',
      danger: true,
    })
    if (!ok || !orgId) return
    setBusy(true)
    setError(null)
    try {
      await deleteFolder(folderId)
      if (currentFolderId === folderId) setCurrentFolderId(null)
      setFolders(await listFolders(orgId))
      await refreshDocs(orgId)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onSendLink() {
    setAuthError(null)
    if (!email.trim()) return
    setBusy(true)
    const { error } = await signInWithMagicLink(email.trim())
    setBusy(false)
    if (error) {
      // Mensaje de Supabase cuando el correo no tiene cuenta todavía
      // (shouldCreateUser: false, ver src/cloud/auth.ts): se traduce a algo
      // accionable en vez del texto crudo de la API.
      setAuthError(
        /signups? not allowed|user not found/i.test(error)
          ? 'Ese correo todavía no tiene cuenta. Pide a quien administre la organización que te dé de alta desde Supabase (Authentication → Users → «Invite user»).'
          : error,
      )
    } else {
      setLinkSent(true)
    }
  }

  async function onCreateOrg() {
    if (!newOrgName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const id = await createOrganization(newOrgName.trim(), slugify(newOrgName))
      setNewOrgName('')
      setOrgs(await listOrganizations())
      setOrgId(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onOpenDoc(doc: CloudDocument) {
    if (projectDirty && !(await confirmDiscard())) return
    setBusy(true)
    setError(null)
    try {
      const version = await getLatestVersion(doc.id)
      if (!version) throw new Error('Este proyecto todavía no tiene ninguna versión subida.')
      const blob = await downloadVersionBlob(version.storage_path)
      const kind = await loadProjectFromBlob(blob)
      if (kind === false) throw new Error('El proyecto descargado no es válido.')
      await clearLocalLink()
      useCourseStore.getState().setCloudLink(doc.id, doc.org_id, doc.title)
      // Sin esto, cloudVersionId se queda en null y la comprobación de «hay
      // una versión más reciente» (src/cloud/watch.ts) la da siempre por
      // distinta — mismo bug ya corregido en onPullLatest.
      useCourseStore.getState().setCloudVersion(version.id)
      await persistToIndexedDb()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onUploadNew() {
    if (!orgId) return
    setBusy(true)
    setError(null)
    try {
      const title = uploadTitle.trim() || 'Curso sin título'
      const blob = await buildProjectBlob()
      const { documentId, versionId } = await createCloudDocument({ orgId, folderId: uploadFolderId, title, courseSlug: course.course.id, blob })
      useCourseStore.getState().setCloudLink(documentId, orgId, title)
      useCourseStore.getState().setCloudVersion(versionId)
      useCourseStore.getState().setProjectDirty(false)
      await persistToIndexedDb()
      await refreshDocs(orgId)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onRenameDocument(d: CloudDocument, title: string) {
    setBusy(true)
    setError(null)
    try {
      await renameDocument(d.id, title)
      // Si es el documento abierto ahora mismo, el título guardado en el
      // store (el que se ve en el tooltip del indicador de guardado) debe
      // seguir coincidiendo con el de la nube.
      if (d.id === cloudDocumentId) {
        useCourseStore.getState().setCloudLink(cloudDocumentId, cloudOrgId, title)
        await persistToIndexedDb()
      }
      if (orgId) await refreshDocs(orgId)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onMoveDocument(documentId: string, folderId: string | null) {
    if (!orgId) return
    setBusy(true)
    setError(null)
    try {
      await moveDocumentToFolder(documentId, folderId)
      await refreshDocs(orgId)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onTrashDocument(d: CloudDocument) {
    const ok = await confirmDialog({
      title: 'Eliminar proyecto',
      message: `«${d.title}» se moverá a la papelera de la organización. ¿Continuar?`,
      confirmLabel: 'Eliminar',
      danger: true,
    })
    if (!ok || !orgId) return
    setBusy(true)
    setError(null)
    try {
      await trashDocument(d.id)
      // Si era el documento abierto, se desvincula: seguir "vinculado" a un
      // proyecto borrado daría una falsa sensación de sincronización.
      if (d.id === cloudDocumentId) {
        useCourseStore.getState().setCloudLink(null, null, null)
        useCourseStore.getState().setProjectDirty(true)
        await persistToIndexedDb()
      }
      await refreshDocs(orgId)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onUpdateLinked() {
    if (!cloudDocumentId || !cloudOrgId) return
    setBusy(true)
    setError(null)
    try {
      // Mismo orquestador que Ctrl+S / el indicador de la Toolbar (src/cloud/sync.ts):
      // un único camino para «subir a la nube», nunca dos implementaciones que puedan divergir.
      await saveCurrentProject()
      await refreshDocs(cloudOrgId)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  /** Sitúa el explorador justo en la carpeta donde vive el proyecto vinculado. */
  async function onLocateLinked() {
    if (!cloudDocumentId || !cloudOrgId) return
    setBusy(true)
    setError(null)
    try {
      const list = orgId === cloudOrgId ? docs : await listDocuments(cloudOrgId)
      if (orgId !== cloudOrgId) setOrgId(cloudOrgId)
      const linked = list.find((d) => d.id === cloudDocumentId)
      setCurrentFolderId(linked?.folder_id ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  /**
   * Baja la última versión subida por cualquiera (incluida otra persona) y
   * reemplaza el curso abierto con ella. Es el sentido contrario de
   * «Actualizar en la nube» (que solo sube) — se usa tanto a mano como desde
   * el aviso automático de «hay una versión más reciente» (`src/cloud/watch.ts`).
   */
  async function onPullLatest() {
    if (!cloudDocumentId || !cloudOrgId) return
    if (projectDirty && !(await confirmDiscard())) return
    setBusy(true)
    setError(null)
    try {
      const version = await getLatestVersion(cloudDocumentId)
      if (!version) throw new Error('Este proyecto todavía no tiene ninguna versión subida.')
      const blob = await downloadVersionBlob(version.storage_path)
      const kind = await loadProjectFromBlob(blob)
      if (kind === false) throw new Error('El proyecto descargado no es válido.')
      // loadProjectFromBlob desvincula siempre (ver su comentario): al ser el
      // mismo documento que ya estaba abierto, se re-vincula con su mismo id.
      // setCloudVersion DESPUÉS de setCloudLink: setCloudLink resetea
      // cloudVersionId a null al detectar un documento "nuevo" (porque acaba
      // de venir de la desvinculación de loadProjectFromBlob) — si se llamara
      // antes, ese reset lo pisaría y quedaría en null para siempre, dando un
      // falso «hay una versión más reciente» en cada recarga (bug real: así
      // se manifestaba).
      const title = useCourseStore.getState().course.course.title || 'Curso sin título'
      useCourseStore.getState().setCloudLink(cloudDocumentId, cloudOrgId, title)
      useCourseStore.getState().setCloudVersion(version.id)
      await persistToIndexedDb()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function onSignOut() {
    setAccountMenuOpen(false)
    // Sin sesión no hay forma de seguir sincronizando: si el curso abierto
    // está vinculado a la nube, avisar del cambio de modo ANTES de cerrar
    // sesión (es el único momento en que se puede echar atrás). El contenido
    // no se toca — solo deja de estar vinculado, y pasa a «local, sin
    // guardar» para no dar la falsa sensación de que sigue sincronizado.
    const linkedId = useCourseStore.getState().cloudDocumentId
    const linkedTitle = useCourseStore.getState().cloudTitle
    if (linkedId) {
      const ok = await confirmDialog({
        title: 'Cerrar sesión',
        message: `«${linkedTitle}» está vinculado a la nube. Al cerrar sesión seguirás editándolo, pero pasa a modo LOCAL: no se subirá ningún cambio más hasta que vuelvas a iniciar sesión y lo reconectes desde ☁ Nube. ¿Continuar?`,
        confirmLabel: 'Cerrar sesión',
        danger: true,
      })
      if (!ok) return
    }
    setBusy(true)
    await signOut()
    if (linkedId) {
      useCourseStore.getState().setCloudLink(null, null, null)
      useCourseStore.getState().setProjectDirty(true)
      await persistToIndexedDb()
    }
    setBusy(false)
    setOrgs([])
    setDocs([])
    setMyRoles({})
    setMyFolderRoles({})
    setFolders([])
    setCurrentFolderId(null)
    setTeamModalOpen(false)
    setTrashModalOpen(false)
    setFolderAccessTarget(null)
  }

  function docRow(d: CloudDocument) {
    const editable = canEditFolder(d.folder_id)
    return (
      <div key={d.id} className="ed-cloud-row">
        <div className="ed-cloud-row-info">
          <div>
            {editable ? (
              <CloudRename value={d.title} title="Renombrar proyecto" onCommit={(next) => void onRenameDocument(d, next)} />
            ) : (
              <strong>{d.title}</strong>
            )}
          </div>
          <span className="ed-hint">{fmtDate(d.updated_at)} · {fmtBytes(d.size_bytes)}</span>
        </div>
        <div className="ed-cloud-row-actions">
          {editable && editableFolders.length > 0 && (
            <MoveMenu doc={d} folders={editableFolders} isOwner={isOwner} disabled={busy}
              onMove={(folderId) => void onMoveDocument(d.id, folderId)} />
          )}
          {d.id === cloudDocumentId ? (
            <span className="ed-hint">Abierto</span>
          ) : (
            <button className="ed-btn-solid ed-btn-cloud" disabled={busy} onClick={() => void onOpenDoc(d)}>Abrir</button>
          )}
          {editable && (
            <button className="ed-icobtn ed-icobtn-danger" disabled={busy} onClick={() => void onTrashDocument(d)} title="Eliminar proyecto (papelera)" aria-label={`Eliminar «${d.title}»`}>
              <Icon name="trash" size={14} />
            </button>
          )}
        </div>
      </div>
    )
  }

  function folderTile(f: CloudFolder) {
    const inside = docsByFolder.get(f.id) ?? []
    const totalSize = inside.reduce((sum, d) => sum + d.size_bytes, 0)
    const editable = canEditFolder(f.id)
    return (
      <div key={f.id} className="ed-cloud-row ed-cloud-folder-tile" onClick={() => setCurrentFolderId(f.id)}
        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setCurrentFolderId(f.id) }}>
        <div className="ed-cloud-row-info">
          <div>
            <Icon name="folder" size={16} />{' '}
            {editable ? (
              <CloudRename value={f.name} title="Renombrar carpeta" onCommit={(next) => void onRenameFolder(f.id, next)} />
            ) : (
              <strong>{f.name}</strong>
            )}
          </div>
          <span className="ed-hint">{inside.length} proyecto(s) · {fmtBytes(totalSize)} · {fmtDate(f.updated_at)}</span>
        </div>
        <div className="ed-cloud-row-actions">
          {isOwner && (
            <button className="ed-icobtn" disabled={busy}
              onClick={(e) => { e.stopPropagation(); setFolderAccessTarget(f) }}
              onKeyDown={(e) => e.stopPropagation()}
              title="Gestionar quién tiene acceso a esta carpeta" aria-label={`Gestionar acceso a «${f.name}»`}>
              <Icon name="users" size={14} />
            </button>
          )}
          <Icon name="chevron-right" size={14} />
          {editable && (
            <button className="ed-icobtn ed-icobtn-danger" disabled={busy}
              onClick={(e) => { e.stopPropagation(); void onDeleteFolder(f.id) }}
              onKeyDown={(e) => e.stopPropagation()}
              title="Borrar carpeta (los proyectos no se borran, quedan sin carpeta)" aria-label={`Borrar carpeta «${f.name}»`}>
              <Icon name="trash" size={14} />
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!isCloudConfigured()) {
    return (
      <SettingsWindow title="Nube" onClose={onClose}>
        <p className="ed-hint">
          Este editor no tiene configurada la nube (faltan las variables de entorno de Supabase). El trabajo
          en local sigue funcionando exactamente igual.
        </p>
      </SettingsWindow>
    )
  }

  const headerExtra = session ? (
    <div className="ed-modal-head-extra">
      {currentOrg && orgs.length > 1 && (
        <select
          className="ed-modal-org-switch"
          value={orgId ?? ''}
          onChange={(e) => setOrgId(e.target.value)}
          aria-label="Cambiar de organización"
        >
          {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      )}
      {currentOrg && (
        <button className="ed-header-btn" title={`Gestionar el equipo de ${currentOrg.name}`}
          onClick={() => setTeamModalOpen(true)}>
          <Icon name="users" size={14} /> Gestionar equipo
        </button>
      )}
      <div className="ed-menu ed-modal-head-account" ref={accountMenuRef}>
        <button className="ed-header-btn" onClick={() => setAccountMenuOpen((o) => !o)} title="Cuenta">
          <Icon name="cloud" size={14} /> {session.user.email}
        </button>
        {accountMenuOpen && (
          <div className="ed-menu-list" role="menu">
            <button role="menuitem" className="ed-menu-danger" disabled={busy} onClick={() => void onSignOut()}>
              <Icon name="circle-x" size={13} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  ) : undefined

  return (
    <>
      <SettingsWindow title={currentOrg ? `Nube de ${currentOrg.name}` : 'Nube'} onClose={onClose} busy={busy} headerExtra={headerExtra} wide>
        {checkingSession ? (
          <p className="ed-hint">Comprobando sesión…</p>
        ) : !session ? (
          <div className="ed-form ed-form-wide">
            <p className="ed-hint ed-hint-lead">Inicia sesión con tu correo para guardar y compartir proyectos en la nube.</p>
            {linkSent ? (
              <p className="ed-hint">
                Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo desde este mismo navegador para entrar.
              </p>
            ) : (
              <>
                <label className="ed-field">
                  <span>Correo</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@mecohisa.com"
                    onKeyDown={(e) => { if (e.key === 'Enter') void onSendLink() }} />
                </label>
                {authError && <p className="ed-hint-warn">{authError}</p>}
                <button className="ed-menu-primary" disabled={busy || !email.trim()} onClick={() => void onSendLink()}>
                  Enviar enlace de acceso
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="ed-form ed-form-wide">
            {orgs.length === 0 ? (
              <div className="ed-row">
                <label className="ed-field">
                  <span>Nombre de la organización</span>
                  <input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="Mecohisa" />
                </label>
                <button className="ed-menu-primary" disabled={busy || !newOrgName.trim()} onClick={() => void onCreateOrg()}>
                  Crear organización
                </button>
              </div>
            ) : (
              <>
                {/* Tarjeta aparte y con acento propio: esto es SIEMPRE sobre el
                    curso que tienes abierto ahora mismo en el editor (no
                    sobre el explorador de debajo, que es toda la organización). */}
                <div className="ed-cloud-current">
                  <p className="ed-cloud-current-eyebrow">Curso abierto ahora mismo</p>
                  {cloudDocumentId ? (
                    <div className="ed-cloud-session-row">
                      <div>
                        <strong>{course.course.title || 'Curso sin título'}</strong>
                        <p className="ed-hint">
                          {cloudStale
                            ? 'Alguien ha subido una versión más reciente — descárgala antes de seguir, o sube la tuya igualmente si sabes que debe ganar.'
                            : projectDirty ? 'Hay cambios sin subir a la nube.' : 'Sincronizado con la nube.'}
                        </p>
                        {cloudLockHolderEmail && (
                          <p className="ed-hint">{cloudLockHolderEmail} lo tiene abierto también ahora mismo.</p>
                        )}
                      </div>
                      <div className="ed-cloud-row-actions">
                        <button className="ed-btn-ghost" disabled={busy} onClick={() => void onLocateLinked()} title="Ir a la carpeta donde está guardado este proyecto">
                          <Icon name="folder" size={13} /> Ver ubicación
                        </button>
                        {cloudStale && (
                          <button className="ed-btn-ghost" disabled={busy} onClick={() => void onPullLatest()}
                            title="Bajar la última versión subida por cualquiera del equipo (sustituye el curso abierto)">
                            <Icon name="refresh" size={13} /> Descargar la última versión
                          </button>
                        )}
                        {canEditCurrent && projectDirty && (
                          <button className="ed-btn-solid ed-btn-cloud" disabled={busy} onClick={() => void onUpdateLinked()}>
                            <Icon name="cloud" size={14} /> Actualizar en la nube
                          </button>
                        )}
                      </div>
                    </div>
                  ) : isOwner || editableFolders.length > 0 ? (
                    <div className="ed-cloud-session-row">
                      <label className="ed-field">
                        <span>Título del proyecto nuevo</span>
                        <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
                      </label>
                      {(isOwner ? folders.length > 0 : editableFolders.length > 0) && (
                        <label className="ed-field ed-field-narrow">
                          <span>Carpeta</span>
                          <select value={uploadFolderId ?? ''} onChange={(e) => setUploadFolderId(e.target.value || null)}>
                            {isOwner && <option value="">— Sin carpeta —</option>}
                            {(isOwner ? folders : editableFolders).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                        </label>
                      )}
                      <button className="ed-btn-solid ed-btn-cloud" disabled={busy || !uploadTitle.trim() || (!isOwner && !uploadFolderId)} onClick={() => void onUploadNew()}>
                        <Icon name="cloud" size={14} /> Subir a la nube
                      </button>
                    </div>
                  ) : canEdit ? (
                    <p className="ed-hint">
                      Todavía no tienes ninguna carpeta con acceso de edición. Pide al propietario de la organización
                      que te conceda acceso a una (o crea tú una nueva, más abajo — quedará tuya automáticamente).
                    </p>
                  ) : (
                    <p className="ed-hint">Eres viewer en esta organización: puedes ver y abrir proyectos, pero no subir nuevos.</p>
                  )}
                </div>

                {error && <p className="ed-hint-warn">{error}</p>}

                {/* Explorador de carpetas: un solo nivel (sin subcarpetas). */}
                {currentFolderId ? (
                  <>
                    <div className="ed-cloud-breadcrumb">
                      <button onClick={() => setCurrentFolderId(null)} title="Volver a la raíz">
                        <Icon name="arrow-left" size={14} /> {currentOrg?.name ?? 'Proyectos'}
                      </button>
                      <Icon name="chevron-right" size={12} />
                      <strong>{folders.find((f) => f.id === currentFolderId)?.name}</strong>
                    </div>
                    <div className="ed-cloud-list ed-cloud-scroll">
                      {(docsByFolder.get(currentFolderId) ?? []).length === 0 && <p className="ed-hint">Esta carpeta está vacía.</p>}
                      {sortedDocs(docsByFolder.get(currentFolderId) ?? []).map(docRow)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ed-cloud-explorer-toolbar">
                      <input type="search" className="ed-cloud-search" placeholder="Buscar carpeta…"
                        value={folderSearch} onChange={(e) => setFolderSearch(e.target.value)} />
                      <label className="ed-cloud-sort">
                        <span>Ordenar por</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                          <option value="updated">Última modificación</option>
                          <option value="name">Nombre</option>
                        </select>
                      </label>
                      {canEdit && !creatingFolder && (
                        <button onClick={() => setCreatingFolder(true)}>
                          <Icon name="plus" size={13} /> Nueva carpeta
                        </button>
                      )}
                      {canEdit && (
                        <button className="ed-btn-ghost" onClick={() => setTrashModalOpen(true)} title="Ver proyectos eliminados">
                          <Icon name="trash" size={13} /> Papelera
                        </button>
                      )}
                    </div>

                    {creatingFolder && (
                      <div className="ed-row">
                        <label className="ed-field">
                          <span>Nombre de la carpeta (curso/proyecto)</span>
                          <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Prevención de Riesgos Laborales"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void onCreateFolder()
                              if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName('') }
                            }} />
                        </label>
                        <button disabled={busy || !newFolderName.trim()} onClick={() => void onCreateFolder()}>Crear</button>
                        <button onClick={() => { setCreatingFolder(false); setNewFolderName('') }}>Cancelar</button>
                      </div>
                    )}

                    <div className="ed-cloud-list ed-cloud-scroll">
                      {visibleFolders.map(folderTile)}
                      {folderSearch.trim() && visibleFolders.length === 0 && <p className="ed-hint">Ninguna carpeta coincide con «{folderSearch}».</p>}
                      {sortedDocs(docsByFolder.get(null) ?? []).map(docRow)}
                      {!folderSearch.trim() && folders.length === 0 && docs.length === 0 && <p className="ed-hint">Todavía no hay nada en esta organización.</p>}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </SettingsWindow>

      {teamModalOpen && currentOrg && (
        <CloudTeamModal orgId={currentOrg.id} orgName={currentOrg.name} isOwner={isOwner} onClose={() => setTeamModalOpen(false)} />
      )}

      {trashModalOpen && currentOrg && (
        <CloudTrashModal orgId={currentOrg.id} orgName={currentOrg.name} isOwner={isOwner}
          onClose={() => { setTrashModalOpen(false); if (orgId) void refreshDocs(orgId) }} />
      )}

      {folderAccessTarget && (
        <FolderAccessModal folderId={folderAccessTarget.id} folderName={folderAccessTarget.name}
          onClose={() => setFolderAccessTarget(null)} />
      )}
    </>
  )
}
