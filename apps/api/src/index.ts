import { createApp } from './app';

const app = createApp();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`API service running on port ${PORT}`);
});

export default app;
