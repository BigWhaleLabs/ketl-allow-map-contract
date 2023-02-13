import { buildPoseidon } from 'circomlibjs'
import { cwd } from 'process'
import { randomBytes } from 'crypto'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

const numbers: Array<bigint> = []
void (async () => {
  for (let i = 0; i < 10; i++) {
    const randomBuffer = randomBytes(12)
    const randomNumber = BigInt(randomBuffer.readUIntBE(1, 6))
    const poseidon = await buildPoseidon()
    const F = poseidon.F
    const hashedNumber = F.toString(poseidon([randomNumber]))
    numbers.push(hashedNumber)
  }

  writeFileSync(
    resolve(cwd(), 'inputs', `tokens.txt`),
    numbers.join('\n'),
    'utf-8'
  )
})()
