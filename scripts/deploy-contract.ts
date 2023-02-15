import { ethers, run } from 'hardhat'
import { utils } from 'ethers'
import { version } from '../package.json'
import getIncrementalTreeContract from '../test/utils'
import prompt from 'prompt'

const regexes = {
  ethereumAddress: /^0x[a-fA-F0-9]{40}$/,
}

async function main() {
  const [deployer] = await ethers.getSigners()
  // Deploy the contract
  console.log('Deploying contracts with the account:', deployer.address)
  console.log(
    'Account balance:',
    utils.formatEther(await deployer.getBalance())
  )
  const provider = ethers.provider
  const { chainId } = await provider.getNetwork()
  const chains = {
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    5: 'goerli',
  } as { [chainId: number]: string }
  const chainName = chains[chainId]

  const contractName = 'KetlAllowMap'
  const depth = 15

  const { verifierAddress } = await prompt.get({
    properties: {
      verifierAddress: {
        required: true,
        pattern: regexes.ethereumAddress,
      },
      depth: {
        required: true,
        default: 30,
      },
    },
  })

  console.log(`Deploying IncrementalBinaryTreeLib...`)
  const incrementalBinaryTreeLibAddress = await getIncrementalTreeContract()

  console.log(
    `IncrementalBinaryTreeLib deployed to ${incrementalBinaryTreeLibAddress}`
  )

  console.log(`Deploying ${contractName}...`)

  const factory = await ethers.getContractFactory(contractName, {
    libraries: {
      IncrementalBinaryTree: incrementalBinaryTreeLibAddress,
    },
  })
  const contract = await factory.deploy(version, verifierAddress, depth)
  console.log(
    'Deploy tx gas price:',
    utils.formatEther(contract.deployTransaction.gasPrice || 0)
  )
  console.log(
    'Deploy tx gas limit:',
    utils.formatEther(contract.deployTransaction.gasLimit)
  )
  await contract.deployed()
  const address = contract.address
  console.log('Contract deployed to:', address)
  console.log('Wait for 1 minute to make sure blockchain is updated')
  await new Promise((resolve) => setTimeout(resolve, 60 * 1000))
  // Try to verify the contract on Etherscan
  try {
    await run('verify:verify', {
      address,
      constructorArguments: [version, verifierAddress, depth],
    })
    await run('verify:verify', {
      incrementalBinaryTreeLibAddress,
    })
  } catch (err) {
    console.log(
      'Error verifiying contract on Etherscan:',
      err instanceof Error ? err.message : err
    )
  }
  // Print out the information
  console.log(`${contractName} deployed and verified on Etherscan!`)
  console.log('Contract address:', address)
  console.log(
    'Etherscan URL:',
    `https://${
      chainName !== 'mainnet' ? `${chainName}.` : ''
    }etherscan.io/address/${address}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
