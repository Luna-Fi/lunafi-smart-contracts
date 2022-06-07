const { BigNumber} = require("ethers");

const returnBigNumber = (number) => {
    number = number.toString(16)
    return BigNumber.from("0x" + number);
}

const rewardsPerSecond = ethers.utils.formatUnits(returnBigNumber(1 * 10 **18),0);
module.exports = [
    "VLFI",
    "VLFI",
    "0x9c4c940205cF972e0B5742c17B3B9a3eAAF87a47",
    864000,
    172800,
    rewardsPerSecond
];