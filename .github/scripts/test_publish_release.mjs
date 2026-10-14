// Native Node.js tests cannot use TypeScript return annotations.
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import path from 'node:path'
const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8')
const source = workflow.split(/ {10}script: \|\r?\n/)[1]
assert.ok(source, 'Publish script found')
const AsyncFunction = Object.getPrototypeOf(async () => null).constructor
const publish = new AsyncFunction('require', 'github', 'context', 'core', 'process', source)

async function simulate(options = {}) {
  const calls = []
  const missing = () => {
    throw Object.assign(new Error('Not found'), { status: 404 })
  }
  const record = (name, data) => {
    calls.push([name, data])
    return { data }
  }
  const github = {
    paginate: async () => options.assets || [],
    rest: {
      git: {
        getRef: async () => {
          if (options.permissionError) {
            throw Object.assign(new Error('Forbidden'), { status: 403 })
          }
          return options.ref ? { data: options.ref } : missing()
        },
        getTag: async () => ({ data: { object: { type: 'commit', sha: 'trigger-sha' } } })
      },
      repos: {
        getReleaseByTag: async () => (options.release ? { data: options.release } : missing()),
        generateReleaseNotes: async () => ({ data: { body: 'generated notes' } }),
        createRelease: async (data) => {
          record('create', data)
          return { data: { id: 42 } }
        },
        deleteReleaseAsset: async (data) => record('delete', data),
        uploadReleaseAsset: async (data) => {
          record('upload', data)
          if (options.failUpload) throw new Error('upload failed')
        },
        updateRelease: async (data) => record('publish', data)
      }
    }
  }
  const fakeRequire = (name) =>
    name === 'node:fs'
      ? {
          readdirSync: () =>
            options.files || ['auto-caption-v1.3.0.exe', 'auto-caption-v1.3.0.tar.gz'],
          readFileSync: () => Buffer.from('installer')
        }
      : path
  let error
  try {
    await publish(
      fakeRequire,
      github,
      { repo: { owner: 'owner', repo: 'repo' }, sha: 'trigger-sha' },
      { info: () => {} },
      { env: { RELEASE_TAG: 'v1.3.0', RELEASE_PRERELEASE: String(!!options.prerelease) } }
    )
  } catch (caught) {
    error = caught
  }
  return { calls, error }
}

test('Creates draft at triggering SHA and publishes Windows/Linux without a macOS installer', async () => {
  const { calls, error } = await simulate()
  assert.equal(error, undefined)
  assert.deepEqual(
    calls.map((call) => call[0]),
    ['create', 'upload', 'upload', 'publish']
  )
  assert.deepEqual(
    calls.filter((call) => call[0] === 'upload').map((call) => call[1].name),
    ['auto-caption-v1.3.0.exe', 'auto-caption-v1.3.0.tar.gz']
  )
  assert.equal(calls[0][1].target_commitish, 'trigger-sha')
  assert.equal(calls[0][1].draft, true)
  assert.equal(calls.at(-1)[1].draft, false)
})
test('Upload failure leaves draft unpublished', async () => {
  const { calls, error } = await simulate({ failUpload: true })
  assert.match(error.message, /upload failed/)
  assert.ok(!calls.some((call) => call[0] === 'publish'))
})
test('Draft retry replaces partial asset and publishes', async () => {
  const { calls, error } = await simulate({
    release: { id: 42, draft: true, target_commitish: 'trigger-sha' },
    assets: [{ id: 9, name: 'auto-caption-v1.3.0.exe' }]
  })
  assert.equal(error, undefined)
  assert.ok(calls.some((call) => call[0] === 'delete' && call[1].asset_id === 9))
  assert.ok(!calls.some((call) => call[0] === 'create'))
  assert.equal(calls.at(-1)[0], 'publish')
})
test('Published release at same annotated tag is skipped', async () => {
  const { calls, error } = await simulate({
    release: { id: 42, draft: false },
    ref: { object: { type: 'tag', sha: 'annotated-tag-sha' } }
  })
  assert.equal(error, undefined)
  assert.equal(calls.length, 0)
})
test('Tag at another commit fails without mutation', async () => {
  const { calls, error } = await simulate({ ref: { object: { type: 'commit', sha: 'other-sha' } } })
  assert.match(error.message, /another commit/)
  assert.equal(calls.length, 0)
})

test('Untagged draft at another commit fails without mutation', async () => {
  const { calls, error } = await simulate({
    release: { id: 42, draft: true, target_commitish: 'other-sha' }
  })
  assert.match(error.message, /another target/)
  assert.equal(calls.length, 0)
})

test('API permission failure is not treated as a missing release', async () => {
  const { calls, error } = await simulate({ permissionError: true })
  assert.equal(error.status, 403)
  assert.equal(calls.length, 0)
})
for (const [missing, files] of [
  ['.exe', ['auto-caption-v1.3.0.tar.gz']],
  ['.tar.gz', ['auto-caption-v1.3.0.exe']]
]) {
  test(`Missing ${missing} installer fails before creating release`, async () => {
    const { calls, error } = await simulate({ files })
    assert.equal(error.message, `Missing installer: ${missing}`)
    assert.equal(calls.length, 0)
  })
}
test('Pre-release is published without marking latest', async () => {
  const { calls, error } = await simulate({ prerelease: true })
  assert.equal(error, undefined)
  assert.equal(calls.at(-1)[1].prerelease, true)
  assert.equal(calls.at(-1)[1].make_latest, 'false')
})
