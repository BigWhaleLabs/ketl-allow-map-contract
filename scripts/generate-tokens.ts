import { BigNumber } from 'ethers'
import { buildPoseidon } from 'circomlibjs'
import { cwd } from 'process'
import { randomBytes } from 'crypto'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

const vcTokens: Array<bigint> = []
const vcNumbers: Array<bigint> = []
const founderTokens: Array<bigint> = []
const founderNumbers: Array<bigint> = []

const getRandomUint256 = () => BigNumber.from(randomBytes(32)).toBigInt()

void (async () => {
  for (let i = 0; i < 10; i++) {
    const poseidon = await buildPoseidon()
    const F = poseidon.F
    const randomUint256 = getRandomUint256()
    const hashedNumber = F.toString(poseidon([randomUint256]))

    vcTokens.push(hashedNumber)
    vcNumbers.push(randomUint256)
  }
  for (let i = 0; i < 10; i++) {
    const poseidon = await buildPoseidon()
    const F = poseidon.F
    const randomUint256 = getRandomUint256()
    const hashedNumber = F.toString(poseidon([randomUint256]))

    founderTokens.push(hashedNumber)
    founderNumbers.push(randomUint256)
  }

  writeFileSync(
    resolve(cwd(), 'inputs', `vc-tokens.txt`),
    vcTokens.join('\n'),
    'utf-8'
  )
  writeFileSync(
    resolve(cwd(), 'inputs', `vc-numbers.txt`),
    vcNumbers.join('\n'),
    'utf-8'
  )
  console.log('VC tokens saved!')
  writeFileSync(
    resolve(cwd(), 'inputs', `founder-tokens.txt`),
    founderTokens.join('\n'),
    'utf-8'
  )
  writeFileSync(
    resolve(cwd(), 'inputs', `founder-numbers.txt`),
    founderNumbers.join('\n'),
    'utf-8'
  )
  console.log('Founder tokens saved!')
})()
