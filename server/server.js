const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());

app.post("/users", (req, res) => {
  const { walletId, userName } = req.body;
  let data;
  try {
    data = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "db.json"), "UTF-8")
    );
    const { users = [] } = data;
    const userExists = users.some((user) => user.walletId === walletId);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
  } catch (error) {
    console.error("Error reading file:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  // Добавление нового пользователя
  data.users.push({ walletId, userName });

  // Запись данных в файл
  try {
    fs.writeFileSync(
      path.resolve(__dirname, "db.json"),
      JSON.stringify(data),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing file:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  // Подтверждение очередности создания
  res.status(200).send({ walletId, userName });
});

app.listen(5000, () => console.log("Server running on port 5000"));
