import express from 'express';

let router = express.Router();

router.post('/', (req, res) => {
    // let body = req.body;
    res.send('hello');
});

export default router;