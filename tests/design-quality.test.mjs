import assert from 'node:assert/strict'
import { test } from 'node:test'

const {
  assertGeneratedDesignQuality,
  inspectGeneratedDesignQuality,
} = await import('../lib/design-quality.js')

const readableText = {
  fontFamily: 'system-ui',
  fontSize: 16,
  lineHeight: 1.5,
}

function solid(color) {
  return [{ type: 'solid', color }]
}

function documentWith(children) {
  return JSON.stringify({ version: '1.0.0', children })
}

test('accepts an empty unpublished starter draft', () => {
  const starter = documentWith([])
  assert.deepEqual(inspectGeneratedDesignQuality(starter), [])
  assert.doesNotThrow(() => assertGeneratedDesignQuality(starter))
})

test('flags undersized and non-filling native controls in a login.op-style form', () => {
  const documentJson = documentWith([{
    type: 'frame',
    name: 'Login',
    children: [{
      type: 'frame',
      name: 'Form card',
      children: [
        { type: 'text_input', name: 'Email', width: 116, height: 36 },
        { type: 'text_input', name: 'Password', secure: true, width: 'fill_container', height: 'fit_content' },
        { type: 'select', name: 'Account type', width: 'fit_content', height: 72 },
        { type: 'text_area', name: 'Private biography', width: 'fill_container', height: 48 },
      ],
    }],
  }])

  const issues = inspectGeneratedDesignQuality(documentJson)
  assert.equal(issues.length, 6)
  assert.equal(issues.filter(issue => /width/.test(issue)).length, 2)
  assert.equal(issues.filter(issue => /height/.test(issue)).length, 4)
  assert.ok(issues.every(issue => !issue.includes('Email') && !issue.includes('Password')))
  assert.throws(
    () => assertGeneratedDesignQuality(documentJson),
    error => error instanceof Error
      && /failed quality checks \(6 issues\)/.test(error.message)
      && /width to "fill_container"/.test(error.message)
      && /44px through 56px/.test(error.message)
      && /multiline height from 88px through 240px/.test(error.message)
      && !error.message.includes('Account type')
      && !error.message.includes('Private biography'),
  )
})

test('accepts healthy native controls in auth and sign-up forms', () => {
  const documentJson = documentWith([{
    type: 'frame',
    role: 'auth-form',
    children: [
      { type: 'text_input', width: 'fill_container', height: 44 },
      { type: 'text_area', width: 'fill_container', height: 112 },
      { type: 'select', width: 'fill_container', height: 48 },
    ],
  }, {
    type: 'frame',
    name: 'Sign-up',
    children: [{ type: 'text_input', width: 'fill_container', height: 52 }],
  }])

  assert.deepEqual(inspectGeneratedDesignQuality(documentJson), [])
  assert.doesNotThrow(() => assertGeneratedDesignQuality(documentJson))
})

test('does not apply form sizing rules outside forms or to compact search and OTP controls', () => {
  const documentJson = documentWith([{
    type: 'frame',
    name: 'Dashboard',
    children: [{ type: 'text_input', name: 'Loose filter', width: 160, height: 32 }],
  }, {
    type: 'frame',
    name: 'Login form',
    children: [
      { type: 'text_input', role: 'searchbox', width: 180, height: 32 },
      { type: 'frame', name: 'OTP verification code', children: [
        { type: 'text_input', width: 40, height: 40 },
      ] },
    ],
  }])

  assert.deepEqual(inspectGeneratedDesignQuality(documentJson), [])
})

test('flags emoji in icon fields and emoji-only text icon nodes', () => {
  const documentJson = documentWith([{
    type: 'frame',
    leadingIcon: '🔍',
    children: [
      { type: 'text_input', trailingIcon: { glyph: '👁️' } },
      { type: 'text', role: 'icon', content: '🔒', ...readableText },
      { type: 'text', name: 'Search icon', content: '🔎  🔍', ...readableText },
      { type: 'text', role: 'icon', content: 'Secure 🔒', ...readableText },
      { type: 'icon_font', icon: 'search' },
    ],
  }])

  const issues = inspectGeneratedDesignQuality(documentJson)
  assert.equal(issues.length, 4)
  assert.equal(issues.filter(issue => /icon interface field/.test(issue)).length, 2)
  assert.equal(issues.filter(issue => /text node used as an icon/.test(issue)).length, 2)
  assert.throws(
    () => assertGeneratedDesignQuality(documentJson),
    error => error instanceof Error
      && /use icon_font or a component icon/.test(error.message)
      && !error.message.includes('🔒')
      && !error.message.includes('🔍'),
  )
})

test('fails closed on parse errors and bounds diagnostics without reflecting document text', () => {
  assert.deepEqual(
    inspectGeneratedDesignQuality('{ definitely not JSON'),
    ['OpenPencil generated document is not valid JSON.'],
  )
  assert.throws(
    () => assertGeneratedDesignQuality('{ secret-invalid-document'),
    error => error instanceof Error && !error.message.includes('secret-invalid-document'),
  )

  const children = Array.from({ length: 80 }, (_, index) => ({
    type: 'text',
    role: 'icon',
    name: `private-${index}-${'x'.repeat(500)}`,
    content: '🚫',
    ...readableText,
  }))
  const issues = inspectGeneratedDesignQuality(documentWith(children))
  assert.equal(issues.length, 4)
  assert.ok(issues.every(issue => issue.length <= 200))
  assert.ok(issues.every(issue => !issue.includes('private-')))
  assert.throws(
    () => assertGeneratedDesignQuality(documentWith(children)),
    error => error instanceof Error
      && error.message.length <= 1_600
      && !error.message.includes('private-')
      && !error.message.includes('🚫'),
  )
})

test('rejects the realistic v2 audit shape across every hard release gate', () => {
  const v2AuditDocument = documentWith([{
    type: 'frame',
    name: 'private-root-name',
    width: 390,
    height: 480,
    layout: 'vertical',
    gap: 16,
    padding: [20, 20, 28, 20],
    clipContent: true,
    fill: solid('#14201B'),
    children: [
      {
        type: 'frame',
        role: 'status-bar',
        width: 'fill_container',
        height: 62,
        children: [{ type: 'text', content: '9:41', fill: solid('#FFF') }],
      },
      {
        type: 'frame',
        role: 'icon-button',
        width: 36,
        height: 36,
        children: [{ type: 'icon_font', iconFontName: 'arrow-left', width: 18, height: 18 }],
      },
      { type: 'text', content: 'private missing typography', fill: solid('#FFF') },
      {
        type: 'text',
        content: '欢迎回来',
        fontFamily: 'Inter',
        fontSize: 16,
        lineHeight: 1.2,
        fill: solid('#FFF'),
      },
      {
        type: 'frame',
        role: 'form-group',
        width: 'fill_container',
        height: 'fit_content',
        children: [{
          type: 'text_input',
          name: 'private password',
          width: 'fill_container',
          height: 48,
        }],
      },
      {
        type: 'frame',
        role: 'checkbox-row',
        layout: 'horizontal',
        width: 'fill_container',
        height: 24,
        children: [{ type: 'checkbox', width: 18, height: 18 }],
      },
      {
        type: 'frame',
        role: 'button',
        width: 'fill_container',
        height: 48,
        children: [
          { type: 'icon_font', iconFontName: 'message-circle', width: 18, height: 18 },
          { type: 'text', content: '微信登录', ...readableText, fill: solid('#FFF') },
        ],
      },
      {
        type: 'frame',
        role: 'button',
        width: 'fill_container',
        height: 48,
        children: [
          { type: 'icon_font', iconFontName: 'apple', width: 18, height: 18 },
          {
            type: 'text',
            content: 'Apple sign in',
            fontFamily: 'Private Serif Brand',
            fontSize: 16,
            lineHeight: 1.5,
            fill: solid('#FFF'),
          },
        ],
      },
      {
        type: 'frame',
        width: 'fill_container',
        height: 'fit_content',
        fill: solid('#FFF'),
        children: [{
          type: 'text',
          content: 'private low contrast copy',
          fontFamily: 'Private Mono Brand',
          fontSize: 16,
          lineHeight: 1.5,
          fill: solid('#777'),
        }],
      },
      { type: 'frame', width: 'fill_container', height: 100, children: [] },
      { type: 'frame', width: 'fill_container', height: 'fill_container', children: [] },
    ],
  }])

  const issues = inspectGeneratedDesignQuality(v2AuditDocument)
  const diagnostic = issues.join('\n')
  assert.match(diagnostic, /fixed clipped vertical root/)
  assert.match(diagnostic, /34px of bottom safe-area/)
  assert.match(diagnostic, /44px minimum hit box/)
  assert.match(diagnostic, /password text input must explicitly set secure/)
  assert.match(diagnostic, /checkbox interaction row must provide a 44px wrapper/)
  assert.match(diagnostic, /approved WeChat brand icon mapping/)
  assert.match(diagnostic, /explicitly set fontFamily, fontSize, and lineHeight/)
  assert.match(diagnostic, /CJK text must use a lineHeight of at least 1.3/)
  assert.match(diagnostic, /no more than two normalized font families/)
  assert.match(diagnostic, /WCAG AA contrast/)
  assert.match(diagnostic, /approved Apple brand icon mapping/)
  assert.ok(!diagnostic.includes('private'))
  assert.throws(() => assertGeneratedDesignQuality(v2AuditDocument))
})

test('accepts a healthy mobile fixture with brand mappings, safe geometry, and normalized fonts', () => {
  const documentJson = documentWith([{
    type: 'frame',
    width: 390,
    height: 844,
    layout: 'vertical',
    gap: 12,
    padding: [20, 20, 34, 20],
    clipContent: true,
    fill: solid('#FFF'),
    children: [
      {
        type: 'frame',
        role: 'status-bar',
        width: 'fill_container',
        height: 44,
        children: [{ type: 'text', content: '9:41', fill: solid('#111') }],
      },
      {
        type: 'frame',
        role: 'icon-button',
        width: 44,
        height: 44,
        children: [{ type: 'icon_font', iconFontName: 'arrow-left', width: 18, height: 18 }],
      },
      {
        type: 'text',
        content: 'Welcome',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 28,
        lineHeight: 1.3,
        fill: solid('#111'),
      },
      {
        type: 'frame',
        role: 'auth-form',
        width: 'fill_container',
        height: 'fit_content',
        layout: 'vertical',
        gap: 12,
        children: [{
          type: 'text_input',
          semantics: { label: 'Password' },
          secure: true,
          width: 'fill_container',
          height: 48,
        }, {
          type: 'frame',
          role: 'checkbox-row',
          width: 'fill_container',
          height: 44,
          layout: 'horizontal',
          children: [{ type: 'checkbox', width: 18, height: 18 }],
        }],
      },
      {
        type: 'frame',
        role: 'button',
        width: 'fill_container',
        height: 44,
        children: [
          { type: 'path', iconId: 'simple-icons:wechat', d: 'M1 1h22v22H1z', width: 18, height: 18 },
          { type: 'text', content: '微信登录', ...readableText, fill: solid('#111') },
        ],
      },
      {
        type: 'frame',
        role: 'button',
        width: 'fill_container',
        height: 44,
        children: [
          { type: 'icon_font', iconFontFamily: 'simple-icons', iconFontName: 'apple', width: 18, height: 18 },
          {
            type: 'text',
            content: 'Apple sign in',
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            lineHeight: 1.5,
            fill: solid('#111'),
          },
        ],
      },
      { type: 'checkbox', width: 18, height: 18 },
      { type: 'frame', width: 'fill_container', height: 'fill_container', children: [] },
    ],
  }])

  assert.deepEqual(inspectGeneratedDesignQuality(documentJson), [])
  assert.doesNotThrow(() => assertGeneratedDesignQuality(documentJson))
})

test('accepts explicit bottom-nav padding or provable trailing flow space but not clip-only claims', () => {
  const withBottomNav = documentWith([{
    type: 'frame',
    width: 390,
    height: 600,
    layout: 'vertical',
    children: [
      { type: 'frame', role: 'status-bar', width: 'fill_container', height: 44, children: [] },
      { type: 'frame', width: 'fill_container', height: 'fill_container', children: [] },
      {
        type: 'frame',
        role: 'tab-bar',
        width: 'fill_container',
        height: 80,
        padding: [8, 8, 34, 8],
        children: [],
      },
    ],
  }])
  const withTrailingSpace = documentWith([{
    type: 'frame',
    width: 390,
    height: 600,
    layout: 'vertical',
    children: [
      { type: 'frame', role: 'status-bar', width: 'fill_container', height: 44, children: [] },
      { type: 'frame', width: 'fill_container', height: 100, children: [] },
    ],
  }])
  const clipOnly = documentWith([{
    type: 'frame',
    width: 390,
    height: 600,
    layout: 'vertical',
    clipContent: false,
    children: [
      { type: 'frame', role: 'status-bar', width: 'fill_container', height: 44, children: [] },
      { type: 'frame', width: 'fill_container', height: 'fill_container', children: [] },
      { type: 'frame', width: 'fill_container', height: 30, children: [] },
    ],
  }])

  assert.deepEqual(inspectGeneratedDesignQuality(withBottomNav), [])
  assert.deepEqual(inspectGeneratedDesignQuality(withTrailingSpace), [])
  assert.match(inspectGeneratedDesignQuality(clipOnly).join('\n'), /34px of bottom safe-area/)
})

test('requires 44px authored hit boxes for button, icon-button, and nav-link roles', () => {
  const documentJson = documentWith([{
    type: 'frame',
    children: [
      { type: 'frame', role: 'button', width: 43, height: 44, children: [] },
      { type: 'frame', semantics: { role: 'icon-button' }, width: 44, height: 43, children: [] },
      { type: 'frame', role: 'nav-link', width: 'fit_content', height: 44, children: [] },
    ],
  }])

  const issues = inspectGeneratedDesignQuality(documentJson)
    .filter(issue => /44px minimum hit box/.test(issue))
  assert.equal(issues.length, 3)
  assert.ok(issues.some(issue => issue.startsWith('0.0: frame')))
  assert.ok(issues.some(issue => issue.startsWith('0.1: frame')))
  assert.ok(issues.some(issue => issue.startsWith('0.2: frame')))
})

test('computes fixed vertical and horizontal flow minima recursively while fill spacers cost zero', () => {
  const vertical = documentWith([{
    type: 'frame',
    width: 200,
    height: 90,
    layout: 'vertical',
    gap: 5,
    padding: 10,
    clipContent: true,
    children: [
      { type: 'frame', width: 'fill_container', height: 40, children: [] },
      {
        type: 'frame',
        width: 'fill_container',
        height: 'fit_content',
        layout: 'vertical',
        children: [{ type: 'text', content: 'two lines are conservatively measured', width: 80, ...readableText }],
      },
      { type: 'frame', width: 'fill_container', height: 'fill_container', children: [] },
    ],
  }])
  const horizontal = documentWith([{
    type: 'frame',
    width: 80,
    height: 100,
    layout: 'horizontal',
    gap: 5,
    padding: 10,
    clipContent: true,
    children: [
      { type: 'frame', width: 40, height: 'fill_container', children: [] },
      { type: 'text', content: 'Wide', width: 'fit_content', ...readableText },
      { type: 'frame', width: 'fill_container', height: 'fill_container', children: [] },
    ],
  }])

  assert.match(inspectGeneratedDesignQuality(vertical).join('\n'), /fixed clipped vertical root/)
  assert.match(inspectGeneratedDesignQuality(horizontal).join('\n'), /fixed clipped horizontal root/)
})

test('enforces normal and large-text WCAG thresholds and composites alpha solids', () => {
  const documentJson = documentWith([{
    type: 'frame',
    fill: solid('#FFF'),
    children: [
      { type: 'text', content: 'normal', ...readableText, fill: solid('#777') },
      { type: 'text', content: 'large', fontFamily: 'system-ui', fontSize: 24, lineHeight: 1.3, fill: solid('#777') },
      {
        type: 'frame',
        fill: solid('#00000080'),
        children: [{ type: 'text', content: 'alpha', ...readableText, fill: solid('#777') }],
      },
    ],
  }])

  const contrastIssues = inspectGeneratedDesignQuality(documentJson)
    .filter(issue => /WCAG AA contrast/.test(issue))
  assert.equal(contrastIssues.length, 2)
  assert.ok(contrastIssues.some(issue => issue.startsWith('0.0: text')))
  assert.ok(contrastIssues.some(issue => issue.startsWith('0.2.0: text')))
  assert.ok(!contrastIssues.some(issue => issue.startsWith('0.1: text')))
})

test('skips uncertain variable and gradient colors and exempts status text and visual checkboxes', () => {
  const documentJson = documentWith([{
    type: 'frame',
    width: 100,
    height: 100,
    fill: [{ type: 'linear_gradient', stops: [] }],
    children: [
      { type: 'text', content: 'uncertain contrast', ...readableText, fill: solid('#777') },
      {
        type: 'frame',
        fill: [{ type: 'solid', color: '$surface' }],
        children: [{ type: 'text', content: 'variable', ...readableText, fill: solid('#777') }],
      },
      {
        type: 'frame',
        role: 'status-bar',
        children: [{ type: 'text', content: 'status without authored typography' }],
      },
      { type: 'checkbox', width: 18, height: 18 },
      { type: 'frame', width: 'calc(100% - 8px)', height: 'fit_content', children: [] },
    ],
  }])

  assert.deepEqual(inspectGeneratedDesignQuality(documentJson), [])
})

test('checks pages trees, nested semantics, and styled text without reflecting authored data', () => {
  const documentJson = JSON.stringify({
    version: '1.0.0',
    pages: [{
      name: 'private-page',
      children: [{
        type: 'frame',
        children: [{
          type: 'text_input',
          semantics: { label: 'Password private-secret' },
          width: 'fill_container',
          height: 48,
        }, {
          type: 'text',
          role: 'icon',
          content: [{ text: '🚫' }],
          ...readableText,
        }],
      }],
    }],
  })

  const diagnostic = inspectGeneratedDesignQuality(documentJson).join('\n')
  assert.match(diagnostic, /^pages\.0\.0\.0: text_input password text input/m)
  assert.match(diagnostic, /^pages\.0\.0\.1: text text node used as an icon/m)
  assert.ok(!diagnostic.includes('private'))
  assert.ok(!diagnostic.includes('🚫'))
})
