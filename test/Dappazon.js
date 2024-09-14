const { expect } = require("chai")
const {ethers} =require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}
const ID = 1 
const NAME = "Shoes"
const CATEGORY = "Clothing"
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1)
const RATE = 4
const STOCK = 5
describe('amozn',()=>{
    
  let dappazon 
  let owner, addr1, addr2

  beforeEach(async function () {
      [owner, addr1, addr2] = await ethers.getSigners()
      const Dappazon = await ethers.getContractFactory("Dappazon")
      dappazon = await Dappazon.deploy()
      await dappazon.deployed()
  })
  

  describe("set owner", ()=> {
    it("setOwner", async ()=> {
      
      expect(await dappazon.owner()).to.equal(owner.address)
    })
      
  })

  describe("listing", ()=> {
    let setProduct
    beforeEach(async function () {
      setProduct= await dappazon.connect(owner).list(ID,NAME,CATEGORY,IMAGE,COST,RATE,STOCK)
      await setProduct.wait()
    })
    it("return item atribute", async ()=> {
      const item= await dappazon.items(ID)
      expect(item.id).to.equal(ID)
      expect(item.name).to.equal(NAME)
      expect(item.category).to.equal(CATEGORY)
      expect(item.image).to.equal(IMAGE)
      expect(item.cost).to.equal(COST)
      expect(item.rate).to.equal(RATE)
      expect(item.stock).to.equal(STOCK)
    })
    it("newproduct emits", async ()=> {
      
      expect(setProduct).to.emit(dappazon,"newproduct")
    })
  })
  
  describe("buy something", ()=> {
    let trade
    beforeEach(async function () {
      trade= await dappazon.connect(owner).list(ID,NAME,CATEGORY,IMAGE,COST,RATE,STOCK)
      await trade.wait()
    
      trade= await dappazon.connect(addr1).buy(ID,{value:COST})
      await trade.wait()
    })

    it("check ordercount", async ()=> {
      const orderID= await dappazon.ordercount(addr1.address)
      expect(orderID).to.be.equal(1)
      
    })

    it("add order", async ()=> {
      const order= await dappazon.orders(addr1.address,1)
      expect(order.time).to.be.greaterThan(0)
      expect(order.itemMsg.stock).to.equal(STOCK)
    })
      
    it("received token", async ()=> {
      const balance= await ethers.provider.getBalance(dappazon.address)
      expect(balance).to.equal(COST)
    })
    
    it("emits Buy", async ()=> {

      expect(trade).to.emit(dappazon,"Buy")
    })
  
  })

  describe("buy something", ()=> {
    let trade,balanceBefore
    beforeEach(async function () {
      trade= await dappazon.connect(owner).list(ID,NAME,CATEGORY,IMAGE,COST,RATE,STOCK)
      await trade.wait()
    
      trade= await dappazon.connect(addr1).buy(ID,{value:COST})
      await trade.wait()

      balanceBefore= await ethers.provider.getBalance(owner.address)
      
      trade= await dappazon.connect(owner).withdraw()
      await trade.wait()
    })

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(0)
    })

    it("Updates the owner balance", async () => {
      const result = await ethers.provider.getBalance(owner.address)
      expect(result).to.greaterThan(balanceBefore)
    })

  })

    /*it("get name", async ()=> {
      await contractInstance.set(42)
      expect(await contractInstance.get()).to.equal(42)
    })*/
      
      
    
})
