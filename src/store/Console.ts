import { getCache, setCache } from "@/lib/cache";
import { LogEntry, LogType } from "@/models/logentry";
import { defineActions, defineModule, defineMutations } from "direct-vuex";
import { moduleActionContext } from ".";

export interface ConsoleState {
  logs: LogEntry[];
  logging: boolean;
  originalConsole: {};
}

const state: ConsoleState = {
  logs: getCache("logs", []),
  logging: getCache("logging", false),
  originalConsole: {}
};

const syncCache = (state: ConsoleState) => {
  setCache("logs", state.logs || []);
  setCache("logging", state.logging);
};

const mutations = defineMutations<ConsoleState>()({
  clearLogs: state => {
    state.logs = [];
    syncCache(state);
    console.clear();
    console.log("%cConsole was cleared", "color: grey; font-style: italic;");
  },
  appendLog: (state, log: LogEntry) => {
    state.logs = [log, ...state.logs];
    syncCache(state);
  },
  updateLastLogCounter: (state, index: number) => {
    state.logs[index].incrementCounter();
    syncCache(state);
  },
  overrideOriginalConsole: (state, log) => {
    if (!state.originalConsole.hasOwnProperty(log.type))
      state.originalConsole[log.type] = console[log.type];
  },
  enableLogging: state => {
    state.logging = true;
    syncCache(state);
    console.warn("Logging ENABLED!");
  },
  disableLogging: state => {
    for (let type in state.originalConsole)
      console[type] = state.originalConsole[type];
    state.originalConsole = {};
    state.logging = false;
    syncCache(state);
    console.warn("Logging DISABLED!");
  }
});

const actions = defineActions({
  enableLogging(ctx) {
    const { commit, dispatch } = moduleCtx(ctx);
    const types = ["log", "dir", "info", "warn", "error"];
    types.forEach(type => {
      const o_log = console[type];
      commit.overrideOriginalConsole({ type });
      console[type] = (...args) => {
        dispatch.appendLog({
          log: args,
          type
        });
        o_log(...args);
      };
    });
    commit.enableLogging();
  },
  toggleLogging: ctx => {
    const { commit, dispatch } = moduleCtx(ctx);
    state.logging ? commit.disableLogging() : dispatch.enableLogging();
  },
  appendLog: (ctx, opts) => {
    const { commit } = moduleCtx(ctx);
    const args = opts.log as any[];
    const type = opts.type as LogType;

    let lastLogIndex = state.logs.length - 1;
    if (
      state.logs.length > 0 &&
      state.logs[lastLogIndex].args == args &&
      state.logs[lastLogIndex].type == type &&
      state.logs[lastLogIndex] instanceof LogEntry
    ) {
      commit.updateLastLogCounter(lastLogIndex);
    } else {
      commit.appendLog(new LogEntry(args, type));
    }
  }
});

const mod = defineModule({
  state,
  mutations,
  actions,
  namespaced: true
});

export default mod;

const moduleCtx = (context: any) => moduleActionContext(context, mod);
