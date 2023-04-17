import { wasm as wasmTester } from 'circom_tester'
import profileGetAllowMapInputs from '../utils/inputs/profileGetAllowMapInputs'

describe('AllowSocialMapChecker circuit', function () {
  before(async function () {
    this.circuit = await wasmTester('circuits/AllowSocialMapChecker.circom')
    this.baseInputs = await profileGetAllowMapInputs()
  })
  it('should generate the witness successfully', async function () {
    const witness = await this.circuit.calculateWitness(this.baseInputs)
    await this.circuit.assertOut(witness, {})
  })
})
