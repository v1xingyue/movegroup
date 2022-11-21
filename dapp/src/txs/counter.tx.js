import { utils, bcs, encoding, } from "@starcoin/starcoin"
import { starcoinProvider } from "../app";
import { arrayify, hexlify } from '@ethersproject/bytes'
import { GROUP_ADDRESS } from "./config";

export async function getResource(address, resourceID) {
    const resourceType = `${GROUP_ADDRESS}::${resourceID}`
    console.log("load move resource", resourceType)
    const resource = await starcoinProvider.getResource(address, resourceType)
    console.log(resource)
    return resource
}

export async function executeCreateFunction(address, functionName, strTypeArgs = [], args = []) {
    const functionId = `${address}::${functionName}`;
    const tyArgs = utils.tx.encodeStructTypeTags(strTypeArgs);
    const toNameHex = (function () {
        const se = new bcs.BcsSerializer();
        se.serializeStr(args[0]);
        return hexlify(se.getBytes());
    })();
    const tolinkHex = (function () {
        const se = new bcs.BcsSerializer();
        se.serializeStr(args[1]);
        return hexlify(se.getBytes());
    })();
    const as = [
        arrayify(toNameHex),
        arrayify(tolinkHex),
    ];
    const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, as);
    const payloadInHex = (() => {
        const se = new bcs.BcsSerializer();
        scriptFunction.serialize(se);
        return hexlify(se.getBytes());
    })();

    const txParams = {
        data: payloadInHex,
    };

    const transactionHash = await starcoinProvider
        .getSigner()
        .sendUncheckedTransaction(txParams);
    return transactionHash
}

export async function executeRemoveFunction(address, functionName, strTypeArgs = [], args = []) {
    const functionId = `${address}::${functionName}`;
    const tyArgs = utils.tx.encodeStructTypeTags(strTypeArgs);
    const toIdHex = (function () {
        const se = new bcs.BcsSerializer();
        se.serializeU64(args[0]);
        return hexlify(se.getBytes());
    })();
    const as = [
        arrayify(toIdHex),
    ];
    const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, as);
    const payloadInHex = (() => {
        const se = new bcs.BcsSerializer();
        scriptFunction.serialize(se);
        return hexlify(se.getBytes());
    })();

    const txParams = {
        data: payloadInHex,
    };

    const transactionHash = await starcoinProvider
        .getSigner()
        .sendUncheckedTransaction(txParams);
    return transactionHash
}


export async function executeModifyFunction(address, functionName, strTypeArgs = [], args = []) {
    const functionId = `${address}::${functionName}`;
    const tyArgs = utils.tx.encodeStructTypeTags(strTypeArgs);
    const toIdHex = (function () {
        const se = new bcs.BcsSerializer();
        se.serializeU64(args[0]);
        return hexlify(se.getBytes());
    })();
    const toNameHex = (function () {
        const se = new bcs.BcsSerializer();
        se.serializeStr(args[1]);
        return hexlify(se.getBytes());
    })();
    const tolinkHex = (function () {
        const se = new bcs.BcsSerializer();
        se.serializeStr(args[2]);
        return hexlify(se.getBytes());
    })();
    const as = [
        arrayify(toIdHex),
        arrayify(toNameHex),
        arrayify(tolinkHex),
    ];
    const scriptFunction = utils.tx.encodeScriptFunction(functionId, tyArgs, as);
    const payloadInHex = (() => {
        const se = new bcs.BcsSerializer();
        scriptFunction.serialize(se);
        return hexlify(se.getBytes());
    })();

    const txParams = {
        data: payloadInHex,
    };

    const transactionHash = await starcoinProvider
        .getSigner()
        .sendUncheckedTransaction(txParams);
    return transactionHash
}