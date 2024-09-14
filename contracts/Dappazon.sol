// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    address public owner;

    struct Item{
        uint id;
        string name;
        string category;
        string image;
        uint cost;
        uint rate;
        uint stock;

    }

    struct Order{
        
        uint time;
        Item itemMsg;
    }
    mapping(uint=>Item)public items;
    mapping(address=>mapping(uint=>Order)) public orders;
    mapping(address=>uint)public ordercount;

    event newproduct(string name,uint cost,uint quantity);
    event Buy(address buyer,uint orderID,uint itemID) ;

    modifier onlyOwner{
        require(msg.sender==owner,'not owner');
        _;
    }

    constructor(){

        owner=msg.sender;
    }

    function list(
        uint _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint _cost,
        uint _rate,
        uint _stock

    )public{
        Item memory item =Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rate,
            _stock
            );
        items[_id]=item;
        emit newproduct(_name,_cost,_stock);
    }

    function buy(uint _id) public payable{
        Item memory item=items[_id];    
        require(msg.value>=item.cost,"unpayable");
        require(item.stock>0,"out of stock");
        //check item
        

        Order memory order =Order(block.timestamp,item);
        ordercount[msg.sender]++;
        orders[msg.sender][ordercount[msg.sender]]=order;
        
        items[_id].stock-=1;
        
        emit Buy(msg.sender,ordercount[msg.sender],_id);

    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }






}
