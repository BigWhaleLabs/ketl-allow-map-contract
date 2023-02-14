import * as fs from 'fs'
import { cwd } from 'process'
import { ethers } from 'hardhat'
import { resolve } from 'path'
import prompt from 'prompt'

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

async function main() {
  const { contractAddress } = await prompt.get({
    properties: {
      contractAddress: {
        required: true,
        type: 'string',
        message: 'KetlAllowMap address',
        default: '0x1d11724475367FB590D862f883F0afC97bDaaD3f',
      },
    },
  })
  const path = resolve(cwd(), 'inputs', 'vc-tokens.txt')
  const tokens = await readLines(path)

  const factory = await ethers.getContractFactory('KetlAllowMap', {
    libraries: {
      IncrementalBinaryTree: '0x21aCbA77Ed14A72213F608290e318f2e912EAf50',
    },
  })
  const contract = factory.attach(contractAddress)
  console.log(tokens)
  const tx = await contract.addTokenHashes(tokens)

  await tx.wait()

  console.log(tx)
}
//

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
