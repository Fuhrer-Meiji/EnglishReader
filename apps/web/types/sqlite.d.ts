declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string, options?: { readOnly?: boolean });
    prepare(sql: string): {
      get(...params: any[]): any;
      all(...params: any[]): any[];
      run(...params: any[]): any;
    };
    exec(sql: string): void;
    close(): void;
  }
}
