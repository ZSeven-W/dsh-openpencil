import { spawnSync } from 'node:child_process'

import {
  collabBootstrapEnvNames,
  validatedCollabBootstrapUrls,
} from './collab-bootstrap-config.mjs'
import { argumentValue, projectRoot } from './platforms.mjs'

const target = argumentValue('--target')
const bootstrap = validatedCollabBootstrapUrls()
const args = [
  'build',
  '--manifest-path',
  'vendor/openpencil/Cargo.toml',
  '--locked',
  '--release',
  '-p',
  'op-host-web-server',
]
if (target !== undefined) args.push('--target', target)

const result = spawnSync(process.platform === 'win32' ? 'cargo.exe' : 'cargo', args, {
  cwd: projectRoot,
  env: {
    ...process.env,
    [collabBootstrapEnvNames[0]]: bootstrap.cn,
    [collabBootstrapEnvNames[1]]: bootstrap.global,
  },
  stdio: 'inherit',
})
if (result.error !== undefined) throw result.error
if (result.status !== 0) {
  throw new Error(`op-host-web-server release build exited with status ${result.status ?? 'unknown'}`)
}

process.stdout.write(
  `built collaboration-enabled op-host-web-server${target === undefined ? '' : ` for ${target}`}\n`,
)
