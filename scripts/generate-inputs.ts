import { cwd } from 'process'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import getAllowMapInputs from '../utils/inputs/getAllowMapInputs'

void (async () => {
  const inputs = {
    'ketl-allow-map': getAllowMapInputs,
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
