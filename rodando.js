const express = require('express');
const app = express();
const PORT = 3000;

app.get('/api/buscar-professor', (req, res) => {
  const { nome } = req.query;
  console.log("Rota acessada com nome:", nome);

  res.json([{ id: 1, nome: "Maria", cpf: "12345678900", email: "maria@email.com" }]);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
