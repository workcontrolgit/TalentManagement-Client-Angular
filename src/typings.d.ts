/*
 * Extra typings definitions
 */

// Allow .json files imports
declare module '*.json';

// SystemJS module definition
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// DataTables namespace for backward compatibility
declare namespace DataTables {
  interface Settings {
    ajax?: any;
    columns?: any[];
    columnDefs?: any[];
    data?: any[];
    dom?: string;
    language?: any;
    lengthMenu?: any;
    order?: any[];
    ordering?: boolean;
    paging?: boolean;
    pageLength?: number;
    pagingType?: string;
    processing?: boolean;
    responsive?: boolean;
    searching?: boolean;
    serverSide?: boolean;
    stateSave?: boolean;
    [key: string]: any;
  }
}
