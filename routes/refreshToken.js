import express from 'express';
import RefreshToken from '../controllers/refreshToken.js';


const Refresh = express.Router();

Refresh.post('/refresh',RefreshToken);


export default Refresh;