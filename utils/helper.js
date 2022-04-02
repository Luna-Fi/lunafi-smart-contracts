const { BigNumber } = require("ethers");

const getNumberFromStrBN = (str_bn, dec) => {
    let val = 0;
    for (let i = 0; i < str_bn.length; i++) {
        if (str_bn.substr(str_bn.length - 1 - i, 1) !== '0') {
            val = parseInt(str_bn.substr(0, str_bn.length - i)) / Math.pow(10, dec - i);
            break;
        }
    }
    return val;
};

const getNumberFromBN = (bn, d) => {
    const num1 = BigNumber.from(bn)
    const num2 = BigNumber.from(10).pow(d);
    const num3 = num1.mod(num2);
    const num4 = num1.sub(num3).div(num2);
    return num4.toNumber() + getNumberFromStrBN(num3.toString(), d);
}

const getBNFromNumber = (num, d) => {
    const str = num.toString();
    if (str.indexOf(".") > -1) {
        const str1 = str.split(".")[0];
        const str2 = str.split(".")[1];
        return BigNumber.from(10).pow(d).mul(BigNumber.from(parseInt(str1)))
            .add(BigNumber.from(10).pow(d - str2.length).mul(BigNumber.from(parseInt(str2))));
    } else {
        return BigNumber.from(10).pow(d).mul(num);
    }
}

const formatNumberFromBN = (bn, d) => {
    const str = (getNumberFromBN(bn, d)).toString().replace(/\.0+$/, '');
    const str1 = str.split(".")[0];
    const str2 = str.split(".")[1] ? "." + str.split(".")[1] : '';
    return str1.split("").reverse().reduce(function(acc, num, i, orig) {return num + (num !== "-" && i && !(i % 3) ? "," : "") + acc;}, "") + str2;
}

const sleep = (milliseconds) => {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds)
    return true;
}

module.exports = {
    getNumberFromStrBN,
    getNumberFromBN,
    getBNFromNumber,
    formatNumberFromBN,
    sleep,
}