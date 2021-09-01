// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.8.0;

/* Internal Imports */
import { iOVM_GasPriceOracle } from "./iOVM_GasPriceOracle.sol";

/* External Imports */
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * @title OVM_GasPriceOracle
 * @dev This contract exposes the current l2 gas price, a measure of how congested the network
 * currently is. This measure is used by the Sequencer to determine what fee to charge for
 * transactions. When the system is more congested, the l2 gas price will increase and fees
 * will also increase as a result.
 *
 * Runtime target: OVM
 */
contract OVM_GasPriceOracle is Ownable, iOVM_GasPriceOracle {

    /*************
     * Variables *
     *************/

    // Current L2 gas price
    uint256 public gasPrice;
    // Current L1 base fee
    uint256 public l1BaseFee;

    /***************
     * Constructor *
     ***************/

    /**
     * @param _owner Address that will initially own this contract.
     */
    constructor(
        address _owner
    )
        Ownable()
    {
        transferOwnership(_owner);
    }


    /********************
     * Public Functions *
     ********************/

    /**
     * Allows the owner to modify the l2 gas price.
     * @param _gasPrice New l2 gas price.
     */
    function setGasPrice(
        uint256 _gasPrice
    )
        public
        override
        onlyOwner
    {
        gasPrice = _gasPrice;
        emit GasPriceUpdated(_gasPrice);

    }

    /**
     * Allows the owner to modify the l1 base fee.
     * @param _baseFee New l1 base fee
     */
    function setL1BaseFee(
        uint256 _baseFee
    )
        public
        override
        onlyOwner
    {
        l1BaseFee = _baseFee;
        emit L1BaseFeeUpdated(_baseFee);
    }

    /**
     * Computes the L1 portion of the fee
     * based on the size of the RLP encoded tx
     * and the current l1BaseFee
     * @param _data RLP encoded tx
     */
    function getL1Fee(bytes memory _data)
        public
        view
        override
        returns (
            uint256
        )
    {
        uint256 l1Cost = getL1Cost(_data);
        return SafeMath.mul(l1Cost, l1BaseFee);
    }

    /**
     * Computes the L1 cost of a RLP encoded tx
     * @param _data RLP encoded tx
     */
    function getL1Cost(bytes memory _data)
        public
        view
        override
        returns (
            uint256
        )
    {
        uint256 total = 0;
        for (uint256 i = 0; i < _data.length; i++) {
            if (_data[i] == 0) {
                total += 4;
            } else {
                total += 16;
            }
        }
        return total;
    }
}
