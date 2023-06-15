import { useProcReg, ProcessContext } from './registry';
import { useProcess } from './useProcess';
import { useResource } from './useResource';

const Registry = ProcessContext.Provider;

export { useProcess, useResource, useProcReg, Registry };
