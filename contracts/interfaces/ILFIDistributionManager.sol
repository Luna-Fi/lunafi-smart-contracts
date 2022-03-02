// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import {DistributionTypes} from '../lib/DistributionTypes.sol';

interface ILFIDistributionManager {
  function configureAssets(DistributionTypes.AssetConfigInput[] calldata assetsConfigInput)
    external;
}