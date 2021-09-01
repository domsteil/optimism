// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.8.0;

/**
 * @title iOVM_GasPriceOracle
 */
interface iOVM_GasPriceOracle {

    /**********
     * Events *
     **********/

    event GasPriceUpdated(uint256 _price);
    event L1BaseFeeUpdated(uint256 _price);

    /********************
     * Public Functions *
     ********************/

    function setGasPrice(uint256 _gasPrice) external;
    function setL1BaseFee(uint256 _baseFee) external;
    function getL1Fee(bytes memory _data) external returns (uint256);
    function getL1Cost(bytes memory _data) external returns (uint256);
}
