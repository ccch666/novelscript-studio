import type { ScreenplayDocument } from '../../utils/screenplay'
import { IconUsers } from '../icons'

const ROLE_LABEL: Record<string, string> = {
  protagonist: '主角',
  supporting: '配角',
  antagonist: '反派',
  unknown: '其他',
}

const ROLE_TONE: Record<string, 'emerald' | 'indigo' | 'rose' | 'amber'> = {
  protagonist: 'emerald',
  supporting: 'indigo',
  antagonist: 'rose',
  unknown: 'amber',
}

function roleLabel(role: string | undefined): string {
  if (!role) {
    return ROLE_LABEL.unknown
  }
  return ROLE_LABEL[role] ?? role
}

function roleTone(role: string | undefined): 'emerald' | 'indigo' | 'rose' | 'amber' {
  if (!role) {
    return 'amber'
  }
  return ROLE_TONE[role] ?? 'amber'
}

function initialsOf(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) {
    return '?'
  }
  // 优先取前两个中文字符；否则取首字母
  const chinese = trimmed.match(/[一-鿿]/g)
  if (chinese && chinese.length >= 2) {
    return (chinese[0] + chinese[1]).toString()
  }
  if (chinese && chinese.length === 1) {
    return chinese[0]
  }
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

type CharacterGridProps = {
  characters: ScreenplayDocument['characters']
}

/**
 * 角色卡列表：彩色头像 + 名称 + 角色标签 + 描述。
 * 2 列栅格，提升密度。
 */
export function CharacterGrid({ characters }: CharacterGridProps) {
  if (!characters || characters.length === 0) {
    return null
  }

  return (
    <div className="character-grid">
      {characters.map((character) => {
        const tone = roleTone(character.role)
        return (
          <article className={`character-card character-card--${tone}`} key={character.id}>
            <span className="character-card__avatar" aria-hidden="true">
              {initialsOf(character.name)}
            </span>
            <div className="character-card__body">
              <div className="character-card__head">
                <strong>{character.name}</strong>
                <span className={`character-card__role character-card__role--${tone}`}>
                  {roleLabel(character.role)}
                </span>
              </div>
              {character.description && <p>{character.description}</p>}
            </div>
            <span className="character-card__id">
              <IconUsers size={10} />
              {character.id}
            </span>
          </article>
        )
      })}
    </div>
  )
}
