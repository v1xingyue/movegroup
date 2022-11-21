import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import classnames from "classnames";
import { createRoot } from "react-dom/client";
import { useCallback } from "react";
import { arrayify, hexlify } from "@ethersproject/bytes";
import { utils, bcs } from "@starcoin/starcoin";
import encoding from '@starcoin/starcoin';
import { starcoinProvider } from "./app";
import { executeModifyFunction, executeCreateFunction, executeRemoveFunction } from "./txs/counter.tx";
import {
  GROUP_ADDRESS, INIT_GROUP_FUNC_NAME, S_ADD_MEMBER_FUNC_NAME, S_REMOVE_MEMBER_FUNC_NAME, S_REMOVE_MEMBER_MODIFY_NAME
} from "./txs/config";

export const makeModal = (props) => {
  const { children } = props;
  const escapeNode = document.createElement("div");
  const root = createRoot(escapeNode);
  document.body.appendChild(escapeNode);
  const onClose = () => {
    root.unmount();
    if (document.body.contains(escapeNode)) {
      document.body.removeChild(escapeNode);
    }
  };
  const Child = children({ onClose });
  root.render(<>{Child}</>);
};

const useFadeIn = () => {
  const [isShow, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 10);
  }, []);

  return { isShow };
};

export const Mask = (props) => {
  const { onClose } = props;
  const { isShow } = useFadeIn();

  return (
    <div
      className={classnames(
        "fixed top-0 bottom-0 left-0 right-0 bg-black duration-300",
        isShow ? "opacity-80" : "opacity-0"
      )}
      onClick={() => {
        onClose();
      }}
    />
  );
};

export const InitGroup = (props) => {
  const { initAmount, initExpired } = props;
  const { isShow } = useFadeIn();
  const [account, setAccount] = useState(
    GROUP_ADDRESS || "0x1168e88ffc5cec53b398b42d61885bbb"
  );
  const [amount, setAmount] = useState(initAmount || "0.001");
  const [expired, setExpired] = useState(initExpired || "1800");
  const [hash, setHash] = useState("");

  const handleCall = useCallback(async () => {
    try {
      const functionId = `${GROUP_ADDRESS}::${INIT_GROUP_FUNC_NAME}`;
      console.log(functionId);
      const strTypeArgs = [];
      const tyArgs = utils.tx.encodeStructTypeTags(strTypeArgs);
      const args = [];

      const scriptFunction = utils.tx.encodeScriptFunction(
        functionId,
        tyArgs,
        args
      );

      // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
      const payloadInHex = (function () {
        const se = new bcs.BcsSerializer();
        scriptFunction.serialize(se);
        return hexlify(se.getBytes());
      })();

      const txParams = {
        data: payloadInHex,
      };

      const expiredSecs = parseInt(expired, 10);
      if (expiredSecs > 0) {
        txParams.expiredSecs = expiredSecs;
      }
      const hash = await starcoinProvider
        .getSigner()
        .sendUncheckedTransaction(txParams);
      console.log({ hash });
      setHash(hash);
    } catch (e) {
      setHash(e.message || "Unkown Error");
    }
  }, [account, amount, expired]);

  return (
    <div
      className={classnames(
        "fixed top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 rounded-2xl shadow-2xl w-3/4 p-6 bg-white duration-300",
        isShow ? "opacity-100 scale-100" : "opacity-0 scale-50"
      )}
    >
      <div className="font-bold">Init your own group</div>
      <div
        className="mt-6 p-4 flex justify-center font-bold bg-blue-900 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        onClick={handleCall}
      >
        Create Your Own Group
      </div>
      {hash && (
        <div className="text-center mt-2 text-gray-500 break-all">
          Transaction: {hash}
        </div>
      )}
    </div>
  );
};

// TODO: Finish AddMember
export const AddMember = () => {
  // const utf8Encode = new TextEncoder();
  const [name, setName] = useState("")
  const [link, setLink] = useState("")
  const [txHash, setTxHash] = useState()
  const [disabled, setDisabled] = useState(false)
  const [txStatus, setTxStatus] = useState()
  const handleCall = () => {
    setDisabled(true)
    setTxStatus("Pending...")
    const add_member = async () => {
      const tyArgs = []
      console.log(name, link);
      const args = [name, link]
      let txHash = await executeCreateFunction(GROUP_ADDRESS, S_ADD_MEMBER_FUNC_NAME, tyArgs, args)
      setTxHash(txHash)
      let timer = setInterval(async () => {
        const txnInfo = await starcoinProvider.getTransactionInfo(txHash);
        setTxStatus(txnInfo.status)
        if (txnInfo.status === "Executed") {
          setDisabled(false)
          clearInterval(timer);
        }
      }, 500);
    }
    add_member()
  }
  const { isShow } = useFadeIn();

  return (
    <div
      className={classnames(
        "fixed top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 rounded-2xl shadow-2xl w-3/4 p-6 bg-white duration-300",
        isShow ? "opacity-100 scale-100" : "opacity-0 scale-50"
      )}
    >
      <div className="font-bold">Add Member</div>
      <div className="mt-2 mb-2">
        <input
          type="text"
          className="focus:outline-none rounded-xl border-2 border-slate-700 w-full p-4"
          value={name}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mt-2 mb-2">
        <input
          type="text"
          className="focus:outline-none rounded-xl border-2 border-slate-700 w-full p-4"
          placeholder="Link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <div
        className="mt-6 p-4 flex justify-center font-bold bg-blue-900 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        onClick={handleCall}
        disabled={disabled}
      >
        CALL
      </div>
      {txHash && (
        <div className="text-center mt-2 text-gray-500 break-all">
          Transaction: {txHash}
        </div>
      )}
      {txStatus ? <div style={{ "textAlign": "Center" }}>{txStatus}</div> : null}
    </div>
  );
};

export const RemoveMember = () => {
  const { isShow } = useFadeIn();
  const [memberId, setMemberId] = useState(0);
  const [txHash, setTxHash] = useState(false);
  const [txStatus, setTxStatus] = useState(false);
  const [disabled, setDisabled] = useState(false)
  const handleCall = async () => {
    setDisabled(true)
    setTxStatus("Pending...")
    const remove_member = async () => {
      const tyArgs = []
      console.log("remove this member", memberId);
      const args = [memberId]
      let txHash = await executeRemoveFunction(GROUP_ADDRESS, S_REMOVE_MEMBER_FUNC_NAME, tyArgs, args)
      setTxHash(txHash)
      let timer = setInterval(async () => {
        const txnInfo = await starcoinProvider.getTransactionInfo(txHash);
        setTxStatus(txnInfo.status)
        if (txnInfo.status === "Executed") {
          setDisabled(false)
          clearInterval(timer);
        }
      }, 500);
    }
    remove_member()
  }

  return (
    <div
      className={classnames(
        "fixed top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 rounded-2xl shadow-2xl w-3/4 p-6 bg-white duration-300",
        isShow ? "opacity-100 scale-100" : "opacity-0 scale-50"
      )}
    >
      <div className="font-bold">Remove your group member</div>
      <div className="mt-2 mb-2">
        <input
          type="text"
          className="focus:outline-none rounded-xl border-2 border-slate-700 w-full p-4"
          value={memberId}
          placeholder="memberId"
          onChange={(e) => setMemberId(e.target.value)}
        />
      </div>
      <div
        className="mt-6 p-4 flex justify-center font-bold bg-blue-900 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        onClick={handleCall}
        disabled={disabled}
      >
        Remove Member id by {memberId}
      </div>
      {txHash && (
        <div className="text-center mt-2 text-gray-500 break-all">
          Transaction: {txHash}
        </div>
      )}
      {txStatus ? <div style={{ "textAlign": "Center" }}>{txStatus}</div> : null}
    </div>
  )
}

export const ModifyMember = () => {
  const [name, setName] = useState("")
  const [link, setLink] = useState("")
  const [txHash, setTxHash] = useState()
  const [disabled, setDisabled] = useState(false)
  const [txStatus, setTxStatus] = useState()
  const [memberId, setMemberId] = useState(0);
  const handleCall = () => {
    setDisabled(true)
    setTxStatus("Pending...")
    const modify_member = async () => {
      const tyArgs = []
      console.log(name, link);
      const args = [memberId, name, link]
      let txHash = await executeModifyFunction(GROUP_ADDRESS, S_REMOVE_MEMBER_MODIFY_NAME, tyArgs, args)
      setTxHash(txHash)
      let timer = setInterval(async () => {
        const txnInfo = await starcoinProvider.getTransactionInfo(txHash);
        setTxStatus(txnInfo.status)
        if (txnInfo.status === "Executed") {
          setDisabled(false)
          clearInterval(timer);
        }
      }, 500);
    }
    modify_member()
  }
  const { isShow } = useFadeIn();

  return (
    <div
      className={classnames(
        "fixed top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 rounded-2xl shadow-2xl w-3/4 p-6 bg-white duration-300",
        isShow ? "opacity-100 scale-100" : "opacity-0 scale-50"
      )}
    >
      <div className="font-bold">Modify Member with id {memberId}</div>
      <div className="mt-2 mb-2">
        <input
          type="text"
          className="focus:outline-none rounded-xl border-2 border-slate-700 w-full p-4"
          value={memberId}
          placeholder="memberId"
          onChange={(e) => setMemberId(e.target.value)}
        />
      </div>
      <div className="mt-2 mb-2">
        <input
          type="text"
          className="focus:outline-none rounded-xl border-2 border-slate-700 w-full p-4"
          value={name}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mt-2 mb-2">
        <input
          type="text"
          className="focus:outline-none rounded-xl border-2 border-slate-700 w-full p-4"
          placeholder="Link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <div
        className="mt-6 p-4 flex justify-center font-bold bg-blue-900 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        onClick={handleCall}
        disabled={disabled}
      >
        CALL
      </div>
      {txHash && (
        <div className="text-center mt-2 text-gray-500 break-all">
          Transaction: {txHash}
        </div>
      )}
      {txStatus ? <div style={{ "textAlign": "Center" }}>{txStatus}</div> : null}
    </div>
  );
};