pragma circom 2.0.4;

include "./templates/MerkleTreeCheckerPoseidon.circom";

template WhitelistChecker(levels) {
  // Check MerkleTree
  signal input leaf;
  signal input pathElements[levels];
  signal input pathIndices[levels];

  component merkleTreeChecker = MerkleTreeCheckerPoseidon(15);
  merkleTreeChecker.leaf <== leaf;
  for (var i = 0; i < levels; i++) {
    merkleTreeChecker.pathElements[i] <== pathElements[i];
    merkleTreeChecker.pathIndices[i] <== pathIndices[i];
  }

  signal output root <== merkleTreeChecker.root;
  // Create nullifier
  component poseidon = Poseidon(1);
  poseidon.inputs[0] <== leaf;

  signal output nullifier <== poseidon.out;
}

component main = WhitelistChecker(15);
