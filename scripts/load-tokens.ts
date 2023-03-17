import * as fs from 'fs'
import { cwd } from 'process'
import { ethers } from 'hardhat'
import { resolve } from 'path'
import prompt from 'prompt'

const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/

function readLines(filePath: string) {
  return new Promise<string[]>((resolve, reject) => {
    const lines: string[] = []

    fs.createReadStream(filePath)
      .on('error', (error) => {
        reject(error)
      })
      .on('data', (chunk) => {
        const chunkLines = chunk.toString().split('\n')
        lines.push(...chunkLines)
      })
      .on('end', () => {
        resolve(lines)
      })
  })
}

function getBatchOfTokens(tokens: string[], start: number, end: number) {
  return tokens.slice(start, end)
}

function prepareAllBatches(tokens: string[]) {
  const batchStep = 10
  const batches: string[][] = []
  for (let i = 0; i < tokens.length; i += batchStep) {
    const batch = getBatchOfTokens(tokens, i, i + batchStep)
    batches.push(batch)
  }
  return batches
}

async function main() {
  const { vcContractAddress, founderContractAddress } = await prompt.get({
    properties: {
      vcContractAddress: {
        required: true,
        pattern: ethereumAddressRegex,
        message: 'VC KetlAllowMap address',
      },
      founderContractAddress: {
        required: true,
        pattern: ethereumAddressRegex,
        message: 'Founder KetlAllowMap address',
      },
    },
  })
  const founderTokenPath = resolve(cwd(), 'inputs', 'founder-tokens.txt')
  const vcTokenPath = resolve(cwd(), 'inputs', 'vc-tokens.txt')

  const founderTokens = await readLines(founderTokenPath)
  const vcTokens = await readLines(vcTokenPath)

  const vcBatches = prepareAllBatches(vcTokens)
  const founderBatches = prepareAllBatches(founderTokens)

  const founderFactory = await ethers.getContractFactory('KetlAllowMap', {
    libraries: {
      IncrementalBinaryTree: '0x842B06545f9dc6a3cCe1eFD8e4B44095643e3395',
    },
  })
  const vcFactory = await ethers.getContractFactory('KetlAllowMap', {
    libraries: {
      IncrementalBinaryTree: '0xCB7C7C828c88EbFCd982D51B4b52c33a145B5F96',
    },
  })
  const founderAllowMapContract = founderFactory.attach(founderContractAddress)
  const vcAllowMapContract = vcFactory.attach(vcContractAddress)

  // VC tokens load
  for (const [i, batch] of vcBatches.entries()) {
    console.log(`Loading VC batch ${i}`)
    const tx = await vcAllowMapContract.addTokenHashes(batch)
    const receipt = await tx.wait()

    console.log(
      `Batch ${i} minted `,
      `https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`
    )
  }
  // Founder tokens load
  for (const [i, batch] of founderBatches.entries()) {
    console.log(`Loading Founder batch ${i}`)
    const tx = await founderAllowMapContract.addTokenHashes(batch)
    const receipt = await tx.wait()

    console.log(
      `Batch ${i} minted `,
      `https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`
    )
  }
  console.log('All tokens loaded!')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
