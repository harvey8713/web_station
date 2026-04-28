import qwenService from './services/qwen-service';
import aiController from './controllers/ai-controller';
import routes from './routes';

export default {
  services: {
    qwenService,
  },
  controllers: {
    aiController,
  },
  routes,
};
