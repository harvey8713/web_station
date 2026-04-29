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

    console.log('[OSS Provider] Initializing with bucket:', config.bucket, 'region:', config.region);

    const ossOptions = {
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      secure: config.secure !== false,
      internal: config.internal === true,
      timeout: normalizeTimeout(config.timeout),
    };
    if (config.endpoint) ossOptions.endpoint = config.endpoint;

    const client = new OSS(ossOptions);

    const assignFileUrl = (file, key) => {
      const baseUrl = getBaseUrl(config);
      file.url = `${baseUrl}/${key}`;
      file.provider = 'aliyun-oss';
      file.provider_metadata = { key };
    };

    const putObject = async (file) => {
      const key = getFileKey(file, config);
      console.log('[OSS Provider] Uploading key:', key, 'hasStream:', !!file.stream, 'hasBuffer:', !!file.buffer, 'mime:', file.mime);

      try {
        if (file.stream) {
          const result = await client.putStream(key, file.stream, {
            headers: { 'Content-Type': file.mime },
          });
          console.log('[OSS Provider] putStream result:', result?.res?.status);
        } else if (file.buffer) {
          const result = await client.put(key, file.buffer, {
            headers: { 'Content-Type': file.mime },
          });
          console.log('[OSS Provider] put result:', result?.res?.status);
        } else {
          throw new Error('Upload provider expected file.stream or file.buffer');
        }
      } catch (err) {
        console.error('[OSS Provider] Upload error:', err.message, err.code, err.status);
        throw err;
      }

      assignFileUrl(file, key);
      console.log('[OSS Provider] Upload success:', file.url);
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
