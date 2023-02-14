import { buildPoseidon } from 'circomlibjs'
import { cwd } from 'process'
import { randomBytes } from 'crypto'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

const vcTokens: Array<bigint> = []
const founderTokens: Array<bigint> = []
void (async () => {
  for (let i = 0; i < 10; i++) {
    const randomBuffer = randomBytes(32)
    const randomNumber = BigInt(randomBuffer.readUIntBE(1, 6))
    const poseidon = await buildPoseidon()
    const F = poseidon.F
    const hashedNumber = F.toString(poseidon([randomNumber]))
    vcTokens.push(hashedNumber)
  }
  for (let i = 0; i < 10; i++) {
    const randomBuffer = randomBytes(32)
    const randomNumber = BigInt(randomBuffer.readUIntBE(1, 6))
    const poseidon = await buildPoseidon()
    const F = poseidon.F
    const hashedNumber = F.toString(poseidon([randomNumber]))
    founderTokens.push(hashedNumber)
  }

  writeFileSync(
    resolve(cwd(), 'inputs', `vc-tokens.txt`),
    vcTokens.join('\n'),
    'utf-8'
  )
  console.log('VC tokens saved!')
  writeFileSync(
    resolve(cwd(), 'inputs', `founder-tokens.txt`),
    founderTokens.join('\n'),
    'utf-8'
  )
  console.log('Founder tokens saved!')
})()
