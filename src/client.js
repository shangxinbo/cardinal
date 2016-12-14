import path from 'path';
import minimist from 'minimist';
import { spawn } from 'child_process';
import { readFileSync, accessSync } from 'fs';
import { isV4Format } from 'ip';
import { lookup } from 'dns';

import DEFAULT_CONFIG from './defaultConfig';
import { version } from '../package.json';
import fileConfig from '../config.json';
import * as ssLocal from './ssLocal';
import * as ssServer from './ssServer';
import { getPid, writePidFile, deletePidFile } from './pid';
import { updateGFWList as _updateGFWList, GFWLIST_FILE_PATH } from './gfwlistUtils';
import { safelyKill } from './utils';

const PROXY_ARGUMENT_PAIR = {
  c: 'configFilePath',
  s: 'serverAddr',
  p: 'serverPort',
  pac_port: 'pacServerPort',
  l: 'localAddr',
  b: 'localPort',
  k: 'password',
  m: 'method',
  t: 'timeout',
  level: 'level',
  // private
  mem: '_recordMemoryUsage',
};

const GENERAL_ARGUMENT_PAIR = {
  h: 'help',
  help: 'help',
  d: 'daemon',
  pac_update_gfwlist: 'pacUpdateGFWList',
};

const SPAWN_OPTIONS = {
  detached: true,
  stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
};

const DAEMON_COMMAND = {
  start: 'start',
  stop: 'stop',
  restart: 'restart',
};


function getArgvOptions(argv) {
  const generalOptions = {};
  const proxyOptions = {};
  const configPair = minimist(argv);
  const optionsType = [{
    options: proxyOptions,
    keys: Object.keys(PROXY_ARGUMENT_PAIR),
    values: PROXY_ARGUMENT_PAIR,
  }, {
    options: generalOptions,
    keys: Object.keys(GENERAL_ARGUMENT_PAIR),
    values: GENERAL_ARGUMENT_PAIR,
  }];

  let invalidOption = null;

  Object.keys(configPair).forEach((key) => {
    if (key === '_') {
      return;
    }

    let hit = false;

    optionsType.forEach((optType) => {
      const i = optType.keys.indexOf(key);

      if (i >= 0) {
        optType.options[optType.values[optType.keys[i]]] = configPair[key]; // eslint-disable-line
        hit = true;
      }
    });

    if (!hit) {
      invalidOption = key;
    }
  });

  if (invalidOption) {
    invalidOption = (invalidOption.length === 1) ? `-${invalidOption}` : `--${invalidOption}`;
  } else if (generalOptions.daemon
    && Object.keys(DAEMON_COMMAND).indexOf(generalOptions.daemon) < 0) {
    invalidOption = `invalid daemon command: ${generalOptions.daemon}`;
  }

  return {
    generalOptions, proxyOptions, invalidOption,
  };
}

function readConfig(_filePath) {
  if (!_filePath) {
    return null;
  }

  const filePath = path.resolve(process.cwd(), _filePath);

  try {
    accessSync(filePath);
  } catch (e) {
    throw new Error(`failed to find config file in: ${filePath}`);
  }

  return JSON.parse(readFileSync(filePath));
}

// export for test
export function resolveServerAddr(config, next) {
  const { serverAddr } = config.proxyOptions;

  if (isV4Format(serverAddr)) {
    next(null, config);
  } else {
    lookup(serverAddr, (err, addresses) => {
      if (err) {
        next(new Error(`failed to resolve 'serverAddr': ${serverAddr}`), config);
      } else {
        // NOTE: mutate data
        config.proxyOptions.serverAddr = addresses; // eslint-disable-line
        next(null, config);
      }
    });
  }
}

export function getConfig(argv = [], next) {
  const { generalOptions, proxyOptions, invalidOption } = getArgvOptions(argv);
  const specificFileConfig = readConfig(proxyOptions.configFilePath) || fileConfig;
  const config = {
    generalOptions,
    invalidOption,
    proxyOptions: Object.assign({}, DEFAULT_CONFIG, specificFileConfig, proxyOptions),
  };

  resolveServerAddr(config, next);
}

function runSingle(proxyOptions) {
  const willLogToConsole = true;
  return ssLocal.startServer(proxyOptions, willLogToConsole);
}

export default function client() {
  const argv = process.argv.slice(2);

  getConfig(argv, (err, config) => {
    if (err) {
      throw err;
    }
    const {proxyOptions} = config;
    runSingle(proxyOptions);
  });
}
