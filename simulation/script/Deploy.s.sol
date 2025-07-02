// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TestGovernance.sol";

contract DeployScript is Script {
    function run() external {
        
        vm.startBroadcast();

        // Deploy the TestGovernance contract
        TestGovernance governance = new TestGovernance();
        
        console.log("TestGovernance deployed to:", address(governance));
        
        // Create the first test proposal immediately after deployment
        governance.createTestProposal();
        
        console.log("Test proposal created with ID:", governance.getProposalCount());
        console.log("Contract deployed and ready for testing!");
        
        vm.stopBroadcast();
    }
}