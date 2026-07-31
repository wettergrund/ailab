import { createApp } from './app';
import { validateEnv } from '@repo/types';

validateEnv(process.env);

const app = createApp();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`API service running on port ${PORT}`);
});

export default app;
