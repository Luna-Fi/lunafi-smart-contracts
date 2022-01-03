const { expect } = require("chai");


describe("USDC HousePool", () => {
   
    let MOCKUSDC
    let USDCCLAIMTOKEN
    let USDCHOUSEPOOL 
    let usdcHousePool
    let usdcClaimToken
    let mockUSDC

    before(async () => {
        
        const approvalAmount = 1000000 * 10**8
        const [owner,user1] = await ethers.getSigners()

        MOCKUSDC = await ethers.getContractFactory("mockUSDCToken")
        mockUSDC = await MOCKUSDC.deploy()
        await mockUSDC.deployed()
        console.log(" Mock USDC Token Address  : ", mockUSDC.address)
        
        USDCCLAIMTOKEN = await ethers.getContractFactory("USDCclaimToken")
        usdcClaimToken = await USDCCLAIMTOKEN.deploy()
        await usdcClaimToken.deployed()
        console.log(" USDC Claim Token Address : ", usdcClaimToken.address)

        USDCHOUSEPOOL = await ethers.getContractFactory("HousePoolUSDC")
        usdcHousePool = await USDCHOUSEPOOL.deploy(owner.address,mockUSDC.address,usdcClaimToken.address, "","")
        await usdcHousePool.deployed()
        console.log(" USDC House Pool  Address  : ", usdcHousePool.address)

        await mockUSDC.approve(usdcHousePool.address, approvalAmount)
        await usdcClaimToken.approve(usdcHousePool.address,approvalAmount)
        await usdcClaimToken.addAdmin(usdcHousePool.address)

        await mockUSDC.connect(user1).approve(usdcHousePool.address, approvalAmount)
        await usdcClaimToken.connect(user1).approve(usdcHousePool.address,approvalAmount)
        await mockUSDC.transfer(user1.address,100000*10**6)
    })

    it(`Should allow the first user to deposit USDC Tokens into the house pool and get pool Tokens
         with the initial token price 100`, async () => {

        const [owner] = await ethers.getSigners()
        const amount = 5000 * 10**6
        let cTokenPrice = 100 * 10**6
        let cTokenWithdrawPrice = 100 * 10**6
        
        await usdcHousePool.deposit(amount)

        const liquidity = await usdcHousePool.getLiquidityStatus()
        const tvlOfPool = await usdcHousePool.getTVLofPool()
        const claimTokensIssued = await usdcClaimToken.totalSupply()
        const claimTokenPrice = await usdcHousePool.getTokenPrice()
        const claimTokenWithdrawlPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const evValue = await usdcHousePool.getEV()
        const bettingStakes = await usdcHousePool.getBettingStakes()
        const treasuryAmount = await usdcHousePool.getTreasuryAmount()

        expect(liquidity.toNumber()).to.equal(amount)
        expect(tvlOfPool.toNumber()).to.equal(amount)
        expect(claimTokenPrice.toNumber()).to.equal(claimTokenPrice)
        expect(claimTokenWithdrawlPrice.toNumber()).to.equal(claimTokenWithdrawlPrice)   
        expect(claimTokensIssued.toNumber()).to.equal(amount * 10**6/ (claimTokenPrice))
        
        console.log("***********************************************************************************************")
        console.log("******************************* Initial Test case Values **************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited         : ", amount/10**6)
        console.log("Liquidity                : ", liquidity.toNumber()/10**6)
        console.log("TVL of Pool              : ", tvlOfPool.toNumber()/10**6)
        console.log("EV value                 : ", evValue.toNumber()/10**6)
        console.log("Betting Stakes           : ", bettingStakes.toNumber()/10**6)
        console.log("ClaimTokens Issued       : ", claimTokensIssued.toNumber()/10**6)
        console.log("LP Tokens Issued at rate : ", claimTokenPrice.toNumber()/10**6)
        console.log("LP Token withdraw rate   : ", claimTokenWithdrawlPrice.toNumber()/10**6)
        console.log("Treasury Amount          : ", treasuryAmount.toNumber()/10**6)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")
      
    })

    it(`Should change the TVL value when EV value is added to the HousePool. 
        It should also change the token price`, async () => {

        const [owner] = await ethers.getSigners()
        const evValue = 15 * 10**6;
        const bet = 500 * 10**6
        const DataProviderValue = await usdcHousePool.DATA_PROVIDER_ORACLE()
        
        await usdcHousePool.grantRole(DataProviderValue,owner.address)
        await usdcHousePool.grantRole(usdcHousePool.HOUSE_POOL_DATA_PROVIDER(),owner.address)
        await usdcHousePool.setBettingStakes(bet)

        const _chain = await ethers.provider.getNetwork();
        const _deadline = (await ethers.provider.getBlockNumber()) + 4;

        const _signature = await owner._signTypedData(
            {
                name: "",
                version: "",
                chainId: _chain.chainId,
                verifyingContract: usdcHousePool.address,
            },
            {
                VoI: [
                    { name: "signer", type: "address" },
                    { name: "value", type: "int256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" }
                ],
            },
            {
                signer: owner.address,
                value: evValue,
                nonce: 0,
                deadline: _deadline
            }
        );
        await usdcHousePool.setEVFromSignedData(
            _signature,
            {
                value: evValue,
                deadline: _deadline,
                signer: owner.address
            });

        const tvlOfPool = await usdcHousePool.getTVLofPool()
        const liquidity = await usdcHousePool.getLiquidityStatus()
        const claimTokenPrice = await usdcHousePool.getTokenPrice()
        const claimTokensIssued = await usdcClaimToken.totalSupply()
        const eVValue = await usdcHousePool.getEV()
        const claimTokenWithdrawlPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const bettingStakes = await usdcHousePool.getBettingStakes()
        const treasuryAmount = await usdcHousePool.getTreasuryAmount()
        
        const TVPNumber = tvlOfPool.toNumber()
        const LPTotalNumber = claimTokensIssued.toNumber()
        
        const res = TVPNumber/LPTotalNumber;
        
        expect(tvlOfPool.toNumber()).to.equal(liquidity.toNumber() + evValue)
        expect(claimTokenPrice.toNumber()).to.equal(res*10**6)

        console.log("***********************************************************************************************")
        console.log("***********************Test case For EV Value *************************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited          : ", 0)
        console.log("Liquidity                 : ", liquidity.toNumber()/10**6)
        console.log("TVL of Pool               : ", tvlOfPool.toNumber()/10**6)
        console.log("EV value                  : ", eVValue.toNumber()/10**6) 
        console.log("Betting Stakes            : ", bettingStakes.toNumber()/10**6)
        console.log("claimTokens Issued :      : ", claimTokensIssued.toNumber()/10**6) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice.toNumber()/10**6)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice.toNumber()/10**6)
        console.log("Treasury Amount           : ", treasuryAmount.toNumber()/10**6)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")
 
        
    })

    it(`Should change allow any user to deposit into USDC Pool and get back LP tokens
        with the current LPToken Price`, async () => {
        
        const [owner,user1] = await ethers.getSigners();
        const amount = 10000 * 10**6
        
        const currentLPTokenPrice = await usdcHousePool.getTokenPrice()
        const currentLPTokenWithdrawlPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const currentTVLOfValue = await usdcHousePool.getTVLofPool()
        const currentLiquidity = await usdcHousePool.getLiquidityStatus()
        const currentClaimTokens = await usdcClaimToken.totalSupply()
        const currentBalanceOfUser = await usdcClaimToken.balanceOf(user1.address)
       
        
        await usdcHousePool.connect(user1).deposit(amount)

        const tvlOfPool = await usdcHousePool.getTVLofPool()
        const liquidity = await usdcHousePool.getLiquidityStatus()
        const claimTokensIssued = await usdcClaimToken.totalSupply()
        const claimTokenPrice = await usdcHousePool.getTokenPrice()
        const claimTokenWithdrawlPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const evValue = await usdcHousePool.getEV()
        const bettingStakes = await usdcHousePool.getBettingStakes()
        const treasuryAmount = await usdcHousePool.getTreasuryAmount()

        expect(tvlOfPool.toNumber()).to.equal(amount + currentTVLOfValue.toNumber())
        expect(liquidity.toNumber()).to.equal(currentLiquidity.toNumber() + amount);
        expect(claimTokenPrice.toNumber()).to.equal(Math.floor(tvlOfPool.toNumber()/claimTokensIssued.toNumber()*10**6))
        expect(claimTokenWithdrawlPrice.toNumber()).to.equal(Math.floor(liquidity.toNumber()/claimTokensIssued.toNumber()*10**6))

        console.log("***********************************************************************************************")
        console.log("***********************Test case first user Deposit *******************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited          : ", amount/10**6)
        console.log("Liquidity                 : ", liquidity.toNumber()/10**6)
        console.log("TVL of Pool               : ", tvlOfPool.toNumber()/10**6)
        console.log("EV value                  : ", evValue.toNumber()/10**6) 
        console.log("Betting Stakes            : ", bettingStakes.toNumber()/10**6)
        console.log("claimTokens Issued :      : ", claimTokensIssued.toNumber()/10**6) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice.toNumber()/10**6)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice.toNumber()/10**6)
        console.log("Treasury Amount           : ", treasuryAmount.toNumber()/10**6)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")
 
 
    })

    it(`Should update the ev value`, async () => {

        const [owner] = await ethers.getSigners()
        const evValue = 490 * 10**6;
        const DataProviderValue = await usdcHousePool.DATA_PROVIDER_ORACLE()
        await usdcHousePool.grantRole(DataProviderValue,owner.address)
        await usdcHousePool.grantRole(usdcHousePool.HOUSE_POOL_DATA_PROVIDER(),owner.address)
        

        const _chain = await ethers.provider.getNetwork();
        const _deadline = (await ethers.provider.getBlockNumber()) + 4;

        const _signature = await owner._signTypedData(
            {
                name: "",
                version: "",
                chainId: _chain.chainId,
                verifyingContract: usdcHousePool.address,
            },
            {
                VoI: [
                    { name: "signer", type: "address" },
                    { name: "value", type: "int256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" }
                ],
            },
            {
                signer: owner.address,
                value: evValue,
                nonce: 1,
                deadline: _deadline
            }
        );
        await usdcHousePool.setEVFromSignedData(
            _signature,
            {
                value: evValue,
                deadline: _deadline,
                signer: owner.address
            });

        const tvlOfPool = await usdcHousePool.getTVLofPool()
        const liquidity = await usdcHousePool.getLiquidityStatus()
        const claimTokenPrice = await usdcHousePool.getTokenPrice()
        const claimTokensIssued = await usdcClaimToken.totalSupply()
        const eVValue = await usdcHousePool.getEV()
        const claimTokenWithdrawlPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const bettingStakes = await usdcHousePool.getBettingStakes()
        const treasuryAmount = await usdcHousePool.getTreasuryAmount()

        expect(tvlOfPool.toNumber()).to.equal(liquidity.toNumber() + evValue)
        expect(claimTokenPrice.toNumber()).to.equal(Math.floor(tvlOfPool.toNumber()/claimTokensIssued.toNumber()*10**6))


        console.log("***********************************************************************************************")
        console.log("***********************Test case for ev updation **********************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited          : ", 0)
        console.log("Liquidity                 : ", liquidity.toNumber()/10**6)
        console.log("TVL of Pool               : ", tvlOfPool.toNumber()/10**6)
        console.log("EV value                  : ", eVValue.toNumber()/10**6) 
        console.log("Betting Stakes            : ", bettingStakes.toNumber()/10**6)
        console.log("claimTokens Issued :      : ", claimTokensIssued.toNumber()/10**6) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice.toNumber()/10**6)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice.toNumber()/10**6)
        console.log("Treasury Amount           : ", treasuryAmount.toNumber()/10**6)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")

    })

    it(`Should  update treasury based on the betting outcome`, async () => {
        
        const bettingAmount = 1000 * 10**6;
        const outcome = false;
        const betAmount = 500 * 10**6

        const pastLiquidity = await usdcHousePool.getLiquidityStatus()

        await usdcHousePool.setBettingStakes(bettingAmount)
        
        await usdcHousePool.simulateOutcome(outcome,betAmount)

        const treasuryAmount = await usdcHousePool.getTreasuryAmount()
        const liquidity = await usdcHousePool.getLiquidityStatus()
        const tvlOfPool = await usdcHousePool.getTVLofPool()
        const eVValue = await usdcHousePool.getEV()
        const claimTokenPrice = await usdcHousePool.getTokenPrice()
        const claimTokensIssued = await usdcClaimToken.totalSupply()
        const claimTokenWithdrawlPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const bettingStakes = await usdcHousePool.getBettingStakes()


        expect(treasuryAmount.toNumber()).to.equal((betAmount/100))
        expect(liquidity.toNumber()).to.equal((pastLiquidity.toNumber()) + ((betAmount/100) * 99))

        console.log("***********************************************************************************************")
        console.log("***********************Test case for betting outcome ******************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited          : ", 0)
        console.log("Liquidity                 : ", liquidity.toNumber()/10**6)
        console.log("TVL of Pool               : ", tvlOfPool.toNumber()/10**6)
        console.log("EV value                  : ", eVValue.toNumber()/10**6) 
        console.log("Betting Stakes            : ", bettingStakes.toNumber()/10**6)
        console.log("claimTokens Issued :      : ", claimTokensIssued.toNumber()/10**6) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice.toNumber()/10**6)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice.toNumber()/10**6)
        console.log("Treasury Amount           : ", treasuryAmount.toNumber()/10**6)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")

    })

    it(`Should allow the user to withdraw the USDC from the house pool.
        This Should Burn the proportionate LP tokens`, async () => {
        
        const [owner,user1] = await ethers.getSigners();
        const withdrawAmount = 5000 * 10**6

        const beforeLiquidity = await usdcHousePool.getLiquidityStatus()
        const WithdrawPrice = await usdcHousePool.getTokenPrice()
        const beforeLPWPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const beforeTVLPrice = await usdcHousePool.getTVLofPool()

        await usdcHousePool.connect(user1).withdraw(withdrawAmount);

        
        const TokenPriceafterWithdrawPrice = await usdcHousePool.getTokenPrice()
        const afterLPWPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const afterTVLPrice = await usdcHousePool.getTVLofPool()
        const claimTokens = await usdcClaimToken.totalSupply()

        const treasuryAmount = await usdcHousePool.getTreasuryAmount()
        const liquidity = await usdcHousePool.getLiquidityStatus()
        const tvlOfPool = await usdcHousePool.getTVLofPool()
        const eVValue = await usdcHousePool.getEV()
        const claimTokenPrice = await usdcHousePool.getTokenPrice()
        const claimTokensIssued = await usdcClaimToken.totalSupply()
        const claimTokenWithdrawlPrice = await usdcHousePool.getTokenWithdrawlPrice()
        const bettingStakes = await usdcHousePool.getBettingStakes()

        expect(liquidity.toNumber()).to.equal(beforeLiquidity.toNumber() - withdrawAmount);
        expect(claimTokenPrice.toNumber()).to.equal(Math.floor(tvlOfPool.toNumber()/claimTokensIssued.toNumber()*10**6))
        expect(claimTokenWithdrawlPrice.toNumber()).to.equal(Math.floor(liquidity.toNumber()/claimTokensIssued.toNumber()*10**6))

        console.log("***********************************************************************************************")
        console.log("***********************Test case for withdraw *************************************************")
        console.log("***********************************************************************************************")

        console.log("Amount withdrawn          : ", withdrawAmount/10**6)
        console.log("Liquidity                 : ", liquidity.toNumber()/10**6)
        console.log("TVL of Pool               : ", tvlOfPool.toNumber()/10**6)
        console.log("EV value                  : ", eVValue.toNumber()/10**6) 
        console.log("Betting Stakes            : ", bettingStakes.toNumber()/10**6)
        console.log("claimTokens Issued :      : ", claimTokensIssued.toNumber()/10**6) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice.toNumber()/10**6)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice.toNumber()/10**6)
        console.log("Treasury Amount           : ", treasuryAmount.toNumber()/10**6)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")

    })

})