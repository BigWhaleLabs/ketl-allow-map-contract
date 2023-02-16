pragma circom 2.0.4;

include "./templates/MerkleTreeCheckerPoseidon.circom";

template AllowMapChecker(levels) {
  // Check MerkleTree
  signal input leaf;
  signal input pathElements[levels];
  signal input pathIndices[levels];

  // Get hashed leaf
  component leafPoseidon = Poseidon(1);
  leafPoseidon.inputs[0] <== leaf;
  signal hashedLeaf <== leafPoseidon.out;

  component merkleTreeChecker = MerkleTreeCheckerPoseidon(15);
  merkleTreeChecker.leaf <== hashedLeaf;
  for (var i = 0; i < levels; i++) {
    merkleTreeChecker.pathElements[i] <== pathElements[i];
    merkleTreeChecker.pathIndices[i] <== pathIndices[i];
  }

  signal output root <== merkleTreeChecker.root;
  // Create nullifier
  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== leaf;
  poseidon.inputs[1] <== 1337;

  signal output nullifier <== poseidon.out;
}

component main = AllowMapChecker(15);
