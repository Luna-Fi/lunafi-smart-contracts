const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}


describe("WETH HousePool", () => {

    let MOCKWETH
    let WETHCLAIMTOKEN
    let WETHHOUSEPOOL
    let wethHousePool
    let wethClaimToken
    let mockWETH

    let tokenAmount = 100000 * 10 ** 6
    before(async () => {

        const approvalAmount = 1000000 * 10 ** 8
        const [owner, user1, operator] = await ethers.getSigners()

        MOCKWETH = await ethers.getContractFactory("mockWETHToken")
        mockWETH = await MOCKWETH.deploy()
        await mockWETH.deployed()
        console.log(" Mock WBTC Token Address  : ", mockWETH.address)

        WETHCLAIMTOKEN = await ethers.getContractFactory("WBTCclaimToken")
        wethClaimToken = await WETHCLAIMTOKEN.deploy()
        await wethClaimToken.deployed()
        console.log(" WBTC Claim Token Address : ", wethClaimToken.address)

        WETHHOUSEPOOL = await ethers.getContractFactory("HousePoolWBTC")
        // wethHousePool = await WETHHOUSEPOOL.deploy(owner.address,mockWETH.address,wethClaimToken.address, "","")
        wethHousePool = await upgrades.deployProxy(WETHHOUSEPOOL, [owner.address, mockWETH.address, wethClaimToken.address, "", ""], { initializer: 'initialize' });

        await wethHousePool.deployed()
        console.log(" WBTC House Pool  Address  : ", wethHousePool.address)

        await mockWETH.approve(wethHousePool.address, approvalAmount)
        await wethClaimToken.approve(wethHousePool.address, approvalAmount)
        await wethClaimToken.addAdmin(wethHousePool.address)

        await mockWETH.connect(user1).approve(wethHousePool.address, approvalAmount)
        await wethClaimToken.connect(user1).approve(wethHousePool.address, approvalAmount)
        await mockWETH.transfer(user1.address, tokenAmount)

        await mockWETH.connect(operator).approve(wethHousePool.address, approvalAmount)
        await mockWETH.transfer(operator.address, tokenAmount)
    })

    it(`WETH HOUSE POOL setVOI signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await wethHousePool.connect(owner).grantRole(wethHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await wethHousePool.connect(owner).grantRole(wethHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);

        const initialEV = await wethHousePool.getEV();
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
            verifyingContract: wethHousePool.address,
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

        await wethHousePool.connect(operator).setVOI(
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const updatedEV = await wethHousePool.getEV();
        expect(ethers.utils.formatEther(updatedEV)).to.not.equal(ethers.utils.formatEther(initialEV));
        expect(ethers.utils.formatEther(updatedEV)).to.equal(ethers.utils.formatEther(_evValue));
    })

    it(`WETH HOUSE POOL deposit signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await wethHousePool.connect(owner).grantRole(wethHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await wethHousePool.connect(owner).grantRole(wethHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);

        const initialEV = await wethHousePool.getEV();
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
            verifyingContract: wethHousePool.address,
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

        await wethHousePool.connect(operator).deposit(
            tokenAmount,
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const operatorTokenBalance = await mockWETH.balanceOf(operator.address)
        expect(ethers.utils.formatEther(operatorTokenBalance)).to.equal(ethers.utils.formatEther(0))
    })

    it(`WETH HOUSE POOL withdraw signed data test`, async () => {
        const [owner, dataProvider, operator] = await ethers.getSigners()

        await wethHousePool.connect(owner).grantRole(wethHousePool.DATA_PROVIDER_ORACLE(), dataProvider.address);
        await wethHousePool.connect(owner).grantRole(wethHousePool.HOUSE_POOL_DATA_PROVIDER(), operator.address);


        const initialEV = await wethHousePool.getEV();
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
            verifyingContract: wethHousePool.address,
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

        await wethHousePool.connect(operator).withdraw(
            tokenAmount/2,
            _signature,
            {
                expectedValue: _evValue,
                maxExposure: _meValue,
                deadline: _deadline,
                nonce: 0,
                signer: dataProvider.address
            });
        const operatorTokenBalance = await mockWETH.balanceOf(operator.address)
        expect(ethers.utils.formatEther(operatorTokenBalance)).to.equal(ethers.utils.formatEther(tokenAmount/2))
    })
})


