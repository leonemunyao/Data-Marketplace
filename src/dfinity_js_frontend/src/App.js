import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import "./App.css";
import coverImg from "./assets/img/pie.jpg";
import { login, logout as destroy } from "./utils/auth";
import Cover from "./components/utils/Cover";
import { Notification } from "./components/utils/Notifications";
import Items from "./components/dataMarketplace/Items";


const App = function AppWrapper() {
  const isAuthenticated = window.auth.isAuthenticated;
 

  return (
    <>
    <Notification />
      {isAuthenticated ? (
        <Container fluid="md">
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
