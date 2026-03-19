import express from 'express';       // (1) Importa o framework Express

const app = express();                // (2) Cria a instância da aplicação
const PORT = 3000;

app.get('/usuarios', (req, res) => { 
  res.json({ mensagem: 'Iniciando na porta 3000' });      
});

app.listen(PORT, () => {
    console.log('Servidor ligando na porta ${PORT}');
}) 