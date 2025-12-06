/**
 * Type definitions for the Vedic Astrology Agent
 * Single Responsibility: Define all shared types and interfaces
 */

export interface UserData {
  name?: string;
  date: string;
  time: string;
  location: {
    name?: string;
    lat: number;
    lon: number;
  };
  timezone?: string;
}

export interface ChartData {
  planets?: Record<string, any>;
  houses?: Record<string, any>;
  ascendant?: any;
  [key: string]: any;
}

export interface AgentState {
  messages: any[];
  system: string;
}

export interface ToolExecutionContext {
  userData: UserData;
  chartData?: ChartData;
}

export interface TransitParams {
  current_date: string;
  years?: number;
  include_moon?: boolean;
}

export interface VargaParams {
  varga_num: number;
}

export interface VarshaphalaParams {
  age: number;
}

export interface DashaParams {
  date: string;
  time: string;
  lat: number;
  lon: number;
}

export interface BirthChartParams {
  date: string;
  time: string;
  lat: number;
  lon: number;
}

export type ToolName = 'getTransits' | 'getVargaChart' | 'getVarshaphala' | 'getDasha' | 'getBirthChart';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}
