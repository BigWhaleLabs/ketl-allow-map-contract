import { cwd } from 'process'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import getWhitelistInputs from '../utils/inputs/getWhitelistInputs'

void (async () => {
  const inputs = {
    'ketl-whitelist': getWhitelistInputs,
  }
  for (const [name, fn] of Object.entries(inputs)) {
    const inputs = await fn()
    // Writing inputs
    writeFileSync(
      resolve(cwd(), 'inputs', `input-${name}.json`),
      JSON.stringify(inputs),
      'utf-8'
    )
    console.log(`Generated input-${name}.json!`)
  }
})()
