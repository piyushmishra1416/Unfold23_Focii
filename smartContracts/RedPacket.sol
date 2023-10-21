// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "https://github.com/ConsenSysMesh/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/utils/SafeERC20.sol";
import {random} from "./random.sol";

contract RedEnvelopeContract is random {
    
    enum RedEnvelopeStatus { NotExpired, Expired }
    using SafeMath for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    
    struct RedEnvelope {
        string id;
        address creator;
        address token;
        bool isRandom;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 totalReceivers;
        uint256 deadline;
    }
    
    address payable[] public owner;
    uint256 public minAmount;
    uint256 public counter = 1;

    mapping(string => RedEnvelope) public redEnvelopes;
    mapping(address => RedEnvelope) public creators;
    mapping(address => uint256) public storeCreator;
    mapping(address => random) public _storeCreator;

    constructor() {
         owner.push(payable(msg.sender));
        //minAmount = 0.001 ether; // 0.001 Ether
    }

    event RedEnvelopeCreated(uint256 envId, address sender, uint256 totalAmount);
    event RedEnvelopeClaimed(uint256 envId, address receiver, uint256 amount);
    event RedEnvelopeExpired(uint256 envId);


    function createRedPacketErc(address _tokenContract,uint _amt,bool _rand,uint _receiverCnt,string calldata _id,uint256 _deadline)external payable returns (RedEnvelope memory){
        require(_amt>0,"Amount must be greater than 0");

        RedEnvelope memory newRedEnvelope;
        newRedEnvelope.id=_id;
        newRedEnvelope.creator=msg.sender;
        newRedEnvelope.token=_tokenContract;
        newRedEnvelope.isRandom=_rand;
        uint256 balanceBeforeTransfer=IERC20Upgradeable(_tokenContract).balanceOf(address(this));
        IERC20Upgradeable(_tokenContract).safeTransferFrom(msg.sender, address(this), _amt);
        uint256 balanceAfterTransfer=IERC20Upgradeable(_tokenContract).balanceOf(address(this));
        newRedEnvelope.totalAmount=balanceAfterTransfer=balanceBeforeTransfer;
        newRedEnvelope.remainingAmount=balanceAfterTransfer-balanceBeforeTransfer;
        newRedEnvelope.totalReceivers=_receiverCnt;
        newRedEnvelope.deadline= block.timestamp + _deadline;
        redEnvelopes[_id]=newRedEnvelope;

        
    }


    function claimTokens(string calldata _id) external{
        require(block.timestamp<redEnvelopes[_id].deadline,"Claim Time over");
        

    }


    function createCreator(address _creatorAddress) public {
        random r = new random();
        storeCreator[payable(_creatorAddress)] = counter;
        owner.push(payable(_creatorAddress));
        _storeCreator[payable(_creatorAddress)] = r;
        counter++;
    }

    function createRedEnvelope(uint256 _totalAmount, uint256 _totalClaims, address _creatorAddress) external {
        require(_totalAmount >= minAmount, "Total amount must be greater than or equal to minAmount");
        string envId = block.timestamp; // Use block.timestamp as a simple identifier of uuid can be altered later.
        redEnvelopes[envId] = RedEnvelope(envId, msg.sender, _totalAmount, _totalAmount, _totalClaims, RedEnvelopeStatus.NotExpired);
        creators[_creatorAddress] = redEnvelopes[envId];
        emit RedEnvelopeCreated(envId, msg.sender, _totalAmount);
    }

    function markRedEnvelopeAsExpired(uint256 envId, uint256 ownerId) external {
        require(msg.sender == owner[ownerId], "Only the owner can mark a red envelope as expired");
        require(redEnvelopes[envId].status == RedEnvelopeStatus.NotExpired, "Red envelope is not in NotExpired state");
        
        redEnvelopes[envId].status = RedEnvelopeStatus.Expired;
        emit RedEnvelopeExpired(envId);
    }

    function claimRedEnvelope(uint256 envId, address _creatorAddress) external {
        require(redEnvelopes[envId].status == RedEnvelopeStatus.NotExpired, "Red envelope is not in NotExpired state");
        _storeCreator[_creatorAddress].requestRandomWords();
        uint256 randomAmount = _storeCreator[_creatorAddress].getter();
        uint256 claimedAmt = redEnvelopes[envId].remainingAmount*randomAmount;
        redEnvelopes[envId].remainingAmount -= claimedAmt;
        emit RedEnvelopeClaimed(envId, msg.sender, claimedAmt);
    }
}