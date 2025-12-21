export type HonoRpcMswAdapterConfig = {
  baseUrl: string;
};

const defaultConfig: HonoRpcMswAdapterConfig = {
  baseUrl: '/',
};

let registeredConfig: HonoRpcMswAdapterConfig = defaultConfig;

export const setConfig = (config: Partial<HonoRpcMswAdapterConfig>) => {
  registeredConfig = {
    ...defaultConfig,
    ...config,
  };
};

export const getConfig = () => {
  return registeredConfig;
};
