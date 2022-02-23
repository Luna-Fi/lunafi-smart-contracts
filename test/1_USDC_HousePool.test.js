const { expect } = require("chai");
const { BigNumber} = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}


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
        usdcHousePool = await upgrades.deployProxy(USDCHOUSEPOOL,[owner.address,mockUSDC.address,usdcClaimToken.address,"",""],{initializer: 'initialize'});
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
        let cTokenPrice = 100 * 10**18
        let cTokenWithdrawPrice = 100 * 10**18

        await usdcHousePool.connect(owner).grantRole(usdcHousePool.DATA_PROVIDER_ORACLE(), owner.address);
        await usdcHousePool.connect(owner).grantRole(usdcHousePool.HOUSE_POOL_DATA_PROVIDER(), owner.address);
        const _evValue = 0;
        const _meValue = 0;
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
                    { name: "expectedValue", type: "int256" },
                    { name: "maxExposure", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" }
                ],
            },
            {
                signer: owner.address,
                expectedValue: _evValue,
                maxExposure: _meValue,
                nonce: 0,
                deadline: _deadline
            }
        );
        
        await usdcHousePool.deposit(
            amount,
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                signer: owner.address
            })

        const liquidity = ethers.utils.formatUnits(await usdcHousePool.getLiquidityStatus(),0)
        const tvlOfPool = ethers.utils.formatUnits(await usdcHousePool.getTVLofPool(),0)
        const claimTokensIssued = ethers.utils.formatUnits(await usdcClaimToken.totalSupply(),0)
        const claimTokenPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenPrice(),0)
        const claimTokenWithdrawlPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenWithdrawlPrice(),0)
        const evValue = ethers.utils.formatUnits(await usdcHousePool.getEV(),0)
        const bettingStakes = ethers.utils.formatUnits(await usdcHousePool.getBettingStakes(),0)
        const treasuryAmount = ethers.utils.formatUnits(await usdcHousePool.getTreasuryAmount(),0)

        const amountInhexString = (amount*10**12).toString(16)
        const amountinBigNumber = returnBigNumber(amountInhexString)

        const hTokenPrice = (cTokenPrice).toString(16)
        const tokenPriceBigNumber = returnBigNumber(hTokenPrice)

        const hTokenWithdrawPrice = (cTokenWithdrawPrice).toString(16)
        const tokenWPriceBigNumber = returnBigNumber(hTokenWithdrawPrice)
        
       
        console.log("***********************************************************************************************")
        console.log("******************************* Initial Test case Values **************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited         : ", amount/10**6)
        console.log("Liquidity                : ", liquidity/10**18)
        console.log("TVL of Pool              : ", tvlOfPool/10**18)
        console.log("EV value                 : ", evValue/10**18)
        console.log("Betting Stakes           : ", bettingStakes/10**18)
        console.log("ClaimTokens Issued       : ", claimTokensIssued/10**18)
        console.log("LP Tokens Issued at rate : ", claimTokenPrice/10**18)
        console.log("LP Token withdraw rate   : ", claimTokenWithdrawlPrice/10**18)
        console.log("Treasury Amount          : ", treasuryAmount/10**18)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")


        expect(liquidity).to.equal(ethers.utils.formatUnits(amountinBigNumber,0))
        expect(tvlOfPool).to.equal(ethers.utils.formatUnits(amountinBigNumber,0))
        expect(claimTokenPrice).to.equal(ethers.utils.formatUnits(tokenPriceBigNumber,0))
        expect(claimTokenWithdrawlPrice).to.equal(ethers.utils.formatUnits(tokenWPriceBigNumber,0)) 
        expect(claimTokensIssued/10**18).to.equal((ethers.utils.formatUnits(amountinBigNumber,0) / claimTokenPrice))
      
    })

    it(`Should change the TVL value when EV value is added to the HousePool. 
        It should also change the token price`, async () => {

        const [owner] = await ethers.getSigners()
        const eVValue = returnBigNumber(15 * 10**18)
        const meValue = 0;
        const bet = returnBigNumber(500 * 10**18)
        const DataProviderValue = await usdcHousePool.DATA_PROVIDER_ORACLE()

        await usdcHousePool.grantRole(DataProviderValue,owner.address)
        await usdcHousePool.grantRole(usdcHousePool.HOUSE_POOL_DATA_PROVIDER(),owner.address)
        await usdcHousePool.setBettingStakes(ethers.utils.formatUnits(bet,0)) 

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
                    { name: "expectedValue", type: "int256" },
                    { name: "maxExposure", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" }
                ],
            },
            {
                signer: owner.address,
                expectedValue: ethers.utils.formatUnits(eVValue,0),
                maxExposure: meValue,
                nonce: 0,
                deadline: _deadline
            }
        );
        await usdcHousePool.setVOI(
            _signature,
            {
                expectedValue: ethers.utils.formatUnits(eVValue,0),
                maxExposure: meValue,
                deadline: _deadline,
                signer: owner.address
            });

        const liquidity = ethers.utils.formatUnits(await usdcHousePool.getLiquidityStatus(),0)
        const tvlOfPool = ethers.utils.formatUnits(await usdcHousePool.getTVLofPool(),0)
        const claimTokensIssued = ethers.utils.formatUnits(await usdcClaimToken.totalSupply(),0)
        const claimTokenPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenPrice(),0)
        const claimTokenWithdrawlPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenWithdrawlPrice(),0)
        const evValue = ethers.utils.formatUnits(await usdcHousePool.getEV(),0)
        const bettingStakes = ethers.utils.formatUnits(await usdcHousePool.getBettingStakes(),0)
        const treasuryAmount = ethers.utils.formatUnits(await usdcHousePool.getTreasuryAmount(),0)
        
        const TV = tvlOfPool/10**18
        const CT = claimTokensIssued/10**18

        console.log("***********************************************************************************************")
        console.log("***********************Test case For EV Value *************************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited          : ", 0)
        console.log("Liquidity                 : ", liquidity/10**18)
        console.log("TVL of Pool               : ", tvlOfPool/10**18)
        console.log("EV value                  : ", evValue/10**18) 
        console.log("Betting Stakes            : ", bettingStakes/10**18)
        console.log("claimTokens Issued :      : ", claimTokensIssued/10**18) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice/10**18)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice/10**18)
        console.log("Treasury Amount           : ", treasuryAmount/10**18)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")

        expect(tvlOfPool/10**18).to.equal(liquidity/10**18 + evValue/10**18)
        expect(claimTokenPrice/10**18).to.equal(TV/CT)
        
    })

    it(`Should change allow any user to deposit into USDC Pool and get back LP tokens
        with the current LPToken Price`, async () => {
        
        const [owner,user1] = await ethers.getSigners();
        const amount = 10000 * 10**6

        const currentLiquidity = await usdcHousePool.getLiquidityStatus()
        const currenttvlOfPool = ethers.utils.formatUnits(await usdcHousePool.getTVLofPool(),0)

        
        await usdcHousePool.connect(owner).grantRole(usdcHousePool.DATA_PROVIDER_ORACLE(), owner.address);
        const _evValue = 0;
        const _meValue = 0;
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
                    { name: "expectedValue", type: "int256" },
                    { name: "maxExposure", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" }
                ],
            },
            {
                signer: owner.address,
                expectedValue: _evValue,
                maxExposure: _meValue,
                nonce: 0,
                deadline: _deadline
            }
        );
        
        await usdcHousePool.connect(user1).deposit(
            amount,
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                signer: owner.address
            });

        const liquidity = ethers.utils.formatUnits(await usdcHousePool.getLiquidityStatus(),0)
        const tvlOfPool = ethers.utils.formatUnits(await usdcHousePool.getTVLofPool(),0)
        const claimTokensIssued = ethers.utils.formatUnits(await usdcClaimToken.totalSupply(),0)
        const claimTokenPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenPrice(),0)
        const claimTokenWithdrawlPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenWithdrawlPrice(),0)
        const evValue = ethers.utils.formatUnits(await usdcHousePool.getEV(),0)
        const bettingStakes = ethers.utils.formatUnits(await usdcHousePool.getBettingStakes(),0)
        const treasuryAmount = ethers.utils.formatUnits(await usdcHousePool.getTreasuryAmount(),0)
        
     
        

        console.log("***********************************************************************************************")
        console.log("***********************Test case first user Deposit *******************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited          : ", amount/10**6)
        console.log("Liquidity                 : ", liquidity/10**18)
        console.log("TVL of Pool               : ", tvlOfPool/10**18)
        console.log("EV value                  : ", evValue/10**18) 
        console.log("Betting Stakes            : ", bettingStakes/10**18)
        console.log("claimTokens Issued :      : ", claimTokensIssued/10**18) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice/10**18)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice/10**18)
        console.log("Treasury Amount           : ", treasuryAmount/10**18)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")


        expect(tvlOfPool/10**18).to.equal(liquidity/10**18)
        expect(liquidity/10**18).to.equal(currentLiquidity/10**18 + amount/10**6)
        expect(claimTokenPrice/10**18).to.equal((tvlOfPool/10**18) / (claimTokensIssued/10**18))
        expect(claimTokenWithdrawlPrice/10**18).to.equal((liquidity/10**18)/(claimTokensIssued/10**18))
 
 
    })

    it(`Should update the ev value`, async () => {

        const [owner] = await ethers.getSigners()
        const eVValue = returnBigNumber(490 * 10**18)
        const meValue = 0;
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
                    { name: "expectedValue", type: "int256" },
                    { name: "maxExposure", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" }
                ],
            },
            {
                signer: owner.address,
                expectedValue:  ethers.utils.formatUnits(eVValue,0),
                maxExposure: meValue,
                nonce: 0,
                deadline: _deadline
            }
        );
        await usdcHousePool.setVOI(
            _signature,
            {
                expectedValue:  ethers.utils.formatUnits(eVValue,0),
                maxExposure: meValue,
                deadline: _deadline,
                signer: owner.address
            });

        const liquidity = ethers.utils.formatUnits(await usdcHousePool.getLiquidityStatus(),0)
        const tvlOfPool = ethers.utils.formatUnits(await usdcHousePool.getTVLofPool(),0)
        const claimTokensIssued = ethers.utils.formatUnits(await usdcClaimToken.totalSupply(),0)
        const claimTokenPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenPrice(),0)
        const claimTokenWithdrawlPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenWithdrawlPrice(),0)
        const evValue = ethers.utils.formatUnits(await usdcHousePool.getEV(),0)
        const bettingStakes = ethers.utils.formatUnits(await usdcHousePool.getBettingStakes(),0)
        const treasuryAmount = ethers.utils.formatUnits(await usdcHousePool.getTreasuryAmount(),0)

        expect(tvlOfPool/10**18).to.equal(liquidity/10**18 + evValue/10**18)
        expect(claimTokenPrice/10**18).to.equal((tvlOfPool/10**18)/(claimTokensIssued/10**18))


        console.log("***********************************************************************************************")
        console.log("***********************Test case for ev updation **********************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited          : ", 0)
        console.log("Liquidity                 : ", liquidity/10**18)
        console.log("TVL of Pool               : ", tvlOfPool/10**18)
        console.log("EV value                  : ", eVValue/10**18) 
        console.log("Betting Stakes            : ", bettingStakes/10**18)
        console.log("claimTokens Issued :      : ", claimTokensIssued/10**18) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice/10**18)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice/10**18)
        console.log("Treasury Amount           : ", treasuryAmount/10**18)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")

    })

    it(`Should  update treasury based on the betting outcome`, async () => {
        
        
        const bettingAmount = returnBigNumber(1000 * 10**18)
        const outcome = false;
        const betAmount = returnBigNumber(500 * 10**18)

        const pastLiquidity = ethers.utils.formatUnits(await usdcHousePool.getLiquidityStatus(),0)

        await usdcHousePool.setBettingStakes(ethers.utils.formatUnits(bettingAmount,0))
        
        await usdcHousePool.simulateOutcome(outcome,ethers.utils.formatUnits(betAmount,0))

        const liquidity = ethers.utils.formatUnits(await usdcHousePool.getLiquidityStatus(),0)
        const tvlOfPool = ethers.utils.formatUnits(await usdcHousePool.getTVLofPool(),0)
        const claimTokensIssued = ethers.utils.formatUnits(await usdcClaimToken.totalSupply(),0)
        const claimTokenPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenPrice(),0)
        const claimTokenWithdrawlPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenWithdrawlPrice(),0)
        const evValue = ethers.utils.formatUnits(await usdcHousePool.getEV(),0)
        const bettingStakes = ethers.utils.formatUnits(await usdcHousePool.getBettingStakes(),0)
        const treasuryAmount = ethers.utils.formatUnits(await usdcHousePool.getTreasuryAmount(),0)

    
        const ta = treasuryAmount/10**18
        const ba = (ethers.utils.formatUnits(betAmount,0)/100)/10**18
        const lq = liquidity/10**18
        const plq = pastLiquidity/10**18
        const res = ( (ethers.utils.formatUnits(betAmount,0) / 100 *99 )) /10**18
    
        expect(ta).to.equal(ba)
        expect(lq).to.equal(plq + res) 

        console.log("***********************************************************************************************")
        console.log("***********************Test case for betting outcome ******************************************")
        console.log("***********************************************************************************************")

        console.log("Amount Deposited          : ", 0)
        console.log("Liquidity                 : ", liquidity/10**18)
        console.log("TVL of Pool               : ", tvlOfPool/10**18)
        console.log("EV value                  : ", evValue/10**18) 
        console.log("Betting Stakes            : ", bettingStakes/10**18)
        console.log("claimTokens Issued :      : ", claimTokensIssued/10**18) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice/10**18)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice/10**18)
        console.log("Treasury Amount           : ", treasuryAmount/10**18)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")

    })

    it(`Should allow the user to withdraw the USDC from the house pool.
        This Should Burn the proportionate LP tokens`, async () => {
        
        const [owner,user1] = await ethers.getSigners();
        const withdrawAmount = 5000 * 10**6

        const beforeLiquidity = ethers.utils.formatUnits(await usdcHousePool.getLiquidityStatus(),0)
        
        const eVValue = 0;
        const meValue = 0;
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
                    { name: "expectedValue", type: "int256" },
                    { name: "maxExposure", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" }
                ],
            },
            {
                signer: owner.address,
                expectedValue: eVValue,
                maxExposure: meValue,
                nonce: 0,
                deadline: _deadline
            }
        );
        
        await usdcHousePool.connect(user1).withdraw(
            withdrawAmount,
            _signature,
            {
                expectedValue: eVValue,
                maxExposure: meValue,
                deadline: _deadline,
                signer: owner.address
            });

    
        const liquidity = ethers.utils.formatUnits(await usdcHousePool.getLiquidityStatus(),0)
        const tvlOfPool = ethers.utils.formatUnits(await usdcHousePool.getTVLofPool(),0)
        const claimTokensIssued = ethers.utils.formatUnits(await usdcClaimToken.totalSupply(),0)
        const claimTokenPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenPrice(),0)
        const claimTokenWithdrawlPrice = ethers.utils.formatUnits(await usdcHousePool.getTokenWithdrawlPrice(),0)
        const evValue = ethers.utils.formatUnits(await usdcHousePool.getEV(),0)
        const bettingStakes = ethers.utils.formatUnits(await usdcHousePool.getBettingStakes(),0)
        const treasuryAmount = ethers.utils.formatUnits(await usdcHousePool.getTreasuryAmount(),0)

        expect(liquidity/10**18).to.equal((beforeLiquidity/10**18) - (withdrawAmount/10**6));

        console.log("***********************************************************************************************")
        console.log("***********************Test case for withdraw *************************************************")
        console.log("***********************************************************************************************")

        console.log("Amount withdrawn          : ", withdrawAmount/10**6)
        console.log("Liquidity                 : ", liquidity/10**18)
        console.log("TVL of Pool               : ", tvlOfPool/10**18)
        console.log("EV value                  : ", evValue/10**18) 
        console.log("Betting Stakes            : ", bettingStakes/10**18)
        console.log("claimTokens Issued :      : ", claimTokensIssued/10**18) 
        console.log("LP Token Issued at rate   : ", claimTokenPrice/10**18)
        console.log("LP Token Withdraw rate    : ", claimTokenWithdrawlPrice/10**18)
        console.log("Treasury Amount           : ", treasuryAmount/10**18)

        console.log("***********************************************************************************************")
        console.log("***********************************************************************************************")

    })

})