import { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree'
import { buildPoseidon } from 'circomlibjs'

export default async function getMerkleTreeProof(
  commitment: bigint | string,
  commitments: (bigint | string)[]
) {
  const poseidon = await buildPoseidon()
  const F = poseidon.F
  const tree = new IncrementalMerkleTree(
    (values) => BigInt(F.toString(poseidon(values))),
    15,
    BigInt(0),
    2
  )
  commitments.forEach((c) => tree.insert(c))
  return tree.createProof(tree.indexOf(commitment))
}
