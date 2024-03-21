import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import "./App.css";
import coverImg from "./assets/img/pie.jpg";
import { login, logout as destroy } from "./utils/auth";
import Cover from "./components/utils/Cover";
import { Notification } from "./components/utils/Notifications";
import Items from "./components/dataMarketplace/Items";
import { balance as principalBalance  } from "./utils/ledger";
import Wallet from "./components/Wallet";


const App = function AppWrapper() {
  const isAuthenticated = window.auth.isAuthenticated;
  const principal = window.auth.principalText;

  const [balance, setBalance] = useState("0");

  const getBalance = useCallback(async () => {
    if (isAuthenticated) {
      setBalance(await principalBalance());
    }
  });

  useEffect(() => {
    getBalance();
  }, [getBalance]);
 

  return (
    <>
    <Notification />
      {isAuthenticated ? (
        <Container fluid="md">
            <Nav className='justify-content-end pt-3 pb-5'>
              <Nav.Item>
                <Wallet
                      principal={principal}
                      balance={balance}
                      symbol={"ICP"}
                      isAuthenticated={isAuthenticated}
                      destroy={destroy}
                      />
              </Nav.Item>
            </Nav>
          <main>
            <Items />
          </main>
        </Container>
      ) : (
        <Cover name="Data Marketplace" login={login} coverImg={coverImg} />
      )}
    </>
  );
};

export default App;
