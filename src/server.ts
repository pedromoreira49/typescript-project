/*******************
PARA INICIAR O SERVIDOR DIGITE O COMANDO NPM RUN DEV NO TERMINAL 
********************/
import express from 'express';
import path from 'path';
import routes from './routes';

const app = express();
app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(8000, () => {
    console.log('Server Started!');
});