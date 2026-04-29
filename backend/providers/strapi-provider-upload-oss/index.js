'use strict';

const OSS = require('ali-oss');

const normalizeTimeout = (timeout) => {
  if (!timeout) return 60000;
  if (timeout > 1000) return timeout;
  return timeout * 1000;
};

const trimSlashes = (value = '') => value.replace(/^\/+|\/+$/g, '');

const joinKey = (...parts) => parts.filter(Boolean).map(trimSlashes).join('/');

const getFileKey = (file, config) => {
  const pathPart = file.path ? trimSlashes(file.path) : '';
  const uploadPath = config.uploadPath ? trimSlashes(config.uploadPath) : '';
  return joinKey(uploadPath, pathPart, `${file.hash}${file.ext}`);
};

const getBaseUrl = (config) => {
  if (config.baseUrl) {
    return config.baseUrl.replace(/\/$/, '');
  }

  if (config.endpoint) {
    const protocol = config.secure === false ? 'http' : 'https';
    return `${protocol}://${config.bucket}.${trimSlashes(config.endpoint)}`;
  }

  const protocol = config.secure === false ? 'http' : 'https';
  return `${protocol}://${config.bucket}.${config.region}.aliyuncs.com`;
};

module.exports = {
  init(providerOptions = {}) {
    const config = {
      secure: true,
      timeout: 60000,
      internal: false,
      ...providerOptions,
    };

    const client = new OSS({
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      endpoint: config.endpoint,
      secure: config.secure !== false,
      internal: config.internal === true,
      timeout: normalizeTimeout(config.timeout),
    });

    const assignFileUrl = (file, key) => {
      const baseUrl = getBaseUrl(config);
      file.url = `${baseUrl}/${key}`;
      file.provider = 'aliyun-oss';
      file.provider_metadata = { key };
    };

    const putObject = async (file) => {
      const key = getFileKey(file, config);

      if (file.stream) {
        await client.putStream(key, file.stream, {
          headers: {
            'Content-Type': file.mime,
          },
        });
      } else if (file.buffer) {
        await client.put(key, file.buffer, {
          headers: {
            'Content-Type': file.mime,
          },
        });
      } else {
        throw new Error('Upload provider expected file.stream or file.buffer');
      }

      assignFileUrl(file, key);
    };

    return {
      async upload(file) {
        await putObject(file);
      },
      async uploadStream(file) {
        await putObject(file);
      },
      async delete(file) {
        const key = file?.provider_metadata?.key || getFileKey(file, config);
        await client.delete(key);
      },
      isPrivate() {
        return false;
      },
    };
  },
};
