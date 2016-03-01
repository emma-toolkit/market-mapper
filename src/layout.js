import config from './config.json'

export default {
  environment: config.layout.h / 6 - config.layout.h / 20,
  chain: config.layout.h / 2,
  infrastructure: config.layout.h * (5/6) + config.layout.h / 20
};
