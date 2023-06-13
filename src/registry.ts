import { createContext, useContext } from 'react';
import { Process } from 'posipaki';

type Reg = {
  [key: string]: Process<unknown, unknown>;
};

export const ProcessContext = createContext<Reg>({});

export const useProcReg = ()=> useContext(ProcessContext);
