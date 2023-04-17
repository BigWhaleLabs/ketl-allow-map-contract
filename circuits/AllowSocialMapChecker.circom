pragma circom 2.0.4;

include "./templates/Nullify.circom";
include "./templates/EdDSAValidator.circom";
include "./templates/MerkleTreeCheckerMiMC.circom";

template AllowSocialMapChecker() {
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
  // Create nullifier
  signal input nonce[2];
  
  component nullifier = Nullify();
  nullifier.r <== nonce[0];
  nullifier.s <== nonce[1];

  signal output nullifierHash <== nullifier.nullifierHash;
  // Check Merkle proof
  var levels = 20;
  signal input pathIndices[levels];
  signal input siblings[levels];

  component merkleTreeChecker = MerkleTreeCheckerMiMC(levels);
  merkleTreeChecker.leaf <== record;
  merkleTreeChecker.root <== ownersMerkleRoot;
  for (var i = 0; i < levels; i++) {
    merkleTreeChecker.pathElements[i] <== siblings[i];
    merkleTreeChecker.pathIndices[i] <== pathIndices[i];
  }
}

component main{public [socialPubKeyX]} = AllowSocialMapChecker();
