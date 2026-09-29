// MS SQL Server connection configuration and fallback handler
// Compatible with:
// user: 'sa', password: 'Admin123!', server: '127.0.0.1', port: 1433, database: 'tracker'

export interface MsSqlConfig {
  user: string;
  password?: string;
  server: string;
  port: number;
  database: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

export const mssqlConfig: MsSqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Admin123!',
  server: process.env.DB_SERVER || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'tracker',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
};

let isConnected = false;
let mssqlModule: any = null;
let connectionPool: any = null;

export async function initMsSql() {
  try {
    // Dynamic import to prevent crash if mssql is not installed locally
    // @ts-ignore
    mssqlModule = await import('mssql').catch(() => null);
    if (!mssqlModule) {
      console.log('ℹ️ Пакет mssql не установлен в node_modules — сервер использует локальную БД data/db.json.');
      return false;
    }

    const sql = mssqlModule.default || mssqlModule;
    connectionPool = new sql.ConnectionPool({
      ...mssqlConfig,
      connectionTimeout: 2000,
      requestTimeout: 2000,
    });

    await connectionPool.connect();
    isConnected = true;
    console.log('✅ База данных MS SQL успешно подключена через порт 1433 (база tracker)!');
    return true;
  } catch (err: any) {
    isConnected = false;
    console.log(`ℹ️ MS SQL Server (порт 1433) недоступен (${err.message}) — используется локальная БД data/db.json.`);
    return false;
  }
}

export function isMsSqlConnected(): boolean {
  return isConnected;
}

export function getMsSqlPool(): any {
  return connectionPool;
}
