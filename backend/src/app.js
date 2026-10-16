import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/index.js';

const app = express();

app.use(cors());
app.use(express.json({
    // Raw bytes are required to verify provider signatures (X-Hub-Signature-256).
    verify: (req, _res, buf) => {
        if (req.originalUrl.startsWith('/api/webhooks')) req.rawBody = buf;
    },
}));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorHandler);

export default app;
