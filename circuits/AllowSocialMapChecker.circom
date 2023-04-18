pragma circom 2.0.4;

include "./templates/EdDSAValidator.circom";
include "./templates/MerkleTreeCheckerPoseidon.circom";

template AllowSocialMapChecker(levels) {
  var socialMessageLength = 3;
  // Get messages
  signal input socialMessage[socialMessageLength];
  // Export attestation type
  signal output attestationType <== socialMessage[0];
  // Owners MerkleRoot
  signal ownersMerkleRoot <== socialMessage[1];
  // Record Hash
  signal record <== socialMessage[2];
  // Check if the EdDSA signature of social is valid
  signal input socialPubKeyX;
  signal input socialPubKeyY;
  signal input socialR8x;
  signal input socialR8y;
  signal input socialS;

  component socialEdDSAValidator = EdDSAValidator(socialMessageLength);
  socialEdDSAValidator.pubKeyX <== socialPubKeyX;
  socialEdDSAValidator.pubKeyY <== socialPubKeyY;
  socialEdDSAValidator.R8x <== socialR8x;
  socialEdDSAValidator.R8y <== socialR8y;
  socialEdDSAValidator.S <== socialS;
  for (var i = 0; i < socialMessageLength; i++) {
    socialEdDSAValidator.message[i] <== socialMessage[i];
  }

  signal input pathElements[levels];
  signal input pathIndices[levels];

  component merkleTreeChecker = MerkleTreeCheckerPoseidon(15);
  merkleTreeChecker.leaf <== record;
  for (var i = 0; i < levels; i++) {
    merkleTreeChecker.pathElements[i] <== pathElements[i];
    merkleTreeChecker.pathIndices[i] <== pathIndices[i];
  }

  signal output root <== merkleTreeChecker.root;
  // Create nullifier
  component poseidon = Poseidon(2);
  poseidon.inputs[0] <== record;
  poseidon.inputs[1] <== 1337;

  signal output nullifier <== poseidon.out;
}

component main{public [socialPubKeyX]} = AllowSocialMapChecker(15);
