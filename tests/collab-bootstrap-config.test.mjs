import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

import {
  collabBootstrapEnvNames,
  validatedCollabBootstrapUrls,
  withoutCollabBootstrapBuildEnv,
} from '../scripts/collab-bootstrap-config.mjs'
import { parseManagedHandshake } from '../scripts/managed-handshake.mjs'
import { projectRoot } from '../scripts/platforms.mjs'

const VALID = Object.freeze({
  [collabBootstrapEnvNames[0]]: 'https://cn.openpencil.dev/api/v1/collaboration/bootstrap',
  [collabBootstrapEnvNames[1]]: 'https://global.openpencil.dev/api/v1/collaboration/bootstrap',
})

test('production editor builds require two distinct canonical relay bootstrap URLs', () => {
  assert.throws(
    () => validatedCollabBootstrapUrls({}),
    new RegExp(`${collabBootstrapEnvNames[0]} is required`),
  )
  assert.throws(
    () => validatedCollabBootstrapUrls({ [collabBootstrapEnvNames[0]]: VALID[collabBootstrapEnvNames[0]] }),
    new RegExp(`${collabBootstrapEnvNames[1]} is required`),
  )
  assert.deepEqual(validatedCollabBootstrapUrls(VALID), {
    cn: VALID[collabBootstrapEnvNames[0]],
    global: VALID[collabBootstrapEnvNames[1]],
  })
  assert.throws(
    () => validatedCollabBootstrapUrls({
      ...VALID,
      [collabBootstrapEnvNames[1]]: VALID[collabBootstrapEnvNames[0]],
    }),
    /must be distinct/,
  )
  assert.throws(
    () => validatedCollabBootstrapUrls({
      ...VALID,
      [collabBootstrapEnvNames[0]]: 'http://127.0.0.1/api/v1/collaboration/bootstrap',
    }),
    /must use https/,
  )
})

test('build-only collaboration URLs are removed from non-Cargo child environments', () => {
  const sanitized = withoutCollabBootstrapBuildEnv({
    PATH: '/test/bin',
    ...VALID,
  })
  assert.deepEqual(sanitized, { PATH: '/test/bin' })
})

test('managed handshake parse failures never disclose the temporary token', () => {
  const marker = 'temporary-token-must-not-appear'
  for (const line of [
    `{\"ok\":true,\"token\":\"${marker}\"`,
    JSON.stringify({ ok: true, token: marker }),
  ]) {
    assert.throws(
      () => parseManagedHandshake(line, 'darwin-arm64'),
      error => {
        assert.doesNotMatch(error.message, new RegExp(marker))
        return true
      },
    )
  }
})

test('the six-platform release builds and verifies collaboration-enabled native daemons', async () => {
  const workflow = await readFile(`${projectRoot}/.github/workflows/release.yml`, 'utf8')
  assert.match(workflow, /environment: release-production/)
  assert.match(workflow, /node scripts\/build-editor-runtime\.mjs --target \$\{\{ matrix\.rustTarget \}\}/)
  for (const name of collabBootstrapEnvNames) {
    assert.match(workflow, new RegExp(`${name}: \\\${\\\{ secrets\\.${name} \\\}\\\}`))
  }
  assert.match(workflow, /bash vendor\/openpencil\/tools\/check-op-auth-cargo-build\.sh/)
  assert.match(workflow, /--require-runtime --require-collab-bootstrap/)
})
