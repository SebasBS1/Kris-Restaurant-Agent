/**
 * KrisRestaurantAgent - Restaurant booking agent.
 * 
 * This AI Spine tool provides basic text processing capabilities with configurable
 * parameters and robust input validation. It demonstrates the fundamental patterns
 * for building AI Spine compatible tools.
 * 
 * Generated on 2025-09-05 using create-ai-spine-tool v1.0.0
 * Template: , Language: typescript
 * 
 * @fileoverview Main tool implementation for kris-restaurant-agent
 * @author AI Spine Developer
 * @since 1.0.0
 */

// Load environment variables from .env file
import 'dotenv/config';

import { createTool, stringField, numberField, booleanField, apiKeyField, arrayField, timeField, dateField } from '@ai-spine/tools';

/**
 * Input interface defining the structure of data that users will provide
 * to this tool. This interface ensures type safety and enables automatic
 * validation and documentation generation.
 */
interface KrisRestaurantAgentInput {
  query: string;
  date: string;
  time: string;
  people: number;
  country: string;
  sortby: (string|number)[]; // Ordenar restaurantes, permite calificación, los más nuevos, así como su distancia.
  maximum: number;
  pricing: string;           // $$, $$$, $$$$
  amneties: string;          // wheelchair access o vacío
  seating: string;           // bar, counter, outdoor, high top
}

/**
 * Configuration interface defining settings that can be provided via
 * environment variables or configuration files. These settings typically
 * include API keys, service endpoints, and operational parameters.
 */
interface KrisRestaurantAgentConfig {
  /** Optional API key for external service integrations */
  api_key?: string;
  /** Default count value when not specified in input */
  default_count?: number;
}

/**
 * Main tool instance created using the AI Spine createTool factory.
 * This tool implements the universal AI Spine contract, making it compatible
 * with all AI Spine platforms and runtimes.
 */
const krisRestaurantAgentTool = createTool<KrisRestaurantAgentInput, KrisRestaurantAgentConfig>({
  /**
   * Tool metadata provides information about the tool's identity,
   * capabilities, and usage. This information is used for documentation
   * generation, tool discovery, and runtime introspection.
   */
  metadata: {
    name: 'kris-restaurant-agent',
    version: '1.0.0',
    description: 'Restaurant booking agent.',
    capabilities: ['text-processing'],
    author: 'KRIS Development Team',
    license: 'MIT',
  },

  /**
   * Schema definition describes the structure and validation rules for
   * both input data and configuration. The AI Spine framework uses this
   * schema to automatically validate inputs, generate documentation,
   * and provide type safety.
   */
  schema: {
    /**
     * Input schema defines the fields that users can provide when
     * executing this tool. Each field includes validation rules,
     * descriptions, and default values.
     */
    input: {
      query: stringField({
        required: true,
        description: 'Búsqueda',
        minLength: 1,
        maxLength: 500,
      }),
      date: dateField({
        required: true,
        description: 'Fecha',
        minDate: '2025-01-01',
        maxDate: '2025-12-31'
      }),
      time: timeField({
        required: true,
        description: 'Hora',
        example: '10:00'
      }),
      people: numberField({
        required: true,
        description: 'Número de personas',
        min: 1,
        max: 10,
        default: 1,
      }),
      country: stringField({
        required: true,
        description: 'País',
        minLength: 1,
        maxLength: 50,
      }),
      sortby: arrayField(
        stringField({minLength: 1, maxLength: 50}),
        {
          required: false,
          minItems: 0,
          maxItems: 3,
          uniqueItems: true,
          description: "Arreglo que contiene datos para ordenar las opciones de restaurantes.",
        }
      ),
      maximum: numberField({
        required: false,
        min: 1,
        max: 20,
        description: 'Número máximo de resultados',
        default: 5,
      }),
      pricing: stringField({
        required: true,
        minLength: 2,
        maxLength: 4,
        description: 'Rango de precios de restaurantes',
        default: '$$',
      }),
      amneties: stringField({
        required: false,
        minLength: 1,
        maxLength: 100,
        description: 'Rango de precios de restaurantes',
        default: '$$',
      }),
      seating: stringField({
        required: true,
        minLength: 1,
        maxLength: 20,
        description: 'Luegar donde las personas se sentarán.',
        default: 'counter',
      })
    },

    /**
     * Configuration schema defines settings that can be provided via
     * environment variables or configuration files. These are typically
     * used for API keys, service endpoints, and operational parameters.
     */
    config: {
      api_key: apiKeyField({
        required: false,
        description: 'Optional API key for external services',
      }),
      default_count: {
        type: 'number',
        required: false,
        description: 'Default count when not specified in input',
        default: 1,
      },
    },
  },

  /**
   * The execute function contains the main business logic of the tool.
   * It receives validated input data, configuration, and execution context,
   * then performs the requested operation and returns structured results.
   * 
   * @param input - Validated input data matching the input schema
   * @param config - Configuration settings from environment/config files  
   * @param context - Execution context with metadata and tracking information
   * @returns Promise resolving to structured execution results
   */
  async execute(input, config, context) {
    console.log(`Executing kris-restaurant-agent tool with execution ID: ${context.executionId}`);

    try {
      // Get the count from input or config default
      // This demonstrates how to merge input parameters with configuration defaults
      const count = input.count ?? config.default_count ?? 1;
      
      // Process the message according to the specified transformations
      let processedMessage = input.message;
      
      if (input.uppercase) {
        processedMessage = processedMessage.toUpperCase();
      }

      // Repeat the message according to the count parameter
      const result = Array(count).fill(processedMessage).join(' ');

      // Simulate some processing time (remove this in real implementations)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Return structured results following AI Spine conventions
      // The response includes the processed data, metadata, and execution information
      return {
        status: 'success',
        data: {
          processed_message: result,
          original_message: input.message,
          transformations: {
            uppercase: input.uppercase || false,
            count: count,
          },
          metadata: {
            execution_id: context.executionId,
            timestamp: context.timestamp.toISOString(),
            tool_version: '1.0.0',
          },
        },
      };
    } catch (error) {
      console.error('Error processing message:', error);
      // Always provide meaningful error messages to help users troubleshoot issues
      throw new Error(`Failed to process message: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/**
 * Main entry point that starts the tool server with configurable options.
 * The server exposes REST endpoints that comply with the AI Spine universal contract:
 * - GET /health - Health check and tool metadata
 * - POST /execute - Execute the tool with input data
 * - GET /schema - Tool schema and documentation
 * 
 * Configuration is loaded from environment variables, allowing for flexible
 * deployment across different environments.
 */
async function main() {
  try {
    await krisRestaurantAgentTool.start({
      // Server configuration from environment variables with sensible defaults
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      host: process.env.HOST || '0.0.0.0',
      
      // Development features for easier debugging and testing
      development: {
        requestLogging: process.env.NODE_ENV === 'development'
      },
      
      // Security configuration for production deployments
      security: {
        requireAuth: process.env.API_KEY_AUTH === 'true',
        ...(process.env.VALID_API_KEYS && { apiKeys: process.env.VALID_API_KEYS.split(',') }),
      },
    });
    
    console.log(`🚀 KrisRestaurantAgent tool server started successfully`);
    console.log(`📡 Listening on port ${process.env.PORT || 3000}`);
    console.log(`🔗 Health check: http://localhost:${process.env.PORT || 3000}/health`);
  } catch (error) {
    console.error('Failed to start tool server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handlers ensure the tool server stops cleanly when
 * receiving termination signals. This is important for:
 * - Completing ongoing requests
 * - Cleaning up resources
 * - Proper logging and monitoring
 * - Container orchestration compatibility
 */

// Handle SIGINT (Ctrl+C) for graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Received SIGINT, shutting down gracefully...');
  await krisRestaurantAgentTool.stop();
  process.exit(0);
});

// Handle SIGTERM (container/process manager termination) for graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully...');
  await krisRestaurantAgentTool.stop();
  process.exit(0);
});

// Start the server if this file is run directly (not when imported as a module)
if (require.main === module) {
  main();
}

/**
 * Export the tool instance for use in tests, other modules, or programmatic usage.
 * This allows the tool to be imported and used without starting the HTTP server.
 */
export default krisRestaurantAgentTool;