interface BuildInfo { sha: string; date: string; environment: string; version: string }
declare const __BUILD_INFO__: BuildInfo;
export const BUILD: BuildInfo = typeof __BUILD_INFO__ === 'undefined'
  ? { sha: 'simulation', date: 'deterministic harness', environment: 'simulation', version: '1.0' }
  : __BUILD_INFO__;
