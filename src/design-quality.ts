const MAX_ISSUES = 20
const MAX_ISSUE_LENGTH = 200
const MAX_ASSERT_MESSAGE_LENGTH = 1_600
const MAX_VISITED_NODES = 10_000
const MAX_RULE_ISSUES = 4
const MAX_ANCESTOR_SCAN = 128
const MIN_TOUCH_TARGET = 44
const MOBILE_BOTTOM_SAFE_AREA = 34
const GEOMETRY_EPSILON = 0.5
const MAX_SEMANTIC_INPUT = 512

type JsonObject = Record<string, unknown>
type Axis = 'width' | 'height'

interface PendingNode {
  node: JsonObject
  path: string
  parent?: NodeRecord
  rootPath: string
  inCompactContext: boolean
  inFormContext: boolean
  inStatusBar: boolean
}

interface NodeRecord extends PendingNode {
  type: string
}

interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

type FillResult =
  | { kind: 'absent' }
  | { kind: 'uncertain' }
  | { kind: 'solid'; color: Rgba }

const FORM_SEMANTIC_RE = /(?:^|\s)(?:auth|authentication|form|login|log in|register|registration|sign in|signin|sign up|signup)(?:\s|$)|认证|註冊|注册|登錄|登录|表单|表單|身份验证/u
const COMPACT_CONTROL_RE = /(?:^|\s)(?:find|lookup|otp|one time code|passcode|pin|query|search|searchbox|security code|verification code)(?:\s|$)|一次性|动态码|動態碼|查找|检索|檢索|搜索|短信码|短信碼|验证码|驗證碼/u
const PASSWORD_RE = /(?:^|\s)(?:password|passphrase|current password|new password)(?:\s|$)|密码|密碼|パスワード|비밀번호|mot de passe|contraseña|senha|passwort|парол|kata sandi|รหัสผ่าน|mật khẩu|पासवर्ड/u
const ICON_SEMANTIC_RE = /(?:^|\s)(?:glyph|icon|pictogram|symbol)(?:\s|$)|图标|圖示|图示/u
const EMOJI_RE = /(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Regional_Indicator}|\uFE0F|\u20E3)/u
const KEYCAP_RE = /[#*0-9]\uFE0F?\u20E3/gu
const EMOJI_PART_RE = /(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Regional_Indicator}|\p{Emoji_Modifier}|\uFE0E|\uFE0F|\u200D)/gu
const CJK_RE = /(?:\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul})/u
const WECHAT_RE = /(?:^|\s)wechat(?:\s|$)|微信|微訊/u
const APPLE_RE = /(?:^|\s)apple(?:\s|$)|苹果登录|蘋果登錄/u
const HITBOX_ROLES = new Set(['button', 'icon button', 'nav link'])
const CHECKBOX_ROW_ROLES = new Set([
  'checkbox row',
  'control row',
  'interactive row',
  'menuitem',
  'option',
  'row',
  'switch',
])
const BOTTOM_SAFE_AREA_ROLES = new Set([
  'bottom nav',
  'bottom navigation',
  'navigation bar',
  'tab bar',
  'tablist',
])
const GENERIC_SANS_FAMILIES = new Set([
  '-apple-system',
  'blinkmacsystemfont',
  'sans-serif',
  'system-ui',
  'ui-sans-serif',
])
const GENERIC_SERIF_FAMILIES = new Set(['serif', 'ui-serif'])
const GENERIC_MONO_FAMILIES = new Set(['monospace', 'ui-monospace', 'sfmono-regular'])
const APPROVED_WECHAT_ICONS = new Set([
  'simple-icons:wechat',
])
const APPROVED_APPLE_ICONS = new Set([
  'simple-icons:apple',
])

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function normalizedSemanticPart(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.slice(0, MAX_SEMANTIC_INPUT)
    .normalize('NFKC')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLocaleLowerCase('en-US')
    .replace(/[_./:-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function nestedSemantics(node: JsonObject): JsonObject | undefined {
  return isObject(node.semantics) ? node.semantics : undefined
}

function semanticValues(node: JsonObject): unknown[] {
  const semantics = nestedSemantics(node)
  return [
    node.name,
    node.role,
    node.semanticRole,
    node.purpose,
    semantics?.role,
    semantics?.label,
    semantics?.hint,
  ]
}

function semanticText(node: JsonObject): string {
  return semanticValues(node)
    .map(normalizedSemanticPart)
    .filter(Boolean)
    .join(' ')
}

function compactControlText(node: JsonObject): string {
  return [
    ...semanticValues(node),
    node.label,
    node.placeholder,
    node.autocomplete,
    node.inputMode,
  ]
    .map(normalizedSemanticPart)
    .filter(Boolean)
    .join(' ')
}

function authoredRole(node: JsonObject): string {
  const semantics = nestedSemantics(node)
  return normalizedSemanticPart(node.role || node.semanticRole || semantics?.role)
}

function isFormSemantic(node: JsonObject): boolean {
  return FORM_SEMANTIC_RE.test(semanticText(node))
}

function isCompactControlSemantic(node: JsonObject): boolean {
  return COMPACT_CONTROL_RE.test(compactControlText(node))
}

function isPasswordSemantic(node: JsonObject): boolean {
  return PASSWORD_RE.test(compactControlText(node))
}

function isIconSemantic(node: JsonObject): boolean {
  return ICON_SEMANTIC_RE.test(semanticText(node))
}

function isIconField(key: string): boolean {
  const normalized = key.replace(/[^a-z]/gi, '').toLocaleLowerCase('en-US')
  return normalized === 'icon'
    || normalized.endsWith('icon')
    || /^(?:iconcontent|iconglyph|iconname|iconsource|icontext|iconvalue)$/.test(normalized)
}

function containsEmoji(value: unknown, depth = 0, seen = new Set<object>()): boolean {
  if (typeof value === 'string') return EMOJI_RE.test(value)
  if (depth >= 6 || (typeof value !== 'object' || value === null)) return false
  if (seen.has(value)) return false
  seen.add(value)
  if (Array.isArray(value)) return value.some(item => containsEmoji(item, depth + 1, seen))
  return Object.values(value).some(item => containsEmoji(item, depth + 1, seen))
}

function textContent(node: JsonObject): string | undefined {
  if (typeof node.content === 'string') return node.content
  if (!Array.isArray(node.content)) return undefined
  const parts: string[] = []
  for (const segment of node.content) {
    if (!isObject(segment) || typeof segment.text !== 'string') return undefined
    parts.push(segment.text)
  }
  return parts.join('')
}

function isEmojiOnly(value: unknown): boolean {
  if (typeof value !== 'string' || !EMOJI_RE.test(value)) return false
  return value
    .replace(KEYCAP_RE, '')
    .replace(EMOJI_PART_RE, '')
    .trim() === ''
}

function nodeType(node: JsonObject): string {
  if (typeof node.type !== 'string') return 'node'
  const normalized = node.type.toLocaleLowerCase('en-US')
  return /^[a-z0-9_-]{1,32}$/.test(normalized) ? normalized : 'node'
}

function boundedIssue(value: string): string {
  if (value.length <= MAX_ISSUE_LENGTH) return value
  return `${value.slice(0, MAX_ISSUE_LENGTH - 1)}…`
}

class IssueCollector {
  readonly issues: string[] = []
  readonly #ruleCounts = new Map<string, number>()

  add(rule: string, path: string, type: string, hint: string, ruleLimit = MAX_RULE_ISSUES): void {
    if (this.issues.length >= MAX_ISSUES) return
    const count = this.#ruleCounts.get(rule) ?? 0
    if (count >= ruleLimit) return
    this.#ruleCounts.set(rule, count + 1)
    this.issues.push(boundedIssue(`${path}: ${type} ${hint}`))
  }
}

function addChildRoots(roots: PendingNode[], children: unknown, pathPrefix: string): void {
  if (!Array.isArray(children)) return
  for (let index = children.length - 1; index >= 0; index -= 1) {
    const child = children[index]
    if (!isObject(child)) continue
    const path = pathPrefix ? `${pathPrefix}.${index}` : `${index}`
    roots.push({
      node: child,
      path,
      rootPath: path,
      inCompactContext: false,
      inFormContext: false,
      inStatusBar: false,
    })
  }
}

function documentRoots(value: JsonObject): PendingNode[] | undefined {
  if (typeof value.type === 'string') {
    return [{
      node: value,
      path: 'root',
      rootPath: 'root',
      inCompactContext: false,
      inFormContext: false,
      inStatusBar: false,
    }]
  }
  const roots: PendingNode[] = []
  addChildRoots(roots, value.children, '')
  if (Array.isArray(value.pages)) {
    for (let pageIndex = value.pages.length - 1; pageIndex >= 0; pageIndex -= 1) {
      const page = value.pages[pageIndex]
      if (isObject(page)) addChildRoots(roots, page.children, `pages.${pageIndex}`)
    }
  }
  if (!Array.isArray(value.children) && !Array.isArray(value.pages)) return undefined
  return roots
}

function paddingTuple(node: JsonObject): [number, number, number, number] | undefined {
  if (node.padding === undefined) return [0, 0, 0, 0]
  const one = finiteNumber(node.padding)
  if (one !== undefined) return one >= 0 ? [one, one, one, one] : undefined
  if (!Array.isArray(node.padding) || node.padding.length < 1 || node.padding.length > 4) return undefined
  const values = node.padding.map(finiteNumber)
  if (values.some(value => value === undefined || value < 0)) return undefined
  const safe = values as number[]
  if (safe.length === 1) return [safe[0], safe[0], safe[0], safe[0]]
  if (safe.length === 2) return [safe[0], safe[1], safe[0], safe[1]]
  if (safe.length === 3) return [safe[0], safe[1], safe[2], safe[1]]
  return [safe[0], safe[1], safe[2], safe[3]]
}

function textMetrics(node: JsonObject, availableWidth?: number): { width: number; height: number } {
  const fontSize = finiteNumber(node.fontSize) ?? 16
  const lineHeight = finiteNumber(node.lineHeight) ?? 1.2
  const content = textContent(node) ?? ''
  let emWidth = 0
  for (const character of content) {
    if (/\s/u.test(character)) emWidth += 0.33
    else if (CJK_RE.test(character) || EMOJI_RE.test(character)) emWidth += 1
    else if (/[A-Z]/u.test(character)) emWidth += 0.65
    else if (/[a-z0-9]/u.test(character)) emWidth += 0.56
    else emWidth += 0.45
  }
  const width = emWidth * fontSize
  const authoredWidth = finiteNumber(node.width)
  const wrappingWidth = authoredWidth ?? (node.width === 'fill_container' ? availableWidth : undefined)
  const lines = wrappingWidth !== undefined && wrappingWidth > 0
    ? Math.max(1, Math.ceil(width / wrappingWidth))
    : 1
  return { width, height: fontSize * lineHeight * lines }
}

function resolvedOuterWidth(node: JsonObject, availableWidth?: number): number | undefined {
  const width = finiteNumber(node.width)
  if (width !== undefined) return Math.max(0, width)
  if (node.width === 'fill_container') return availableWidth
  return undefined
}

function dimensionContribution(
  node: JsonObject,
  axis: Axis,
  availableWidth: number | undefined,
  depth: number,
): number | undefined {
  const authored = node[axis]
  const numeric = finiteNumber(authored)
  if (numeric !== undefined) return Math.max(0, numeric)
  if (authored === 'fill_container') return 0
  if (authored !== undefined && authored !== 'fit_content') return undefined
  return intrinsicDimension(node, axis, availableWidth, depth + 1)
}

function intrinsicDimension(
  node: JsonObject,
  axis: Axis,
  availableWidth: number | undefined,
  depth: number,
): number | undefined {
  if (depth > MAX_ANCESTOR_SCAN) return undefined
  if (nodeType(node) === 'text') return textMetrics(node, availableWidth)[axis]

  const children = Array.isArray(node.children) ? node.children.filter(isObject) : []
  if (children.length === 0) return 0
  const padding = paddingTuple(node)
  if (padding === undefined) return undefined
  const gap = node.gap === undefined ? 0 : finiteNumber(node.gap)
  if (gap === undefined || gap < 0) return undefined
  const [top, right, bottom, left] = padding
  const outerWidth = resolvedOuterWidth(node, availableWidth)
  const contentWidth = outerWidth === undefined ? undefined : Math.max(0, outerWidth - left - right)
  const layout = node.layout === 'vertical' || node.layout === 'horizontal' ? node.layout : 'none'

  if (layout === 'vertical') {
    if (axis === 'height') {
      let total = top + bottom + gap * Math.max(0, children.length - 1)
      for (const child of children) {
        const contribution = dimensionContribution(child, 'height', contentWidth, depth)
        if (contribution === undefined) return undefined
        total += contribution
      }
      return total
    }
    let maximum = 0
    for (const child of children) {
      const contribution = dimensionContribution(child, 'width', contentWidth, depth)
      if (contribution === undefined) return undefined
      maximum = Math.max(maximum, contribution)
    }
    return left + right + maximum
  }

  if (layout === 'horizontal') {
    if (axis === 'width') {
      let total = left + right + gap * Math.max(0, children.length - 1)
      for (const child of children) {
        const contribution = dimensionContribution(child, 'width', contentWidth, depth)
        if (contribution === undefined) return undefined
        total += contribution
      }
      return total
    }
    let maximum = 0
    for (const child of children) {
      const contribution = dimensionContribution(child, 'height', contentWidth, depth)
      if (contribution === undefined) return undefined
      maximum = Math.max(maximum, contribution)
    }
    return top + bottom + maximum
  }

  let maximum = 0
  for (const child of children) {
    const contribution = dimensionContribution(child, axis, contentWidth, depth)
    if (contribution === undefined) return undefined
    const offset = finiteNumber(child[axis === 'width' ? 'x' : 'y']) ?? 0
    maximum = Math.max(maximum, Math.max(0, offset) + contribution)
  }
  return (axis === 'width' ? left + right : top + bottom) + maximum
}

function rootFlowMinimum(node: JsonObject, axis: Axis): number | undefined {
  if ((axis === 'height' && node.layout !== 'vertical')
    || (axis === 'width' && node.layout !== 'horizontal')) return undefined
  return intrinsicDimension(node, axis, finiteNumber(node.width), 0)
}

function hasReservedMobileBottomSafeArea(node: JsonObject): boolean {
  const padding = paddingTuple(node)
  if (padding !== undefined && padding[2] >= MOBILE_BOTTOM_SAFE_AREA) return true

  const directChildren = Array.isArray(node.children) ? node.children.filter(isObject) : []
  const lastFlowChild = directChildren.at(-1)
  if (lastFlowChild !== undefined && BOTTOM_SAFE_AREA_ROLES.has(authoredRole(lastFlowChild))) {
    const childPadding = paddingTuple(lastFlowChild)
    if (childPadding !== undefined && childPadding[2] >= MOBILE_BOTTOM_SAFE_AREA) return true
  }

  if (node.layout !== 'vertical'
    || (node.justifyContent !== undefined && node.justifyContent !== 'start')
    || directChildren.some(child => child.height === 'fill_container')) return false
  const height = finiteNumber(node.height)
  const minimum = rootFlowMinimum(node, 'height')
  if (height === undefined || minimum === undefined) return false
  const authoredBottomPadding = padding?.[2] ?? 0
  return height - minimum + authoredBottomPadding >= MOBILE_BOTTOM_SAFE_AREA
}

function parseHexColor(value: unknown): Rgba | undefined {
  if (typeof value !== 'string') return undefined
  const hex = value.trim()
  let expanded: string
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    expanded = `${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}ff`
  } else if (/^#[0-9a-f]{6}$/i.test(hex)) {
    expanded = `${hex.slice(1)}ff`
  } else if (/^#[0-9a-f]{8}$/i.test(hex)) {
    expanded = hex.slice(1)
  } else return undefined
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16) / 255,
    g: Number.parseInt(expanded.slice(2, 4), 16) / 255,
    b: Number.parseInt(expanded.slice(4, 6), 16) / 255,
    a: Number.parseInt(expanded.slice(6, 8), 16) / 255,
  }
}

function nodeFill(node: JsonObject): FillResult {
  if (node.fill === undefined || (Array.isArray(node.fill) && node.fill.length === 0)) return { kind: 'absent' }
  const fills = Array.isArray(node.fill) ? node.fill : [node.fill]
  const visible = fills.filter(fill => !isObject(fill) || fill.visible !== false)
  if (visible.length !== 1 || !isObject(visible[0])) return { kind: 'uncertain' }
  const paint = visible[0]
  if (paint.type !== 'solid' || typeof paint.color !== 'string') return { kind: 'uncertain' }
  const color = parseHexColor(paint.color)
  if (color === undefined) return { kind: 'uncertain' }
  const paintOpacity = paint.opacity === undefined ? 1 : finiteNumber(paint.opacity)
  const nodeOpacity = node.opacity === undefined ? 1 : finiteNumber(node.opacity)
  if (paintOpacity === undefined
    || nodeOpacity === undefined
    || paintOpacity < 0
    || paintOpacity > 1
    || nodeOpacity < 0
    || nodeOpacity > 1) {
    return { kind: 'uncertain' }
  }
  return { kind: 'solid', color: { ...color, a: Math.min(1, color.a * paintOpacity * nodeOpacity) } }
}

function composite(foreground: Rgba, background: Rgba): Rgba {
  const alpha = foreground.a + background.a * (1 - foreground.a)
  if (alpha <= 0) return { r: 0, g: 0, b: 0, a: 0 }
  return {
    r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
    g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
    b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
    a: alpha,
  }
}

function ancestorBackground(record: NodeRecord): Rgba | undefined {
  const ancestors: NodeRecord[] = []
  let current = record.parent
  while (current !== undefined && ancestors.length < MAX_ANCESTOR_SCAN) {
    ancestors.push(current)
    current = current.parent
  }
  if (current !== undefined) return undefined
  let background: Rgba | undefined
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    const fill = nodeFill(ancestors[index].node)
    if (fill.kind === 'absent') continue
    if (fill.kind === 'uncertain') {
      background = undefined
      continue
    }
    if (fill.color.a >= 1 - Number.EPSILON) background = { ...fill.color, a: 1 }
    else if (background !== undefined) background = composite(fill.color, background)
    else background = undefined
  }
  return background?.a === 1 ? background : undefined
}

function linearChannel(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(color: Rgba): number {
  return 0.2126 * linearChannel(color.r)
    + 0.7152 * linearChannel(color.g)
    + 0.0722 * linearChannel(color.b)
}

function contrastRatio(first: Rgba, second: Rgba): number {
  const lighter = Math.max(luminance(first), luminance(second))
  const darker = Math.min(luminance(first), luminance(second))
  return (lighter + 0.05) / (darker + 0.05)
}

function numericFontWeight(value: unknown): number {
  const numeric = finiteNumber(value)
  if (numeric !== undefined) return numeric
  const normalized = normalizedSemanticPart(value)
  if (normalized === 'bold') return 700
  if (normalized === 'semibold' || normalized === 'semi bold') return 600
  return 400
}

function isLargeText(node: JsonObject): boolean {
  const size = finiteNumber(node.fontSize)
  return size !== undefined && (size >= 24 || (size >= 18.66 && numericFontWeight(node.fontWeight) >= 700))
}

function canonicalFontFamily(value: string): string | undefined {
  const tokens = value.split(',')
    .map(token => token.trim().replace(/^['"]|['"]$/g, '').toLocaleLowerCase('en-US'))
    .filter(Boolean)
  if (tokens.length === 0) return undefined
  const primary = tokens[0]
  if (GENERIC_MONO_FAMILIES.has(primary)) return 'generic-monospace'
  if (GENERIC_SERIF_FAMILIES.has(primary)) return 'generic-serif'
  if (GENERIC_SANS_FAMILIES.has(primary)) return 'generic-sans'
  return primary
}

function dimensionHasMinimum(node: JsonObject, axis: Axis): boolean {
  const value = finiteNumber(node[axis])
  if (value !== undefined) return value >= MIN_TOUCH_TARGET
  if (node[axis] === 'fill_container') return true
  const minimum = finiteNumber(node[axis === 'width' ? 'minWidth' : 'minHeight'])
  return minimum !== undefined && minimum >= MIN_TOUCH_TARGET
}

function containsNodeType(node: JsonObject, wanted: string, visited = 0): boolean {
  if (visited > 100) return false
  if (nodeType(node) === wanted) return true
  if (!Array.isArray(node.children)) return false
  return node.children.some(child => isObject(child) && containsNodeType(child, wanted, visited + 1))
}

function providerText(node: JsonObject, depth = 0): string {
  if (depth > 8) return ''
  const parts = [...semanticValues(node)]
  const content = textContent(node)
  if (content !== undefined) parts.push(content)
  if (Array.isArray(node.children)) {
    for (const child of node.children) if (isObject(child)) parts.push(providerText(child, depth + 1))
  }
  return parts.map(normalizedSemanticPart).filter(Boolean).join(' ')
}

function providerIcons(node: JsonObject, depth = 0): string[] {
  if (depth > 8) return []
  const icons: string[] = []
  if (nodeType(node) === 'icon_font' && typeof node.iconFontName === 'string') {
    const family = typeof node.iconFontFamily === 'string' && node.iconFontFamily.trim().length > 0
      ? node.iconFontFamily.toLocaleLowerCase('en-US').trim()
      : 'lucide'
    icons.push(`${family}:${node.iconFontName.toLocaleLowerCase('en-US').trim()}`)
  }
  if (nodeType(node) === 'path' && typeof node.iconId === 'string' && node.iconId.trim().length > 0) {
    icons.push(node.iconId.toLocaleLowerCase('en-US').trim())
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) if (isObject(child)) icons.push(...providerIcons(child, depth + 1))
  }
  return icons
}

function buildRecords(
  roots: PendingNode[],
  collector: IssueCollector,
): { records: NodeRecord[]; roots: NodeRecord[] } {
  const pending = [...roots]
  const records: NodeRecord[] = []
  const rootRecords: NodeRecord[] = []
  let visited = 0
  while (pending.length > 0) {
    const current = pending.pop()
    if (current === undefined) break
    visited += 1
    if (visited > MAX_VISITED_NODES) {
      collector.add('node-limit', current.path, 'node', 'exceeds the quality inspection node limit.', 1)
      break
    }
    const type = nodeType(current.node)
    const compact = current.inCompactContext || isCompactControlSemantic(current.node)
    const inFormContext = current.inFormContext || isFormSemantic(current.node)
    const inStatusBar = current.inStatusBar || authoredRole(current.node) === 'status bar'
    const record: NodeRecord = {
      ...current,
      type,
      inCompactContext: compact,
      inFormContext,
      inStatusBar,
    }
    records.push(record)
    if (record.parent === undefined) rootRecords.push(record)

    const children = current.node.children
    if (!Array.isArray(children)) continue
    for (let index = children.length - 1; index >= 0; index -= 1) {
      const child = children[index]
      if (!isObject(child)) continue
      pending.push({
        node: child,
        path: `${current.path}.${index}`,
        parent: record,
        rootPath: current.rootPath,
        inCompactContext: compact,
        inFormContext,
        inStatusBar,
      })
    }
  }
  return { records, roots: rootRecords }
}

function inspectRootGeometry(
  roots: NodeRecord[],
  records: NodeRecord[],
  collector: IssueCollector,
): void {
  const recordsByRoot = new Map<string, NodeRecord[]>()
  for (const record of records) {
    const siblings = recordsByRoot.get(record.rootPath) ?? []
    siblings.push(record)
    recordsByRoot.set(record.rootPath, siblings)
  }
  for (const root of roots) {
    const { node, path, type } = root
    if (node.clipContent === true) {
      const axis: Axis | undefined = node.layout === 'vertical'
        ? 'height'
        : node.layout === 'horizontal' ? 'width' : undefined
      if (axis !== undefined) {
        const authored = finiteNumber(node[axis])
        const minimum = rootFlowMinimum(node, axis)
        if (authored !== undefined && minimum !== undefined && minimum > authored + GEOMETRY_EPSILON) {
          collector.add(
            `root-flow-${axis}`,
            path,
            type,
            `fixed clipped ${node.layout} root cannot contain its minimum flow size.`,
            2,
          )
        }
      }
    }

    const hasStatusBar = (recordsByRoot.get(root.rootPath) ?? []).some(record => record.inStatusBar)
    const width = finiteNumber(node.width)
    const height = finiteNumber(node.height)
    if (hasStatusBar && width !== undefined && width <= 600 && height !== undefined && height >= 480) {
      if (!hasReservedMobileBottomSafeArea(node)) {
        collector.add(
          'mobile-safe-area',
          path,
          type,
          'mobile root with a status bar must reserve at least 34px of bottom safe-area padding.',
          2,
        )
      }
    }
  }
}

function inspectSemantics(records: NodeRecord[], collector: IssueCollector): void {
  for (const record of records) {
    const { node, path, type } = record
    if (type === 'text_input' && isPasswordSemantic(node) && node.secure !== true) {
      collector.add(
        'password-secure',
        path,
        type,
        'password text input must explicitly set secure to true.',
      )
    }

    const role = authoredRole(node)
    if (HITBOX_ROLES.has(role)
      && (!dimensionHasMinimum(node, 'width') || !dimensionHasMinimum(node, 'height'))) {
      collector.add(
        'touch-target',
        path,
        type,
        'authored interactive role must provide a 44px minimum hit box.',
      )
    }

    if (node.layout === 'horizontal'
      && CHECKBOX_ROW_ROLES.has(role)
      && containsNodeType(node, 'checkbox')
      && (!dimensionHasMinimum(node, 'width') || !dimensionHasMinimum(node, 'height'))) {
      collector.add(
        'checkbox-wrapper',
        path,
        type,
        'checkbox interaction row must provide a 44px wrapper hit box.',
      )
    }

    if (!HITBOX_ROLES.has(role)) continue
    const semantic = providerText(node)
    const icons = providerIcons(node)
    if (WECHAT_RE.test(semantic) && !icons.some(icon => APPROVED_WECHAT_ICONS.has(icon))) {
      collector.add(
        'wechat-icon',
        path,
        type,
        'provider control must use the approved WeChat brand icon mapping.',
      )
    }
    if (APPLE_RE.test(semantic) && !icons.some(icon => APPROVED_APPLE_ICONS.has(icon))) {
      collector.add(
        'apple-icon',
        path,
        type,
        'provider control must use the approved Apple brand icon mapping.',
      )
    }
  }
}

function inspectNativeControls(records: NodeRecord[], collector: IssueCollector): void {
  for (const record of records) {
    const { node, path, type } = record
    const isFormControl = type === 'text_input' || type === 'text_area' || type === 'select'
    if (record.inFormContext && isFormControl && !record.inCompactContext) {
      if (node.width !== 'fill_container') {
        collector.add(
          'form-control-width',
          path,
          type,
          'in a form must set width to "fill_container".',
        )
      }
      if (type === 'text_area') {
        const height = finiteNumber(node.height)
        if (height === undefined || height < 88 || height > 240) {
          collector.add(
            'form-text-area-height',
            path,
            type,
            'in a form must set an explicit multiline height from 88px through 240px.',
          )
        }
      } else {
        const height = finiteNumber(node.height)
        if (height === undefined || height < 44 || height > 56) {
          collector.add(
            'form-control-height',
            path,
            type,
            'in a form must set an explicit height from 44px through 56px.',
          )
        }
      }
    }

    const hasEmojiIconField = Object.entries(node).some(([key, value]) => (
      key !== 'children' && isIconField(key) && containsEmoji(value)
    ))
    if (hasEmojiIconField) {
      collector.add(
        'emoji-icon-field',
        path,
        type,
        'icon interface field uses emoji; use icon_font or a component icon.',
      )
    }
    const content = textContent(node)
    if (type === 'text' && isIconSemantic(node) && isEmojiOnly(content)) {
      collector.add(
        'emoji-text-icon',
        path,
        type,
        'text node used as an icon contains only emoji; use icon_font or a component icon.',
      )
    }
  }
}

function inspectTypography(
  roots: NodeRecord[],
  records: NodeRecord[],
  collector: IssueCollector,
): void {
  const rootFamilies = new Map<string, Set<string>>()
  for (const record of records) {
    if (record.type !== 'text' || record.inStatusBar) continue
    const { node, path, type } = record
    const family = typeof node.fontFamily === 'string' && node.fontFamily.trim()
      ? canonicalFontFamily(node.fontFamily)
      : undefined
    const fontSize = finiteNumber(node.fontSize)
    const lineHeight = finiteNumber(node.lineHeight)
    const hasFontSize = fontSize !== undefined && fontSize > 0
    const hasLineHeight = lineHeight !== undefined && lineHeight > 0
    if (family === undefined || !hasFontSize || !hasLineHeight) {
      collector.add(
        'explicit-typography',
        path,
        type,
        'authored text must explicitly set fontFamily, fontSize, and lineHeight.',
        4,
      )
    }
    if (family !== undefined) {
      const families = rootFamilies.get(record.rootPath) ?? new Set<string>()
      families.add(family)
      rootFamilies.set(record.rootPath, families)
    }
    const content = textContent(node)
    if (content !== undefined && CJK_RE.test(content) && lineHeight !== undefined && lineHeight < 1.3) {
      collector.add(
        'cjk-line-height',
        path,
        type,
        'CJK text must use a lineHeight of at least 1.3.',
        3,
      )
    }
  }

  for (const root of roots) {
    if ((rootFamilies.get(root.rootPath)?.size ?? 0) > 2) {
      collector.add(
        'root-font-families',
        root.path,
        root.type,
        'root must use no more than two normalized font families.',
        2,
      )
    }
  }
}

function inspectContrast(records: NodeRecord[], collector: IssueCollector): void {
  for (const record of records) {
    if (record.type !== 'text') continue
    if (Array.isArray(record.node.content)) continue
    const background = ancestorBackground(record)
    if (background === undefined) continue
    const foregroundFill = nodeFill(record.node)
    if (foregroundFill.kind !== 'solid') continue
    const foreground = foregroundFill.color.a >= 1 - Number.EPSILON
      ? { ...foregroundFill.color, a: 1 }
      : composite(foregroundFill.color, background)
    const required = isLargeText(record.node) ? 3 : 4.5
    if (contrastRatio(foreground, background) + Number.EPSILON < required) {
      collector.add(
        'text-contrast',
        record.path,
        record.type,
        'text does not meet WCAG AA contrast for its authored size and weight.',
        4,
      )
    }
  }
}

/**
 * Inspect a generated OpenPencil document for high-confidence release-blocking
 * quality regressions. Diagnostics contain structural paths, sanitized node
 * types, and fixed guidance only; authored names, copy, values, and colors are
 * never reflected.
 */
export function inspectGeneratedDesignQuality(documentJson: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(documentJson) as unknown
  } catch {
    return ['OpenPencil generated document is not valid JSON.']
  }

  if (!isObject(parsed)) return ['OpenPencil generated document must be a JSON object.']
  const pending = documentRoots(parsed)
  if (pending === undefined) return ['OpenPencil generated document has no valid node tree.']

  const collector = new IssueCollector()
  const tree = buildRecords(pending, collector)
  inspectRootGeometry(tree.roots, tree.records, collector)
  inspectSemantics(tree.records, collector)
  inspectNativeControls(tree.records, collector)
  inspectTypography(tree.roots, tree.records, collector)
  inspectContrast(tree.records, collector)
  return collector.issues
}

/** Reject a generated document without reflecting any document content. */
export function assertGeneratedDesignQuality(documentJson: string): void {
  const issues = inspectGeneratedDesignQuality(documentJson)
  if (issues.length === 0) return
  const prefix = `OpenPencil generated design failed quality checks (${issues.length} issue${issues.length === 1 ? '' : 's'}): `
  const detailBudget = Math.max(0, MAX_ASSERT_MESSAGE_LENGTH - prefix.length)
  const details = issues.join(' ').slice(0, detailBudget)
  throw new Error(`${prefix}${details}`)
}
