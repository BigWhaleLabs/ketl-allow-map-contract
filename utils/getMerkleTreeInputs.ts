import { BigNumber, utils } from 'ethers'
import getMerkleTreeProof from './getMerkleTreeProof'

export default async function (allElements: string[], element: string) {
  const proof = await getMerkleTreeProof(element, allElements)
  const merkleRoot = utils.hexlify(proof.root)

  return {
    merkleRoot,
    pathIndices: proof.pathIndices,
    pathElements: proof.siblings.map(([s]) => BigNumber.from(s).toHexString()),
  }
}
