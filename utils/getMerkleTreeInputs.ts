import { BigNumber, utils } from 'ethers'
import getMerkleTree from './getMerkleTree'

export default async function (allElements: string[], element: string) {
  const ownersMerkleTree = await getMerkleTree(
    allElements.map((v) => BigNumber.from(v))
  )
  const merkleRoot = utils.hexlify(ownersMerkleTree.root)
  const proof = ownersMerkleTree.createProof(allElements.indexOf(element))
  return {
    merkleRoot,
    pathIndices: proof.pathIndices,
    siblings: proof.siblings.map((v) => v[0]).map((v) => utils.hexlify(v)),
  }
}
