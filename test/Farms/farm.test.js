const { expect } = require("chai");
const { BigNumber } = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

describe("LFI Farms", async() => {
    
    let MockUSDCToken; let MockWBTCToken ; let MockWETHToken;
    let UsdcClaimToken; let WbtcClaimToken; let WethClaimToken;
    let UsdcHosePool; let WbtcHousePool; let WethHousePool;
    let LFIToken; let Farm; let Fund; 

    let mockUSDCToken; let mockWBTCToken; let mockWETHToken;
    let usdcClaimToken; let wbtcClaimToken; let wethClaimToken;
    let usdcHousePool; let wbtcHousePool; let wethHousePool;
    let lfiToken; let farm; let fund; 

    before(async () => {
        const [owner, user1, user2, user3] = await ethers.getSigners()
        const approvalAmount = ethers.utils.formatUnits(returnBigNumber(10000000 * 10**18),0)
        const rewardTokensPerSecond = ethers.utils.formatUnits(returnBigNumber(10 * 10**18),0)

        
    })
})