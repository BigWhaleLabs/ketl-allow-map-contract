import { BigNumber, utils } from 'ethers'
import Mimc7 from '../Mimc7'
import eddsaSign from '../eddsa/eddsaSign'
import getMerkleTreeInputs from '../getMerkleTreeInputs'
import getNonceInputs from './getNonceInputs'
import padZeroesOnRightUint8 from '../padZeroesOnRightUint8'

function hashSocial(mimc7: Mimc7) {
  return (social: string) => {
    const maxSocialIdentityLength = 90
    // Message
    const socialIdentityLengthBytes = padZeroesOnRightUint8(
      utils.toUtf8Bytes(social),
      maxSocialIdentityLength
    )

    return BigNumber.from(
      mimc7.hashWithoutBabyJub(socialIdentityLengthBytes)
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
    nonce: getNonceInputs(),
  }
}

export default async function () {
  const mimc7 = await new Mimc7().prepare()
  const profiles = [
    'linkedin/nikitakolmogorov',
    'linkedin/avrdude',
    'linkedin/t-damer',
    'linkedin/westmichel',
  ].sort()

  const hashedProfiles = profiles.map(hashSocial(mimc7))
  const leaf = hashSocial(mimc7)(profiles[0])

  const { merkleRoot, ...merkleTreeInputs } = await getMerkleTreeInputs(
    hashedProfiles,
    leaf
  )

  const recordInputs = await getSocialSignatureInputs(leaf, merkleRoot)

  return {
    leaf: leaf.toString(),
    ...recordInputs,
    ...merkleTreeInputs,
  }
}
