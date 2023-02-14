import { wasm as wasmTester } from 'circom_tester'
import getAllowMapInputs from '../utils/inputs/getAllowMapInputs'

describe('AllowMapChecker circuit', function () {
  before(async function () {
    this.circuit = await wasmTester('circuits/AllowMapChecker.circom')
    this.baseInputs = await getAllowMapInputs()
  })
  it('should generate the witness successfully', async function () {
    const witness = await this.circuit.calculateWitness(this.baseInputs)
    await this.circuit.assertOut(witness, {})
  })
})
