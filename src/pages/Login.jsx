import React, { useContext, useState } from "react";
import { RootStoreContext } from "..";
import { Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Web3 from "web3";
import { CONTACT_ABI, CONTACT_ADDRESS } from "../config";
import "./Login.css";
import detectEthereumProvider from "@metamask/detect-provider";
import { formatBalance, formatChainAsNum } from "../utils/index";
import styles from "../App.module.css";
import { Navigation } from "../components/Navigation";
import { Display } from "../components/Display";
import { MetaMaskError } from "../components/MetamaskError/index.jsx";
import { MetaMaskContextProvider } from "../hooks/useMetaMask";
let injectedProvider = false;

if (typeof window.ethereum !== "undefined") {
  injectedProvider = true;
  console.log(window.ethereum);
}

const isMetaMask = injectedProvider ? window.ethereum.isMetaMask : false;

const Login = () => {
  const [account, setAccount] = useState();
  const [contactList, setContactList] = useState();
  const [contacts, setContacts] = useState([]);
  const { users } = useContext(RootStoreContext);
  const navigate = useNavigate();

  const [hasProvider, setHasProvider] = useState(null);
  const initialState = {
    accounts: [],
    balance: "",
    chainId: "",
  }; /* Updated */
  const [wallet, setWallet] = useState(initialState);

  useEffect(() => {
    const refreshAccounts = (accounts) => {
      if (accounts.length > 0) {
        updateWallet(accounts);
      } else {
        // if length 0, user is disconnected
        setWallet(initialState);
      }
    };
    const refreshChain = (chainId) => {
      setWallet((wallet) => ({ ...wallet, chainId }));
    };

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      setHasProvider(Boolean(provider));

      if (provider) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        refreshAccounts(accounts);
        window.ethereum.on("accountsChanged", refreshAccounts);
      }
    };
    getProvider();
    return () => {
      window.ethereum?.removeListener("accountsChanged", refreshAccounts);
      window.ethereum?.removeListener("chainChanged", refreshChain);
    };
  }, []);
  const quitWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [
            {
              eth_accounts: {},
            },
          ],
        });
        alert("Successfully disconnected from DApp.");
      } catch (error) {
        console.error(error);
        alert("Failed to disconnect from DApp.");
      }
    } else {
      alert("MetaMask is not installed or not connected.");
    }
  };
  const updateWallet = async (accounts) => {
    const balance = formatBalance(
      await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })
    );
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    setWallet({ accounts, balance, chainId }); /* Updated */
  };

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    updateWallet(accounts);
  };
  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);
          const web3 = new Web3(window.ethereum);
          const contactList = new web3.eth.Contract(
            CONTACT_ABI,
            CONTACT_ADDRESS
          );
          setContactList(contactList);
          const counter = await contactList.methods.count().call();
          const newContacts = [];
          for (let i = 1; i <= counter; i++) {
            const contact = await contactList.methods.contacts(i).call();
            newContacts.push(contact);
          }
          setContacts(newContacts);
        } else {
          console.error("Аккаунты не найдены");
        }
      } catch (error) {
        console.error("Ошибка при запросе аккаунтов через MetaMask:", error);
      }
    } else {
      console.error("MetaMask не обнаружен");
    }
  };

  const handleLogout = () => {
    setAccount(null); // Очищаем аккаунт
    setContactList(null); // Очищаем контакт-лист
    setContacts([]); // Очищаем список контактов
  };

  return (
    <div>
      <MetaMaskContextProvider>
        <div className={styles.appContainer}>
          <Navigation />
          <Display />
          <MetaMaskError />
          <button id="disconnectButton" onClick={quitWallet}>
            Disconnect from DApp
          </button>
        </div>
      </MetaMaskContextProvider>
    </div>
  );
};

export default Login;
