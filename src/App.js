import * as React from "react";
import logo from "./logo.svg";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./Root";
import ErrorPage from "./pages/Common/ErrorPage";
import SocialAuthUsingParticle from "./Auth/SocialAuthUsingParticle";

import { action as logoutAction } from "./components/Logout";
import {
  tokenLoader,
  action as getAddress,
  LoginPage,
} from "./Auth/AuthUtility";
import WalletContext from "./context/wallet-context";
import CreatePacket from "./pages/RedPacket/CreatePacket";
import Homepage from "./pages/general/Homepage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    id: "root",
    loader: tokenLoader,
    children: [
      { index: true, element: <Homepage /> },
      { path: "createpacket", element: <CreatePacket /> },
      // { path: "products", element: <ProductsList /> },
      {
        path: "login",
        element: <LoginPage />,
        action: getAddress,
      },
      { path: "logout", action: logoutAction },
      // { path: "admin", element: <AdminPage /> },
      // { path: "superadmin", element: <SuperAdminPage /> },
    ],
  },
]);
function App() {
  const [provider, setProvider] = React.useState(null);
  const [smartAccount, setSmartAccount] = React.useState(null);
  const [address, setAddress] = React.useState("");

  const [email, setEmail] = React.useState("");
  const ChainLinkVRF = "0xe7AcC9852421163949A07150E0F8de94dbaA30F";
  const RedPacket = "0x37CdEfc4003057a6B65662EC9C50d5deD29C8b29";

  return (
    <WalletContext.Provider
      value={{
        provider: provider,
        smartAccount: smartAccount,
        address: address,
        email: email,
        ChainLinkVRF: ChainLinkVRF,
        RedPacket: RedPacket,
      }}
    >
      <RouterProvider router={router} />
    </WalletContext.Provider>
  );
  // return <SocialAuthUsingParticle />;
}

export default App;
