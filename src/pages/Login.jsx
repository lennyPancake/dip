import React from "react";
import style from "./Login.module.css";

const Login = () => {
  return (
    <div className={style.main}>
      {" "}
      <header>
        <h1>Добро пожаловать в систему электронных голосований на блокчейне</h1>
      </header>
      <main>
        <section>
          <h2>Авторизация</h2>
          <p>
            Для того чтобы проголосовать, пожалуйста, авторизуйтесь в системе
            через MetaMask.
          </p>
          <button id="connect">Подключить MetaMask кошелек</button>
        </section>
      </main>
    </div>
  );
};

export default Login;
