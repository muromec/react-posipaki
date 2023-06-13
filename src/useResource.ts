import { xfetch, FetchState, FetchArgs } from 'pspki/dist/xfetch.js';
import { useProcess } from './useProcess.js';

type Props = {
  url: URL,
  id: string,
  assumeLoading?: boolean,
};

type Result<T> = {
  isLoading: boolean,
  items?: T,
};

export function useResource<DataType>({ url, id, assumeLoading = true } : Props) : Result<DataType> {
  const { pstate } = useProcess<FetchArgs, FetchState<DataType>>(xfetch, id, { url });

  if (!pstate) {
    return { isLoading: assumeLoading };
  }
  if (!pstate.data) {
    return { isLoading: pstate.code === 'loading' };
  }

  return { items: pstate.data, isLoading: pstate.code === 'loading' };
}
