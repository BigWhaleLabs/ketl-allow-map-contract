import { cwd } from 'process'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import getAllowMapInputs from '../utils/inputs/getAllowMapInputs'
import profileGetAllowMapInputs from '../utils/inputs/profileGetAllowMapInputs'

void (async () => {
  const inputs = {
    'ketl-allow-map': getAllowMapInputs,
    'profile-ketl-allow-map': profileGetAllowMapInputs,
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
