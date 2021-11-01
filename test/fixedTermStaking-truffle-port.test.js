const tokenTest = artifacts.require("lunaToken")
const stakingTest = artifacts.require("lunaFund")

function sleep(milliseconds) {
   const date = Date.now();
   let currentDate = null;
   do {
      currentDate = Date.now();
   } while (currentDate - date < milliseconds)
}

amount = 1000000000

const deploy = async () => {
   token = await tokenTest.deployed();
   staked = await stakingTest.deployed();
   const accounts = await web3.eth.getAccounts()
   const approveAmount = await token.totalSupply()
   token.approve(staked.address, approveAmount)
}

contract("Staking", (accounts) => {
   beforeEach(deploy);

   it("Should allow owner to Add a stakeType", async () => {
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

      assert(stakeType1.Type == 1)
      assert(stakeType1.term == 1)
      assert(stakeType1.percentageReturn == 5)
      assert(stakeType1.minAmount == 10000)
      assert(stakeType2.Type == 2)
      assert(stakeType2.term == 2)
      assert(stakeType2.percentageReturn == 10)
      assert(stakeType2.minAmount == 10000)
      assert(stakeType3.Type == 3)
      assert(stakeType3.term == 3)
      assert(stakeType3.percentageReturn == 15)
      assert(stakeType3.minAmount == 10000)

   })

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
      assert(stakeType.Type == 1)
      assert(stakeType.percentageReturn == 5)
      assert(stakeType.term == 1)
      assert(stakeType.minAmount == 10000)
      assert(stakeType.maxAmount == 100000)
   })

   it("Should allow owner to get StakeType details", async () => {
      const stakeTypeID = 1
      const stakeType = await staked.getStakeType(stakeTypeID)
      //assert stakeType
      assert(stakeType.Type == 1)
      assert(stakeType.percentageReturn == 5)
      assert(stakeType.term == 1)
      assert(stakeType.minAmount == 10000)
      assert(stakeType.maxAmount == 100000)
   })

   it("Should allow any user to stake LunaTokens", async () => {
      const accounts = await web3.eth.getAccounts()

      await token.approve(staked.address, 100000, { from: accounts[1] })
      await token.approve(staked.address, 100000, { from: accounts[2] })
      await token.approve(staked.address, 100000, { from: accounts[3] })
      await token.approve(staked.address, 100000, { from: accounts[4] })
      await token.approve(staked.address, 100000, { from: accounts[5] })

      await token.transfer(accounts[1], 100000)
      await token.transfer(accounts[2], 100000)
      await token.transfer(accounts[3], 100000)
      await token.transfer(accounts[4], 100000)
      await token.transfer(accounts[5], 100000)

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

      await staked.addStake(stakeAmount, StakeType1, { from: accounts[1] })
      await staked.addStake(stakeAmount, StakeType2, { from: accounts[2] })
      await staked.addStake(stakeAmount, StakeType3, { from: accounts[3] })
      await staked.addStake(stakeAmount, StakeType1, { from: accounts[4] })
      await staked.addStake(stakeAmount, StakeType2, { from: accounts[5] })
      await staked.addStake(stakeAmount, StakeType3, { from: accounts[1] })
      await staked.addStake(stakeAmount, StakeType1, { from: accounts[2] })
      await staked.addStake(stakeAmount, StakeType2, { from: accounts[3] })
      await staked.addStake(stakeAmount, StakeType3, { from: accounts[4] })
      await staked.addStake(stakeAmount, StakeType1, { from: accounts[5] })

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


      assert(stakeDetails1.lunaAmount == stakeAmount)
      assert(stakeDetails1.active == true)
      assert(stakeDetails1.cancelled == false)
      assert(stakeDetails1.matured == false)
      assert(stakeDetails1.settled == false)
      assert(stakeDetails1.ownerAddress == accounts[1])

      assert(stakeDetails2.lunaAmount == stakeAmount)
      assert(stakeDetails2.active == true)
      assert(stakeDetails2.cancelled == false)
      assert(stakeDetails2.matured == false)
      assert(stakeDetails2.settled == false)
      assert(stakeDetails2.ownerAddress == accounts[2])

      assert(stakeDetails3.lunaAmount == stakeAmount)
      assert(stakeDetails3.active == true)
      assert(stakeDetails3.cancelled == false)
      assert(stakeDetails3.matured == false)
      assert(stakeDetails3.settled == false)
      assert(stakeDetails3.ownerAddress == accounts[3])

      assert(stakeDetails4.lunaAmount == stakeAmount)
      assert(stakeDetails4.active == true)
      assert(stakeDetails4.cancelled == false)
      assert(stakeDetails4.matured == false)
      assert(stakeDetails4.settled == false)
      assert(stakeDetails4.ownerAddress == accounts[4])

      assert(stakeDetails5.lunaAmount == stakeAmount)
      assert(stakeDetails5.active == true)
      assert(stakeDetails5.cancelled == false)
      assert(stakeDetails5.matured == false)
      assert(stakeDetails5.settled == false)
      assert(stakeDetails5.ownerAddress == accounts[5])

      assert(stakeDetails6.lunaAmount == stakeAmount)
      assert(stakeDetails6.active == true)
      assert(stakeDetails6.cancelled == false)
      assert(stakeDetails6.matured == false)
      assert(stakeDetails6.settled == false)
      assert(stakeDetails6.ownerAddress == accounts[1])

      assert(stakeDetails7.lunaAmount == stakeAmount)
      assert(stakeDetails7.active == true)
      assert(stakeDetails7.cancelled == false)
      assert(stakeDetails7.matured == false)
      assert(stakeDetails7.settled == false)
      assert(stakeDetails7.ownerAddress == accounts[2])

      assert(stakeDetails8.lunaAmount == stakeAmount)
      assert(stakeDetails8.active == true)
      assert(stakeDetails8.cancelled == false)
      assert(stakeDetails8.matured == false)
      assert(stakeDetails8.settled == false)
      assert(stakeDetails8.ownerAddress == accounts[3])

      assert(stakeDetails9.lunaAmount == stakeAmount)
      assert(stakeDetails9.active == true)
      assert(stakeDetails9.cancelled == false)
      assert(stakeDetails9.matured == false)
      assert(stakeDetails9.settled == false)
      assert(stakeDetails9.ownerAddress == accounts[4])

      assert(stakeDetails10.lunaAmount == stakeAmount)
      assert(stakeDetails10.active == true)
      assert(stakeDetails10.cancelled == false)
      assert(stakeDetails10.matured == false)
      assert(stakeDetails10.settled == false)
      assert(stakeDetails10.ownerAddress == accounts[5])
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

})
