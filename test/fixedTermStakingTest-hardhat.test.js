const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MockProvider } = require("ethereum-waffle");
require("@nomiclabs/hardhat-ethers");

describe("Fixed Term Staking", function () {
   const [wallet, walletTo] = new MockProvider().getWallets()
   let staked;
   let token;
   let owner, accounts;

   before(async () => {

      Erc20 = await hre.ethers.getContractFactory("lunaToken");
      token = await Erc20.deploy()

      await token.deployed();
      console.log("lunaToken deployed to:", token.address);

      Staking = await hre.ethers.getContractFactory("lunaFund");
      staked = await Staking.deploy(token.address);

      await staked.deployed();
      console.log("staking deployed to:", staked.address);
      // const accounts = await hre.ethers.getAccounts();
      const approveAmount = await token.totalSupply()
      token.approve(staked.address, approveAmount)
   });

   it("Should allow owner to Add a stakeType", async function () {

      const stakeTypeID1 = 1
      const stakeTypeID2 = 2
      const stakeTypeID3 = 3
      const term1 = 1
      const term2 = 2
      const term3 = 3
      const percentageReturn1 = 5
      const percentageReturn2 = 10
      const percentageReturn3 = 15
      const penaltyAmount1 = 0
      const penaltyAmount2 = 0
      const penaltyPercentage1 = 0
      const penaltyPercentage2 = 0
      const minAmount = 10000
      const maxAmount = 0

      await staked.addStakeType(term1, percentageReturn1, penaltyAmount1, penaltyPercentage1, minAmount, maxAmount)
      await staked.addStakeType(term2, percentageReturn2, penaltyAmount2, penaltyPercentage2, minAmount, maxAmount)
      await staked.addStakeType(term3, percentageReturn3, penaltyAmount2, penaltyPercentage2, minAmount, maxAmount)

      const stakeType1 = await staked.getStakeType(stakeTypeID1)
      const stakeType2 = await staked.getStakeType(stakeTypeID2)
      const stakeType3 = await staked.getStakeType(stakeTypeID3)

      expect(stakeType1.Type).equal(1)

      expect(stakeType1.term).equal(1)

      expect(stakeType1.percentageReturn).equal(5)

      expect(stakeType1.minAmount).equal(10000);

      expect(stakeType2.Type).equal(2);

      expect(stakeType2.term).equal(2);

      expect(stakeType2.percentageReturn).equal(10);

      expect(stakeType2.minAmount).equal(10000);

      expect(stakeType3.Type).equal(3);

      expect(stakeType3.term).equal(3);

      expect(stakeType3.percentageReturn).equal(15);

      expect(stakeType3.minAmount).equal(10000);
   });


   it("Should allow owner to update the stakeType details", async () => {
      const stakeTypeID = 1
      const term = 1
      const percentageReturn = 5
      const penaltyAmount = 0
      const penaltyPercentage = 0
      const minAmount = 10000
      const maxAmount = 100000
      await staked.updateStakeType(stakeTypeID, term, percentageReturn, penaltyAmount, penaltyPercentage, minAmount, maxAmount)
      //assert stake Values.
      const stakeType = await staked.getStakeType(stakeTypeID)
      expect(stakeType.Type).equal(1)
      expect(stakeType.percentageReturn).equal(5)
      expect(stakeType.term).equal(1)
      expect(stakeType.minAmount).equal(10000)
      expect(stakeType.maxAmount).equal(100000)
   });

   it("Should allow any user to stake LunaTokens", async () => {
      [owner, ...accounts] = await ethers.getSigners();

      await token.connect(accounts[0]).approve(staked.address, 100000);
      await token.connect(accounts[1]).approve(staked.address, 100000);
      await token.connect(accounts[2]).approve(staked.address, 100000);
      await token.connect(accounts[3]).approve(staked.address, 100000);
      await token.connect(accounts[4]).approve(staked.address, 100000);

      await token.transfer(accounts[0].address, 100000)
      await token.transfer(accounts[1].address, 100000)
      await token.transfer(accounts[2].address, 100000)
      await token.transfer(accounts[3].address, 100000)
      await token.transfer(accounts[4].address, 100000)

      const stakeAmount = 10000
      const StakeType1 = 1
      const StakeType2 = 2
      const StakeType3 = 3
      const stakeID1 = 1
      const stakeID2 = 2
      const stakeID3 = 3
      const stakeID4 = 4
      const stakeID5 = 5
      const stakeID6 = 6
      const stakeID7 = 7
      const stakeID8 = 8
      const stakeID9 = 9
      const stakeID10 = 10

      await staked.connect(accounts[0]).addStake(stakeAmount, StakeType1);
      await staked.connect(accounts[1]).addStake(stakeAmount, StakeType2);
      await staked.connect(accounts[2]).addStake(stakeAmount, StakeType3);
      await staked.connect(accounts[3]).addStake(stakeAmount, StakeType1);
      await staked.connect(accounts[4]).addStake(stakeAmount, StakeType2);

      await staked.connect(accounts[0]).addStake(stakeAmount, StakeType3);
      await staked.connect(accounts[1]).addStake(stakeAmount, StakeType1);
      await staked.connect(accounts[2]).addStake(stakeAmount, StakeType2);
      await staked.connect(accounts[3]).addStake(stakeAmount, StakeType3);
      await staked.connect(accounts[4]).addStake(stakeAmount, StakeType1);

      // check the stake details
      const stakeDetails1 = await staked.getStakeDetailsByStakeID(stakeID1)
      const stakeDetails2 = await staked.getStakeDetailsByStakeID(stakeID2)
      const stakeDetails3 = await staked.getStakeDetailsByStakeID(stakeID3)
      const stakeDetails4 = await staked.getStakeDetailsByStakeID(stakeID4)
      const stakeDetails5 = await staked.getStakeDetailsByStakeID(stakeID5)
      const stakeDetails6 = await staked.getStakeDetailsByStakeID(stakeID6)
      const stakeDetails7 = await staked.getStakeDetailsByStakeID(stakeID7)
      const stakeDetails8 = await staked.getStakeDetailsByStakeID(stakeID8)
      const stakeDetails9 = await staked.getStakeDetailsByStakeID(stakeID9)
      const stakeDetails10 = await staked.getStakeDetailsByStakeID(stakeID10)

      expect(stakeDetails1.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails1.active).to.equal(true)
      expect(stakeDetails1.cancelled).to.equal(false)
      expect(stakeDetails1.matured).to.equal(false)
      expect(stakeDetails1.settled).to.equal(false)
      expect(stakeDetails1.ownerAddress).to.equal(accounts[0].address)

      expect(stakeDetails2.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails2.active).to.equal(true)
      expect(stakeDetails2.cancelled).to.equal(false)
      expect(stakeDetails2.matured).to.equal(false)
      expect(stakeDetails2.settled).to.equal(false)
      expect(stakeDetails2.ownerAddress).to.equal(accounts[1].address)

      expect(stakeDetails3.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails3.active).to.equal(true)
      expect(stakeDetails3.cancelled).to.equal(false)
      expect(stakeDetails3.matured).to.equal(false)
      expect(stakeDetails3.settled).to.equal(false)
      expect(stakeDetails3.ownerAddress).to.equal(accounts[2].address)

      expect(stakeDetails4.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails4.active).to.equal(true)
      expect(stakeDetails4.cancelled).to.equal(false)
      expect(stakeDetails4.matured).to.equal(false)
      expect(stakeDetails4.settled).to.equal(false)
      expect(stakeDetails4.ownerAddress).to.equal(accounts[3].address)

      expect(stakeDetails5.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails5.active).to.equal(true)
      expect(stakeDetails5.cancelled).to.equal(false)
      expect(stakeDetails5.matured).to.equal(false)
      expect(stakeDetails5.settled).to.equal(false)
      expect(stakeDetails5.ownerAddress).to.equal(accounts[4].address)

      expect(stakeDetails6.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails6.active).to.equal(true)
      expect(stakeDetails6.cancelled).to.equal(false)
      expect(stakeDetails6.matured).to.equal(false)
      expect(stakeDetails6.settled).to.equal(false)
      expect(stakeDetails6.ownerAddress).to.equal(accounts[0].address)

      expect(stakeDetails7.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails7.active).to.equal(true)
      expect(stakeDetails7.cancelled).to.equal(false)
      expect(stakeDetails7.matured).to.equal(false)
      expect(stakeDetails7.settled).to.equal(false)
      expect(stakeDetails7.ownerAddress).to.equal(accounts[1].address)

      expect(stakeDetails8.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails8.active).to.equal(true)
      expect(stakeDetails8.cancelled).to.equal(false)
      expect(stakeDetails8.matured).to.equal(false)
      expect(stakeDetails8.settled).to.equal(false)
      expect(stakeDetails8.ownerAddress).to.equal(accounts[2].address)

      expect(stakeDetails9.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails9.active).to.equal(true)
      expect(stakeDetails9.cancelled).to.equal(false)
      expect(stakeDetails9.matured).to.equal(false)
      expect(stakeDetails9.settled).to.equal(false)
      expect(stakeDetails9.ownerAddress).to.equal(accounts[3].address)

      expect(stakeDetails10.lunaAmount).to.equal(stakeAmount)
      expect(stakeDetails10.active).to.equal(true)
      expect(stakeDetails10.cancelled).to.equal(false)
      expect(stakeDetails10.matured).to.equal(false)
      expect(stakeDetails10.settled).to.equal(false)
      expect(stakeDetails10.ownerAddress).to.equal(accounts[4].address)

   })

   it("Should allow user to cancel the stake and settle if there is enough balance in the contract", async () => {
      const accounts = await web3.eth.getAccounts()

      const stakeID5 = 5
      const stakeID6 = 6
      const stakeID7 = 7

      //await staked.ClaimToInvest()
      const beforeBalance5 = await token.balanceOf(accounts[5])
      const beforeBalance1 = await token.balanceOf(accounts[1])
      const beforeBalance2 = await token.balanceOf(accounts[2])
      console.log("Balance Before cancelling the Stake : ", beforeBalance5.toNumber())
      console.log("Balance Before cancelling the Stake : ", beforeBalance1.toNumber())
      console.log("Balance Before cancelling the Stake : ", beforeBalance2.toNumber())

      await staked.cancelStake(stakeID5, { from: accounts[5] })
      await staked.cancelStake(stakeID6, { from: accounts[1] })
      await staked.cancelStake(stakeID7, { from: accounts[2] })

      const stakeDetails5 = await staked.getStakeDetailsByStakeID(stakeID5)
      const stakeDetails6 = await staked.getStakeDetailsByStakeID(stakeID6)
      const stakeDetails7 = await staked.getStakeDetailsByStakeID(stakeID7)

      assert(stakeDetails5.cancelled == true)
      assert(stakeDetails5.active == false)
      assert(stakeDetails5.matured == false)
      assert(stakeDetails5.settled == true)

      assert(stakeDetails6.cancelled == true)
      assert(stakeDetails6.active == false)
      assert(stakeDetails6.matured == false)
      assert(stakeDetails6.settled == true)

      assert(stakeDetails7.cancelled == true)
      assert(stakeDetails7.active == false)
      assert(stakeDetails7.matured == false)
      assert(stakeDetails7.settled == true)

      const afterBalance5 = await token.balanceOf(accounts[5])
      const afterBalance1 = await token.balanceOf(accounts[1])
      const afterBalance2 = await token.balanceOf(accounts[2])

      console.log("*********************************************************")
      console.log("Balance after cancelling the Stake and settling : ", afterBalance5.toNumber())
      console.log("Balance after cancelling the Stake and settling : ", afterBalance1.toNumber())
      console.log("Balance after cancelling the Stake and settling : ", afterBalance2.toNumber())
   })

   it("Should allow user to cancel the stake if there is not enough balance in the contract", async () => {
      const accounts = await web3.eth.getAccounts()
      const stakeID4 = 4
      const stakeID8 = 8
      const stakeID10 = 10
      await staked.ClaimToInvest()
      const beforeBalance4 = await token.balanceOf(accounts[4])
      const beforeBalance3 = await token.balanceOf(accounts[3])
      const beforeBalance5 = await token.balanceOf(accounts[5])

      console.log("Balance before cancelling the stake : ", beforeBalance4.toNumber())
      console.log("Balance before cancelling the stake : ", beforeBalance3.toNumber())
      console.log("Balance before cancelling the stake : ", beforeBalance5.toNumber())

      await staked.cancelStake(stakeID4, { from: accounts[4] })
      await staked.cancelStake(stakeID8, { from: accounts[3] })
      await staked.cancelStake(stakeID10, { from: accounts[5] })

      const stakeDetails4 = await staked.getStakeDetailsByStakeID(stakeID4)
      const stakeDetails8 = await staked.getStakeDetailsByStakeID(stakeID8)
      const stakeDetails10 = await staked.getStakeDetailsByStakeID(stakeID10)

      assert(stakeDetails4.cancelled == true)
      assert(stakeDetails4.active == false)
      assert(stakeDetails4.matured == false)
      assert(stakeDetails4.settled == false)

      assert(stakeDetails8.cancelled == true)
      assert(stakeDetails8.active == false)
      assert(stakeDetails8.matured == false)
      assert(stakeDetails8.settled == false)

      assert(stakeDetails10.cancelled == true)
      assert(stakeDetails10.active == false)
      assert(stakeDetails10.matured == false)
      assert(stakeDetails10.settled == false)

      const afterBalance4 = await token.balanceOf(accounts[4])
      const afterBalance3 = await token.balanceOf(accounts[3])
      const afterBalance5 = await token.balanceOf(accounts[5])

      console.log("*********************************************************")
      console.log("Balance after cancelling the stake and not settling : ", afterBalance4.toNumber())
      console.log("Balance after cancelling the stake and not settling : ", afterBalance3.toNumber())
      console.log("Balance after cancelling the stake and not settling : ", afterBalance5.toNumber())

   })

   it("Should allow the user to claim their cancelled stake which is not settled", async () => {
      const accounts = await web3.eth.getAccounts()
      const stakeID8 = 8
      await token.transfer(staked.address, 1000000)
      const beforeBalance3 = await token.balanceOf(accounts[3])
      console.log("Balance before user claims the stake : ", beforeBalance3.toNumber())
      await staked.claimMyStake(stakeID8, { from: accounts[3] })
      const stakeDetails8 = await staked.getStakeDetailsByStakeID(stakeID8)
      assert(stakeDetails8.cancelled == true)
      assert(stakeDetails8.settled == true)

      const afterBalance3 = await token.balanceOf(accounts[3])
      console.log("*********************************************************")
      console.log("Balance after user claims the stake and the stake unsettled : ", afterBalance3.toNumber())
   })

   it("Should allow the user to claim their matured stakes. If not enough balance stakes will be matured and will be settled by the owner.", async () => {
      const accounts = await web3.eth.getAccounts()
      const stakeID1 = 1
      const stakeID2 = 2

      await staked.ClaimToInvest()
      //await token.transfer(staked.address,1000000)
      const beforeBalance1 = await token.balanceOf(accounts[1])
      const beforeBalance2 = await token.balanceOf(accounts[2])
      console.log("Balance before user claims the matured Stake : ", beforeBalance1.toNumber())
      console.log("Balance before user claims the matured Stake : ", beforeBalance2.toNumber())

      sleep(130000)
      await staked.claimMyStake(stakeID1, { from: accounts[1] })
      await staked.claimMyStake(stakeID2, { from: accounts[2] })

      const stakeDetails1 = await staked.getStakeDetailsByStakeID(stakeID1)
      const stakeDetails2 = await staked.getStakeDetailsByStakeID(stakeID2)

      console.log(stakeDetails1.settlementAmount)
      console.log(stakeDetails1.stakeReturns)

      assert(stakeDetails1.matured == true)
      assert(stakeDetails1.settled == false)

      assert(stakeDetails2.matured == true)
      assert(stakeDetails2.settled == false)

      const afterBalance1 = await token.balanceOf(accounts[1])
      const afterBalance2 = await token.balanceOf(accounts[2])
      console.log("*********************************************************")
      console.log("Balance after user claims the matured Stake and unsettled : ", afterBalance1.toNumber())
      console.log("Balance after user claims the matured Stake and unsettled: ", afterBalance2.toNumber())
   })

   it("Should allow the user to claim their matured stake and settle if there is enough balance in the contract", async () => {
      const accounts = await web3.eth.getAccounts()
      const stakeID3 = 3
      const stakeID9 = 9
      await staked.ClaimToInvest()
      await token.transfer(staked.address, 1000000)

      const beforeBalance3 = await token.balanceOf(accounts[3])
      const beforeBalance4 = await token.balanceOf(accounts[4])
      console.log("Balance before user claims the matured Stake : ", beforeBalance3.toNumber())
      console.log("Balance before user claims the matured Stake : ", beforeBalance4.toNumber())

      sleep(190000)
      await staked.claimMyStake(stakeID3, { from: accounts[3] })
      await staked.claimMyStake(stakeID9, { from: accounts[4] })

      const stakeDetails3 = await staked.getStakeDetailsByStakeID(stakeID3)
      const stakeDetails9 = await staked.getStakeDetailsByStakeID(stakeID9)

      assert(stakeDetails3.matured == true)
      assert(stakeDetails3.settled == true)

      assert(stakeDetails9.matured == true)
      assert(stakeDetails9.settled == true)

      const afterBalance3 = await token.balanceOf(accounts[3])
      const afterBalance4 = await token.balanceOf(accounts[4])
      console.log("*********************************************************")
      console.log("Balance after user claims the matured Stake and settled : ", afterBalance3.toNumber())
      console.log("Balance after user claims the matured Stake and settled: ", afterBalance4.toNumber())

   })

   it("Should allow the owner to settle cancelled/maturedStakes Stakes", async () => {
      const stakeIDs = [1, 2, 4, 10]
      await token.transfer(staked.address, 1000000)
      await staked.settleStakes(stakeIDs)
      for (i = 0; i < stakeIDs.length; i++) {
         const stakeDetails = await staked.getStakeDetailsByStakeID(stakeIDs[i])
         assert(stakeDetails.settled == true)
      }
   })

});
