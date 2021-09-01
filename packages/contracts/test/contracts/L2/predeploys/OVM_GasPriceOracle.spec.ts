import { expect } from '../../../setup'

/* External Imports */
import { ethers } from 'hardhat'
import { ContractFactory, Contract, Signer } from 'ethers'

import { calculateL1Cost  } from '@eth-optimism/core-utils'

describe('OVM_GasPriceOracle', () => {
  const initialGasPrice = 0
  let signer1: Signer
  let signer2: Signer
  before(async () => {
    ;[signer1, signer2] = await ethers.getSigners()
  })

  let Factory__OVM_GasPriceOracle: ContractFactory
  before(async () => {
    Factory__OVM_GasPriceOracle = await ethers.getContractFactory(
      'OVM_GasPriceOracle'
    )
  })

  let OVM_GasPriceOracle: Contract
  beforeEach(async () => {
    OVM_GasPriceOracle = await Factory__OVM_GasPriceOracle.deploy(
      await signer1.getAddress()
    )
  })

  describe('owner', () => {
    it('should have an owner', async () => {
      expect(await OVM_GasPriceOracle.owner()).to.equal(
        await signer1.getAddress()
      )
    })
  })

  describe('setGasPrice', () => {
    it('should revert if called by someone other than the owner', async () => {
      await expect(OVM_GasPriceOracle.connect(signer2).setGasPrice(1234)).to.be
        .reverted
    })

    it('should succeed if called by the owner and is equal to `0`', async () => {
      await expect(OVM_GasPriceOracle.connect(signer1).setGasPrice(0)).to.not.be
        .reverted
    })

    it('should emit event', async () => {
      await expect(OVM_GasPriceOracle.connect(signer1).setGasPrice(100))
        .to.emit(OVM_GasPriceOracle, 'GasPriceUpdated')
        .withArgs(100)
    })
  })

  describe('get gasPrice', () => {
    it('should return zero at first', async () => {
      expect(await OVM_GasPriceOracle.gasPrice()).to.equal(initialGasPrice)
    })

    it('should change when setGasPrice is called', async () => {
      const gasPrice = 1234

      await OVM_GasPriceOracle.connect(signer1).setGasPrice(gasPrice)

      expect(await OVM_GasPriceOracle.gasPrice()).to.equal(gasPrice)
    })

    it('is the 1st storage slot', async () => {
      const gasPrice = 333433
      const slot = 1

      // set the price
      await OVM_GasPriceOracle.connect(signer1).setGasPrice(gasPrice)

      // get the storage slot value
      const priceAtSlot = await signer1.provider.getStorageAt(
        OVM_GasPriceOracle.address,
        slot
      )
      expect(await OVM_GasPriceOracle.gasPrice()).to.equal(
        ethers.BigNumber.from(priceAtSlot)
      )
    })
  })

  describe('setL1BaseFee', () => {
    it('should revert if called by someone other than the owner', async () => {
      await expect(OVM_GasPriceOracle.connect(signer2).setL1BaseFee(1234)).to.be
        .reverted
    })

    it('should succeed if called by the owner', async () => {
      await expect(OVM_GasPriceOracle.connect(signer1).setL1BaseFee(0)).to.not.be
        .reverted
    })

    it('should emit event', async () => {
      await expect(OVM_GasPriceOracle.connect(signer1).setL1BaseFee(100))
        .to.emit(OVM_GasPriceOracle, 'L1BaseFeeUpdated')
        .withArgs(100)
    })
  })

  describe('get l1BaseFee', () => {
    it('should return zero at first', async () => {
      expect(await OVM_GasPriceOracle.l1BaseFee()).to.equal(initialGasPrice)
    })

    it('should change when setL1BaseFee is called', async () => {
      const baseFee = 1234
      await OVM_GasPriceOracle.connect(signer1).setL1BaseFee(baseFee)
      expect(await OVM_GasPriceOracle.l1BaseFee()).to.equal(baseFee)
    })

    it('is the 2nd storage slot', async () => {
      const baseFee = 12345
      const slot = 2

      // set the price
      await OVM_GasPriceOracle.connect(signer1).setGasPrice(baseFee)

      // get the storage slot value
      const priceAtSlot = await signer1.provider.getStorageAt(
        OVM_GasPriceOracle.address,
        slot
      )
      expect(await OVM_GasPriceOracle.l1BaseFee()).to.equal(
        ethers.BigNumber.from(priceAtSlot)
      )
    })
  })

  // Test cases for gas estimation
  const inputs = [
    '0x',
    '0x00',
    '0x01',
    '0x0001',
    '0x0101',
    '0xffff',
    '0x00ff00ff00ff00ff00ff00ff',
  ]

  describe('getLCost', () => {
    for (const input of inputs) {
    it(`case: ${input}`, async () => {
        const cost = await OVM_GasPriceOracle.getL1Cost(input)
        const expected = calculateL1Cost(input)
        expect(cost).to.deep.equal(expected)
      })
    }
  })

  describe('getL1Fee', () => {
    for (const input of inputs) {
      it(`case: ${input}`, async () => {
        const l1BaseFee = await OVM_GasPriceOracle.l1BaseFee()
        const cost = await OVM_GasPriceOracle.getL1Fee(input)
        const expected = calculateL1Cost(input).mul(l1BaseFee)
        expect(cost).to.deep.equal(expected)
    })
    }
  })
})
