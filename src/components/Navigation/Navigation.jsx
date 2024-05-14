import { handleSignMessage, useMetaMask } from "../../hooks/useMetaMask";
import { formatAddress } from "../../utils";
import "../Navigation/Navigation.module.css";
import { quitWallet } from "../../hooks/useMetaMask";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
export const Navigation = () => {
  const { wallet, hasProvider, isConnecting, connectMetaMask } = useMetaMask();
  const customColor = {
    backgroundColor: "rgb(39, 39, 39)",
  };
  return (
    <Navbar className="p-3" style={customColor}>
      <Container>
        <Nav className="me-auto">
          <Nav.Link className="text-white" href="#home">
            Список голосований
          </Nav.Link>
          <Nav.Link className="text-white" href="#features">
            Профиль
          </Nav.Link>
          <Nav.Link className="text-white" href="#pricing">
            Создать голосование
          </Nav.Link>
        </Nav>
      </Container>
      <div class="auth" className="col-auto">
        {!hasProvider && (
          <a href="https://metamask.io" target="_blank" rel="noreferrer">
            Install MetaMask
          </a>
        )}
        {!(window.ethereum?.isMetaMask && wallet.accounts.length < 1) && (
          <button className="me-3" type="button" onClick={quitWallet}>
            Disconnect from DApp
          </button>
        )}
        {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
          <button
            className="me-3"
            disabled={isConnecting}
            onClick={connectMetaMask}
          >
            Connect MetaMask
          </button>
        )}
        {hasProvider && wallet.accounts.length > 0 && (
          <a
            className="text_link tooltip-bottom me-5"
            href={`https://etherscan.io/address/${wallet}`}
            target="_blank"
            data-tooltip="Open in Block Explorer"
            rel="noreferrer"
          >
            {formatAddress(wallet.accounts[0])}
          </a>
        )}
      </div>
    </Navbar>
  );
};
