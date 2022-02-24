const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}


describe("WBTC HousePool", () => {

    let MOCKWBTC
    let WBTCCLAIMTOKEN
    let WBTCHOUSEPOOL
    let wbtcHousePool
    let wbtcClaimToken
    let mockWBTC

    let tokenAmount = 100000 * 10 ** 6
    before(async () => {

        const approvalAmount = 1000000 * 10 ** 8
        const [owner, user1, operator] = await ethers.getSigners()

        MOCKWBTC = await ethers.getContractFactory("mockWBTCToken")
        mockWBTC = await MOCKWBTC.deploy()
        await mockWBTC.deployed()
        console.log(" Mock WBTC Token Address  : ", mockWBTC.address)

        WBTCCLAIMTOKEN = await ethers.getContractFactory("WBTCclaimToken")
        wbtcClaimToken = await WBTCCLAIMTOKEN.deploy()
        await wbtcClaimToken.deployed()
        console.log(" WBTC Claim Token Address : ", wbtcClaimToken.address)

        WBTCHOUSEPOOL = await ethers.getContractFactory("HousePoolWBTC")
        // wbtcHousePool = await WBTCHOUSEPOOL.deploy(owner.address,mockWBTC.address,wbtcClaimToken.address, "","")
        wbtcHousePool = await upgrades.deployProxy(WBTCHOUSEPOOL, [owner.address, mockWBTC.address, wbtcClaimToken.address, "", ""], { initializer: 'initialize' });

        await wbtcHousePool.deployed()
        console.log(" WBTC House Pool  Address  : ", wbtcHousePool.address)

        await mockWBTC.approve(wbtcHousePool.address, approvalAmount)
        await wbtcClaimToken.approve(wbtcHousePool.address, approvalAmount)
        await wbtcClaimToken.addAdmin(wbtcHousePool.address)

        await mockWBTC.connect(user1).approve(wbtcHousePool.address, approvalAmount)
        await wbtcClaimToken.connect(user1).approve(wbtcHousePool.address, approvalAmount)
        await mockWBTC.transfer(user1.address, tokenAmount)

        await mockWBTC.connect(operator).approve(wbtcHousePool.address, approvalAmount)
        await mockWBTC.transfer(operator.address, tokenAmount)
    })

    it(`WBTC HOUSE POOL setVOI signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await wbtcHousePool.connect(owner).grantRole(wbtcHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await wbtcHousePool.connect(owner).grantRole(wbtcHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);

        const initialEV = await wbtcHousePool.getEV();
        console.log(`Initial EV value is: ${ethers.utils.formatEther(initialEV)}`);

        // Random value to set as EV -- random value between -500 to 500 ether
        const _evValue = ethers.utils.parseUnits(((Math.random() * 1000) - 500).toString(), 18);
        console.log(`Attempting update EV value to: ${ethers.utils.formatEther(_evValue, { pad: true })}`);
        // Random value to set as ME -- random value between 0 to 100 ether
        const _meValue = ethers.utils.parseUnits((Math.random() * 100).toString(), 18);
        console.log(`Attempting update ME value to: ${ethers.utils.formatEther(_meValue, { pad: true })}`);

        // Prepare deadline
        const _expiration = 4; // number of blocks
        const _initialHeight = await ethers.provider.getBlockNumber();
        console.log("Now at block number: ", _initialHeight);
        const _deadline = _initialHeight + _expiration;
        console.log("Deadline blocknumber: ", _deadline);

        // Prepare data
        const _chain = await ethers.provider.getNetwork();
        const _eip712Domain = {
            name: "",
            version: "",
            chainId: _chain.chainId,
            verifyingContract: wbtcHousePool.address,
        };
        const _eip712Types = {
            VoI: [
                { name: "signer", type: "address" },
                { name: "expectedValue", type: "int256" },
                { name: "maxExposure", type: "uint256" },
                { name: 'nonce', type: 'uint256' },
                { name: "deadline", type: "uint256" }
            ],
        };
        const _eip712Value = {
            signer: dataProvider.address,
            expectedValue: _evValue,
            maxExposure: _meValue,
            nonce: 0,
            deadline: _deadline
        };
        const _data = [_eip712Domain, _eip712Types, _eip712Value];

        const _signature = await dataProvider._signTypedData(..._data);

        await wbtcHousePool.connect(operator).setVOI(
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const updatedEV = await wbtcHousePool.getEV();
        expect(ethers.utils.formatEther(updatedEV)).to.not.equal(ethers.utils.formatEther(initialEV));
        expect(ethers.utils.formatEther(updatedEV)).to.equal(ethers.utils.formatEther(_evValue));
    })

    it(`WBTC HOUSE POOL deposit signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await wbtcHousePool.connect(owner).grantRole(wbtcHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await wbtcHousePool.connect(owner).grantRole(wbtcHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);

        const initialEV = await wbtcHousePool.getEV();
        console.log(`Initial EV value is: ${ethers.utils.formatEther(initialEV)}`);

        // Random value to set as EV -- random value between -500 to 500 ether
        const _evValue = ethers.utils.parseUnits(((Math.random() * 1000) - 500).toString(), 18);
        console.log(`Attempting update EV value to: ${ethers.utils.formatEther(_evValue, { pad: true })}`);
        // Random value to set as ME -- random value between 0 to 100 ether
        const _meValue = ethers.utils.parseUnits((Math.random() * 100).toString(), 18);
        console.log(`Attempting update ME value to: ${ethers.utils.formatEther(_meValue, { pad: true })}`);

        // Prepare deadline
        const _expiration = 4; // number of blocks
        const _initialHeight = await ethers.provider.getBlockNumber();
        console.log("Now at block number: ", _initialHeight);
        const _deadline = _initialHeight + _expiration;
        console.log("Deadline blocknumber: ", _deadline);

        // Prepare data
        const _chain = await ethers.provider.getNetwork();
        const _eip712Domain = {
            name: "",
            version: "",
            chainId: _chain.chainId,
            verifyingContract: wbtcHousePool.address,
        };
        const _eip712Types = {
            VoI: [
                { name: "signer", type: "address" },
                { name: "expectedValue", type: "int256" },
                { name: "maxExposure", type: "uint256" },
                { name: 'nonce', type: 'uint256' },
                { name: "deadline", type: "uint256" }
            ],
        };
        const _eip712Value = {
            signer: dataProvider.address,
            expectedValue: _evValue,
            maxExposure: _meValue,
            nonce: 0,
            deadline: _deadline
        };
        const _data = [_eip712Domain, _eip712Types, _eip712Value];

        const _signature = await dataProvider._signTypedData(..._data);

        await wbtcHousePool.connect(operator).deposit(
            tokenAmount,
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const operatorTokenBalance = await mockWBTC.balanceOf(operator.address)
        expect(ethers.utils.formatEther(operatorTokenBalance)).to.equal(ethers.utils.formatEther(0))
    })

    it(`WBTC HOUSE POOL withdraw signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await wbtcHousePool.connect(owner).grantRole(wbtcHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await wbtcHousePool.connect(owner).grantRole(wbtcHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);


        const initialEV = await wbtcHousePool.getEV();
        console.log(`Initial EV value is: ${ethers.utils.formatEther(initialEV)}`);

        // Random value to set as EV -- random value between -500 to 500 ether
        const _evValue = ethers.utils.parseUnits(((Math.random() * 1000) - 500).toString(), 18);
        console.log(`Attempting update EV value to: ${ethers.utils.formatEther(_evValue, { pad: true })}`);
        // Random value to set as ME -- random value between 0 to 100 ether
        const _meValue = ethers.utils.parseUnits((Math.random() * 100).toString(), 18);
        console.log(`Attempting update ME value to: ${ethers.utils.formatEther(_meValue, { pad: true })}`);

        // Prepare deadline
        const _expiration = 4; // number of blocks
        const _initialHeight = await ethers.provider.getBlockNumber();
        console.log("Now at block number: ", _initialHeight);
        const _deadline = _initialHeight + _expiration;
        console.log("Deadline blocknumber: ", _deadline);
        
        // Prepare data
        const _chain = await ethers.provider.getNetwork();
        const _eip712Domain = {
            name: "",
            version: "",
            chainId: _chain.chainId,
            verifyingContract: wbtcHousePool.address,
        };
        const _eip712Types = {
            VoI: [
                { name: "signer", type: "address" },
                { name: "expectedValue", type: "int256" },
                { name: "maxExposure", type: "uint256" },
                { name: 'nonce', type: 'uint256' },
                { name: "deadline", type: "uint256" }
            ],
        };
        const _eip712Value = {
            signer: dataProvider.address,
            expectedValue: _evValue,
            maxExposure: _meValue,
            nonce: 0,
            deadline: _deadline
        };
        const _data = [_eip712Domain, _eip712Types, _eip712Value];

        const _signature = await dataProvider._signTypedData(..._data);

        await wbtcHousePool.connect(operator).withdraw(
            tokenAmount/2,
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const operatorTokenBalance = await mockWBTC.balanceOf(operator.address)
        expect(ethers.utils.formatEther(operatorTokenBalance)).to.equal(ethers.utils.formatEther(tokenAmount/2))
    })
})


