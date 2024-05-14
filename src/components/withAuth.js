import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMetaMask } from "../hooks/useMetaMask";

const withAuth = (Component) => () => {
  const { wallet, isConnecting, connectMetaMask } = useMetaMask();
  const navigate = useNavigate();
  if (isConnecting) {
    return <div>Идет подключение...</div>; // Возвращаем какой-либо загрузочный компонент либо сообщение
  }

  if (!wallet.accounts.length) {
    navigate("/login");
    return <div>Необходимо подключить кошелек для доступа к этой странице</div>;
  }

  return <Component />;
};

export default withAuth;
