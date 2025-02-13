import express from 'express';
import RefreshToken from '../controllers/userControllers/refreshTokenController.js';


const Refresh = express.Router();

Refresh.post('/refresh',RefreshToken);


export default Refresh;
