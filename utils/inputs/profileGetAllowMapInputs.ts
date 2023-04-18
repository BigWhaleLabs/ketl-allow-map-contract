import { BigNumber, utils } from 'ethers'
import { buildPoseidon } from 'circomlibjs'
import Mimc7 from '../Mimc7'
import eddsaSign from '../eddsa/eddsaSign'
import getMerkleTreeInputs from '../getMerkleTreeInputs'
import padZeroesOnRightUint8 from '../padZeroesOnRightUint8'

function hashSocial(poseidon: any) {
  return (social: string) => {
    const F = poseidon.F
    const maxSocialIdentityLength = 90
    // Message
    const socialIdentityLengthBytes = padZeroesOnRightUint8(
      utils.toUtf8Bytes(social),
      maxSocialIdentityLength
    )

    return BigNumber.from(
      F.toString(poseidon(socialIdentityLengthBytes))
    ).toHexString()
  }
}

async function getSocialSignatureInputs(
  recordHash: string,
  ownersMerkleRoot: string
) {
  const message = [
    0, // "owns" type of attestation
    ownersMerkleRoot,
    recordHash,
  ].map((v) => BigNumber.from(v))
  const mimc7 = await new Mimc7().prepare()
  const hash = mimc7.hashWithoutBabyJub(message)
  // EdDSA
  const { publicKey, signature } = await eddsaSign(hash)

  return {
    socialMessage: message.map((n) => n.toHexString()),
    socialPubKeyX: mimc7.F.toObject(publicKey[0]).toString(),
    socialPubKeyY: mimc7.F.toObject(publicKey[1]).toString(),
    socialR8x: mimc7.F.toObject(signature.R8[0]).toString(),
    socialR8y: mimc7.F.toObject(signature.R8[1]).toString(),
    socialS: signature.S.toString(),
  }
}

export default async function () {
  const poseidon = await buildPoseidon()

  const profiles = [
    'linkedin/nikitakolmogorov',
    'linkedin/avrdude',
    'linkedin/t-damer',
    'linkedin/westmichel',
  ].sort()

  const hashFunc = hashSocial(poseidon)
  const hashedProfiles = profiles.map(hashFunc)
  const leaf = hashFunc(profiles[0])

  const { merkleRoot, ...merkleTreeInputs } = await getMerkleTreeInputs(
    hashedProfiles,
    leaf
  )

  const recordInputs = await getSocialSignatureInputs(leaf, merkleRoot)

  return {
    ...recordInputs,
    ...merkleTreeInputs,
  }
}
