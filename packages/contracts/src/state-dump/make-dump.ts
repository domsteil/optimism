/* External Imports */
import { Signer } from 'ethers'
import {
  computeStorageSlots,
  getStorageLayout,
} from '@defi-wonderland/smock/dist/src/utils'

/* Internal Imports */
import { predeploys } from '../predeploys'
import { getContractArtifact } from '../contract-artifacts'

export interface RollupDeployConfig {
  whitelistConfig: {
    owner: string | Signer
    allowArbitraryContractDeployment: boolean
  }
  gasPriceOracleConfig: {
    owner: string | Signer
    initialGasPrice: number
  }
  l1StandardBridgeAddress: string
  l1FeeWalletAddress: string
}

export const makeStateDump = async (cfg: RollupDeployConfig): Promise<any> => {
  const variables = {
    OVM_DeployerWhitelist: {
      initialized: true,
      allowArbitraryDeployment:
        cfg.whitelistConfig.allowArbitraryContractDeployment,
      owner: cfg.whitelistConfig.owner,
    },
    OVM_GasPriceOracle: {
      _owner: cfg.gasPriceOracleConfig.owner,
      gasPrice: cfg.gasPriceOracleConfig.initialGasPrice,
    },
    OVM_L2StandardBridge: {
      l1TokenBridge: cfg.l1StandardBridgeAddress,
    },
    OVM_SequencerFeeVault: {
      l1FeeWallet: cfg.l1FeeWalletAddress,
    },
  }

  const dump = {}
  for (const predeployName of Object.keys(predeploys)) {
    const predeployAddress = predeploys[predeployName]
    const artifact = getContractArtifact(predeployName)
    dump[predeployAddress] = {
      code: artifact.deployedBytecode,
      storage: {},
    }

    if (predeployName in variables) {
      const storageLayout = await getStorageLayout(predeployName)
      const slots = computeStorageSlots(storageLayout, variables[predeployName])
      for (const [key, val] of Object.entries(slots)) {
        dump[predeployAddress].storage[key] = val
      }
    }
  }

  return dump
}
