import * as React from "react";
const WalletContext = React.createContext({
  provider: null,
  smartAccount: null,
  address: "",
  email: "",
  ChainLinkVRF: "0xe7AcC9852421163949A07150E0F8de94dbaA30F",
  RedPacket: "0x37CdEfc4003057a6B65662EC9C50d5deD29C8b29",
});

export default WalletContext;
