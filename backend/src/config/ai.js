import { Mistral  } from '@mistralai/mistralai';
import env from './env.js';

const mistralClient = new Mistral({
    apiKey: env.MISTRAL_API_KEY,
});

export default mistralClient;
