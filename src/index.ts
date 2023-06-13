import { useProcReg, ProcessContext } from './registry.js';
import { useProcess } from './useProcess.js';
import { useResource } from './useResource.js';

const Registry = ProcessContext.Provider;

export { useProcess, useResource, useProcReg, Registry };
