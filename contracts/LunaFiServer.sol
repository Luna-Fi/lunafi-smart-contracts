// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { LibDiamond } from './libraries/LibDiamond.sol';
import { LibOracle } from './libraries/LibOracle.sol';
import { IERC165 } from './interfaces/global/IERC165.sol';
import { IDiamondLoupe } './interfaces/native/IDiamondLoupe.sol';
import { DiamondCut } from './implementation/management/DiamondCutFacet.sol';
import { DiamondLoupe } from './implementation/operations/DiamondLoupeFacet.sol';
import { OwnershipFacet } from './implementation/management/OwnershipFacet.sol';
/* import { OracleFacet } from './implementation/operations/OracleFacet.sol'; */

contract LunaFiServer {
    constructor() {
        /* set access control */
        LibDiamond.setContractOwner(msg.sender);

        /* initialize data views */
        (EventsStore storage es) = eventsStore();
        es._eventIdCounter.reset();

        /* initialize facets */
        DiamondCut diamondCut = new DiamondCut();
        DiamondLoupe diamondLoupe = new DiamondLoupe();
        OwnershipFacet ownershipFacet = new OwnershipFacet();
        /* OracleFacet oracleFacet = new OracleFacet(); */

        /* cut diamond for facets */
        bytes [] memory cut = new bytes[](3);
        cut[0] = abi.encodePacked(
                                  diamondCut,
                                  DiamondCut.diamondCut.selector
                                  );
        cut[1] = abi.encodePacked(
                                  diamondLoupe,
                                  IDiamondLoupe.facetFunctionSelectors.selector,
                                  IDiamondLoupe.facets.selector,
                                  IDiamondLoupe.facetAddress.selector,
                                  IDiamondLoupe.facetAddresses.selector,
                                  IERC165.supportsInterface.selector
                                  );
        cut[2] = abi.encodePacked(
                                  ownershipFacet,
                                  OwnershipFacet.transferOwnership.selector,
                                  OwnershipFacet.owner.selector
                                  );
    /*     cut[3] = abi.encodePacked( */
    /*                               oracleFacet, */
    /*                               OracleFacet.reportOutcome.selector */
    /*                               ); */
        LibDiamond.diamondCut(cut);
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
