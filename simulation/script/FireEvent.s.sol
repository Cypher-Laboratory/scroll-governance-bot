// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TestGovernance.sol";

contract FireEvent is Script {
    address public constant GOVERNANCE_ADDRESS = address(0x70D780fc8E95d932C539A89D858EB5D2dD221daa);

    function run() external {
        TestGovernance governance = TestGovernance(GOVERNANCE_ADDRESS);

        vm.startBroadcast();

        console.log("Current proposal count:", governance.getProposalCount());

        // Create a new test proposal
        console.log("Creating new test proposal...");
        governance.createTestProposal();

        console.log("New proposal count:", governance.getProposalCount());
        console.log("Test proposal created successfully!");

        vm.stopBroadcast();
    }
}
