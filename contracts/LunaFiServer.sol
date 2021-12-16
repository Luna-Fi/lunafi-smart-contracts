// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibDiamond } from './libraries/LibDiamond.sol';
import { IDiamondCut } from './interfaces/IDiamond.sol';

contract LunaFiServer {
    constructor(address _diamondCutFacet, address _diamondOwner) {
        /* set ownership */
        LibDiamond.setContractOwner(_diamondOwner);

        /* initialize facets */
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        bytes4[] memory functionSelectors = new bytes4[](1);
        functionSelectors[0] = IDiamondCut.diamondCut.selector;

        /* cut diamond for initial facets */
        cut[0] = IDiamondCut.FacetCut({
            facetAddress: _diamondCutFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: functionSelectors
            });
        LibDiamond.diamondCut(cut, address(0), "");
    }

    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        // get diamond storage
        assembly { ds.slot := position }
        // get facet from function selector
        address facet = address(bytes20(ds.facets[msg.sig]));
        require(facet != address(0), "Diamond: Function does not exist");
        // Execute external function from facet using delegatecall and return any value.
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
                // execute function call using the facet
                let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
                // get any return value
                returndatacopy(0, 0, returndatasize())
                // return any return value or error back to the caller
                switch result
                    case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    receive() external payable {}
}
