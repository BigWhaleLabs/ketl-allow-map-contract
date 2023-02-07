import { BigNumber } from 'ethers'
import { randomBytes } from 'crypto'
import getMerkleTreeProof from '../getMerkleTreeProof'

export async function getMerkleTreeInputs(
  commitment: bigint | string,
  commitments: (bigint | string)[]
) {
  const proof = await getMerkleTreeProof(commitment, commitments)

  return {
    pathIndices: proof.pathIndices,
    pathElements: proof.siblings.map(([s]) => BigNumber.from(s).toHexString()),
  }
}

export default async function () {
  const randomUint256 = () => BigNumber.from(randomBytes(32)).toBigInt()
  const thousandRandomUint256 = Array.from({ length: 1000 }, randomUint256)
  const leaf = thousandRandomUint256[0]
  return {
    leaf: leaf.toString(),
    ...(await getMerkleTreeInputs(leaf, thousandRandomUint256)),
  }
}
