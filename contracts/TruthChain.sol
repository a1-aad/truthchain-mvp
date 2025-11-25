// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TruthChain {
    event RecordStored(bytes32 indexed hash, string cid, address indexed submitter, uint256 timestamp);
    
    struct Record {
        bytes32 hash;
        string cid;
        address submitter;
        uint256 timestamp;
    }
    
    mapping(bytes32 => Record) public records;
    bytes32[] public recordHashes;
    
    function storeRecord(bytes32 hash, string memory cid) public {
        require(records[hash].timestamp == 0, "Record already exists");
        
        records[hash] = Record({
            hash: hash,
            cid: cid,
            submitter: msg.sender,
            timestamp: block.timestamp
        });
        
        recordHashes.push(hash);
        
        emit RecordStored(hash, cid, msg.sender, block.timestamp);
    }
    
    function getRecord(bytes32 hash) public view returns (Record memory) {
        require(records[hash].timestamp != 0, "Record does not exist");
        return records[hash];
    }
    
    function getTotalRecords() public view returns (uint256) {
        return recordHashes.length;
    }
}
