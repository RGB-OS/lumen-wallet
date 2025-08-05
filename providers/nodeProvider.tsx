import { apiService } from "@/services/api";
import { AddressResponse, BTCBalance, ListAssetsResponse, ListTransfersResponse, NetworkInfoResponse, NodeInfoResponse } from "@/types/rgb-types";
import { createContext, PropsWithChildren, useEffect, useContext, useState,useRef } from "react";
import { useParams } from "react-router-dom";



export interface RLNApiData {
    nodeinfo?: NodeInfoResponse;
    address?: AddressResponse;
    listchannels?: Array<any>;
    listpeers?: Array<any>;
    btcbalance?: BTCBalance;
    listtransfers?: ListTransfersResponse;
    listtransactions?: Array<any>;
    listassets?: ListAssetsResponse;
    networkinfo?: NetworkInfoResponse;
    [key: string]: unknown;
}



interface RLNApiContextType {
    data: RLNApiData;
    statuses: Record<string, FetchStatus>;
    errors: Record<string, string | null>;
    fetching: boolean;
    fetchApi:<T = unknown>(
        path: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        body?: any
      ) => Promise<{ data: T | null; error: string | null }>;
    initRLNData: () => Promise<void>;
    updateRLNData: (path: string, data: unknown) => void;
    getRouteData: <T>(path: string) => { data?: T; error?: string | null; status?: FetchStatus };
    refetchPath: (path: string) => Promise<void>;
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';
type RLNApiMeta = Record<string, FetchStatus>;

let hasRunRLNInit = false
export const RLNApiProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [rlnApiData, setRlnApiData] = useState<Record<string, any>>({});
    const [fetching, setFetching] = useState(false);

    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [statuses, setStatuses] = useState<RLNApiMeta>({});
    const hasRun = useRef(false)
    useEffect(() => {
        if (hasRunRLNInit) return
        hasRunRLNInit = true
    
        console.log('RLNApiProvider useEffect called once')
        initRLNData()
      }, [])

    const initRLNData = async () => {
        setFetching(true);
        const responses = await makeApiCalls(nodeApiCall);

        const newData: RLNApiData = {};
        const newErrors: Record<string, string | null> = {};
        const newStatuses: RLNApiMeta = {};

        for (const res of responses) {
            newData[res.path] = res.data;
            newErrors[res.path] = res.error ?? null;
            newStatuses[res.path] = res.error ? 'error' : 'success';
        }

        setRlnApiData((prev) => ({ ...prev, ...newData }));
        setErrors((prev) => ({ ...prev, ...newErrors }));
        setStatuses((prev) => ({ ...prev, ...newStatuses }));
        setFetching(false);
    };


    const updateRLNData = (path: string, data: unknown) => {
        setRlnApiData((prev) => ({ ...prev, [path]: data }));
    };

    const getRouteData = <T,>(path: string): { data?: T; error?: string | null; status?: FetchStatus } => {
        return {
            data: rlnApiData[path] as T | undefined,
            error: errors[path] ?? null,
            status: statuses[path] ?? 'idle'
        };
    };

    const refetchPath = async (path: string) => {
        const call = nodeApiCall.find((c) => c.path === path);
        if (!call) return;

        setStatuses((prev) => ({ ...prev, [path]: 'loading' }));
        try {
            const response = await apiService.getApiInstance().request({
                method: call.method,
                url: `/${call.path}`,
                data: call.body
            });
            updateRLNData(path, response.data);
            setErrors((prev) => ({ ...prev, [path]: null }));
            setStatuses((prev) => ({ ...prev, [path]: 'success' }));
        } catch (error: any) {
            setErrors((prev) => ({ ...prev, [path]: error.message || 'Unknown error' }));
            setStatuses((prev) => ({ ...prev, [path]: 'error' }));
        }
    };

    const fetchApi = async <T = unknown>(
        path: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        body?: any
      ): Promise<{ data: T | null; error: string | null }> => {
        const key = `${path}:${JSON.stringify(body ?? {})}`;
        setStatuses((prev) => ({ ...prev, [key]: 'loading' }));
      
        try {
          const response = await apiService.getApiInstance().request({
            method,
            url: `/${path}`,
            data: body,
          });
      
          setRlnApiData((prev) => ({ ...prev, [key]: response.data }));
          setStatuses((prev) => ({ ...prev, [key]: 'success' }));
          setErrors((prev) => ({ ...prev, [key]: null }));
      
          return { data: response.data, error: null };
        } catch (err: any) {
          const errorMessage = err?.message || 'Unknown error';
          setStatuses((prev) => ({ ...prev, [key]: 'error' }));
          setErrors((prev) => ({ ...prev, [key]: errorMessage }));
          return { data: null, error: errorMessage };
        }
      };
    

    return (
        <RLNApiContext.Provider value={{
            data: rlnApiData,
            statuses,
            errors,
            fetching,
            initRLNData,
            updateRLNData,
            getRouteData,
            fetchApi,
            refetchPath,
            
        }}>
            {children}
        </RLNApiContext.Provider>
    );
}

export const useRLNApi = (): RLNApiContextType => {
    const context = useContext(RLNApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
};

export function useRLNState<T>(path: string): {
    data: T | undefined;
    status: FetchStatus;
    error: string | null;
    refetch: () => Promise<void>;
} {
    const { data, statuses, errors, refetchPath } = useRLNApi();

    return {
        data: data[path] as T | undefined,
        status: statuses[path] ?? 'idle',
        error: errors[path] ?? null,
        refetch: () => refetchPath(path)
    };
}


interface ApiCall {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: any;
}

const nodeApiCall: ApiCall[] = [
    { method: 'GET', path: 'networkinfo' },
    { method: 'POST', path: 'address' },
    { method: 'GET', path: 'listchannels' },
    // { method: 'GET', path: 'listpeers' },
    { method: 'POST', path: 'btcbalance', body: { skip_sync: false } },
    // { method: 'POST', path: 'listtransactions', body: { skip_sync: false } },
    {
        method: 'POST', path: 'listassets', body: {
            "filter_asset_schemas": [
                "Nia",
                "Uda",
                "Cfa"
            ]
        }
    }
];
const RLNApiContext = createContext<RLNApiContextType | undefined>(undefined);

interface RLNApiCallResponse<T = unknown> extends ApiCall {
    data: T;
    error?: string;
}


async function makeApiCalls(apiCalls: ApiCall[]): Promise<RLNApiCallResponse[]> {
    return Promise.all(
        apiCalls.map(async (call) => {
            try {
                const response = await apiService.getApiInstance().request({
                    method: call.method,
                    url: `/${call.path}`,
                    data: call.body,
                });
                return { ...call, data: response.data };
            } catch (error: any) {
                return {
                    ...call,
                    data: null,
                    error: error?.response?.data?.message || error.message || 'Unknown error',
                };
            }
        })
    );
}

