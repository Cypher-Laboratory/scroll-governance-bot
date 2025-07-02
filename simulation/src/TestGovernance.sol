// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TestGovernance
 * @dev Simple test contract to emit ProposalCreated events for testing the Telegram bot
 */
contract TestGovernance {
    uint256 public proposalCounter;
    
    // Event matching the exact signature from Scroll governance
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address[] targets,
        uint256[] values,
        string[] signatures,
        bytes[] calldatas,
        uint256 startBlock,
        uint256 endBlock,
        string description,
        uint8 proposalType
    );

    /**
     * @dev Create a test proposal with the Kenya Scroll example data
     */
    function createTestProposal() external {
        proposalCounter++;
        
        // Create arrays for the proposal data
        address[] memory targets = new address[](1);
        targets[0] = address(0);
        
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        
        string[] memory signatures = new string[](1);
        signatures[0] = "";
        
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";
        
        string memory description = "# Kenya Scroll Local Node Founder Program \n## Proposal Type: Growth *Website: [www.web3clubs.xyz](http://www.web3clubs.xyz/)* *X: @Web3Clubs* *Find Identical Proposal with active links [here](https://docs.google.com/document/d/1CR6YJtP4wdJtJRl88N3y2IO6912tRDagSjqy7lNMFpY/edit?usp=sharing)* *About Us \\- Deck* The main discussion took place in this [forum post](https://forum.scroll.io/t/proposal-kenya-scroll-local-node-founder-program/730). \n\n## **Summary** This proposal requests a $30,000 (SCR 92401.51 as of 25/05/2025) grant from Scroll DAO to support the Kenya Scroll Node Founder Program, a 3-month, cohort-based initiative by Web3Clubs, East Africa\u0027s leading Web3 incubator. The program aims to launch 5\u201310 Scroll-powered projects by integrating African builders, financial institutions, and regulators into the Scroll ecosystem.";
        
        emit ProposalCreated(
            proposalCounter,
            msg.sender,
            targets,
            values,
            signatures,
            calldatas,
            16220909,   // startBlock
            16422509,   // endBlock
            description,
            0           // proposalType
        );
    }

    /**
     * @dev Create a custom proposal for testing different scenarios
     */
    function createCustomProposal(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        uint256 startBlock,
        uint256 endBlock,
        string memory description,
        uint8 proposalType
    ) external {
        proposalCounter++;
        
        emit ProposalCreated(
            proposalCounter,
            msg.sender,
            targets,
            values,
            signatures,
            calldatas,
            startBlock,
            endBlock,
            description,
            proposalType
        );
    }

    /**
     * @dev Batch create multiple test proposals for stress testing
     */
    function createMultipleTestProposals(uint256 count) external {
        for (uint256 i = 0; i < count; i++) {
            proposalCounter++;
            
            address[] memory targets = new address[](1);
            targets[0] = address(0);
            
            uint256[] memory values = new uint256[](1);
            values[0] = 0;
            
            string[] memory signatures = new string[](1);
            signatures[0] = "";
            
            bytes[] memory calldatas = new bytes[](1);
            calldatas[0] = "";
            
            string memory description = string(abi.encodePacked(
                "# Test Proposal #", 
                _toString(proposalCounter),
                " ## This is a test proposal for bot testing purposes. Proposal number: ",
                _toString(proposalCounter)
            ));
            
            emit ProposalCreated(
                proposalCounter,
                msg.sender,
                targets,
                values,
                signatures,
                calldatas,
                block.number,
                block.number + 201600, // ~1 week assuming 12s blocks
                description,
                uint8(i % 3) // Rotate between proposal types 0, 1, 2
            );
        }
    }

    /**
     * @dev Get the current proposal count
     */
    function getProposalCount() external view returns (uint256) {
        return proposalCounter;
    }

    /**
     * @dev Internal function to convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}