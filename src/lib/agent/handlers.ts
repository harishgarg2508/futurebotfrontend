/**
 * Tool Handlers - Backend API integration for each tool
 * Single Responsibility: Execute backend API calls for astrological calculations
 * 
 * Each handler follows the same pattern:
 * 1. Receives parameters and user context
 * 2. Calls the appropriate backend endpoint
 * 3. Returns structured result with success/error status
 */

import backendClient from '@/lib/backendClient';
import { 
  UserData, 
  ToolResult,
  TransitParams,
  VargaParams,
  VarshaphalaParams,
  DashaParams,
  BirthChartParams 
} from './types';

/**
 * Base handler class for common functionality
 */
abstract class BaseToolHandler {
  protected async executeRequest(
    endpoint: string, 
    payload: Record<string, any>
  ): Promise<ToolResult> {
    try {
      console.log(`[Tool Handler] Calling ${endpoint} with payload:`, JSON.stringify(payload));
      const response = await backendClient.post(endpoint, payload);
      console.log(`[Tool Handler] ${endpoint} response received successfully`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      // Enhanced error logging
      const errorDetails = {
        endpoint,
        payload,
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        baseURL: error?.config?.baseURL,
      };
      console.error(`[Tool Handler Error] ${endpoint}:`, JSON.stringify(errorDetails, null, 2));
      
      // Create a user-friendly error message
      let userMessage = 'Unknown error occurred';
      if (error?.response?.status === 503) {
        userMessage = 'Backend server is starting up. Please try again in a few seconds.';
      } else if (error?.response?.status === 404) {
        userMessage = `Endpoint ${endpoint} not found on backend server.`;
      } else if (error?.response?.status === 500) {
        userMessage = 'Backend server error. Please check the server logs.';
      } else if (error?.code === 'ECONNREFUSED') {
        userMessage = 'Cannot connect to backend server. Is it running?';
      } else if (error?.message) {
        userMessage = error.message;
      }
      
      return {
        success: false,
        error: userMessage,
      };
    }
  }
}

/**
 * Handler for Transit calculations
 */
export class TransitHandler extends BaseToolHandler {
  async execute(params: TransitParams, userData: UserData): Promise<ToolResult> {
    const payload = {
      date: userData.date,
      time: userData.time,
      lat: userData.location.lat,
      lon: userData.location.lon,
      current_date: params.current_date,
      years: params.years ?? 1.0,
      include_moon: params.include_moon ?? true,
    };

    return this.executeRequest('/calculate/transits', payload);
  }
}

/**
 * Handler for Varga (Divisional) Chart calculations
 */
export class VargaHandler extends BaseToolHandler {
  async execute(params: VargaParams, userData: UserData): Promise<ToolResult> {
    const payload = {
      date: userData.date,
      time: userData.time,
      lat: userData.location.lat,
      lon: userData.location.lon,
      varga_num: params.varga_num,
    };

    return this.executeRequest('/calculate/varga', payload);
  }
}

/**
 * Handler for Varshaphala (Annual Solar Return) calculations
 */
export class VarshaphalaHandler extends BaseToolHandler {
  async execute(params: VarshaphalaParams, userData: UserData): Promise<ToolResult> {
    const payload = {
      date: userData.date,
      time: userData.time,
      lat: userData.location.lat,
      lon: userData.location.lon,
      age: params.age,
    };

    return this.executeRequest('/calculate/varshaphala', payload);
  }
}

/**
 * Handler for Dasha period calculations
 */
export class DashaHandler extends BaseToolHandler {
  async execute(userData: UserData): Promise<ToolResult> {
    const payload = {
      date: userData.date,
      time: userData.time,
      lat: userData.location.lat,
      lon: userData.location.lon,
      timezone: userData.timezone,
    };

    return this.executeRequest('/calculate/dasha', payload);
  }
}

/**
 * Handler for Birth Chart calculations
 */
export class BirthChartHandler extends BaseToolHandler {
  async execute(userData: UserData): Promise<ToolResult> {
    const payload = {
      date: userData.date,
      time: userData.time,
      lat: userData.location.lat,
      lon: userData.location.lon,
    };

    return this.executeRequest('/calculate/chart', payload);
  }
}

/**
 * Tool Handler Registry - Factory pattern for getting the right handler
 */
export class ToolHandlerRegistry {
  private static transitHandler = new TransitHandler();
  private static vargaHandler = new VargaHandler();
  private static varshaphalaHandler = new VarshaphalaHandler();
  private static dashaHandler = new DashaHandler();
  private static birthChartHandler = new BirthChartHandler();

  static getTransitHandler(): TransitHandler {
    return this.transitHandler;
  }

  static getVargaHandler(): VargaHandler {
    return this.vargaHandler;
  }

  static getVarshaphalaHandler(): VarshaphalaHandler {
    return this.varshaphalaHandler;
  }

  static getDashaHandler(): DashaHandler {
    return this.dashaHandler;
  }

  static getBirthChartHandler(): BirthChartHandler {
    return this.birthChartHandler;
  }
}

// Export singleton instances for convenience
export const transitHandler = ToolHandlerRegistry.getTransitHandler();
export const vargaHandler = ToolHandlerRegistry.getVargaHandler();
export const varshaphalaHandler = ToolHandlerRegistry.getVarshaphalaHandler();
export const dashaHandler = ToolHandlerRegistry.getDashaHandler();
export const birthChartHandler = ToolHandlerRegistry.getBirthChartHandler();
