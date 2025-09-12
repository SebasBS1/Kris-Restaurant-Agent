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
import axios from 'axios';
import { createTool, stringField, numberField, apiKeyField, objectField } from '@ai-spine/tools';
import { getAvailability, lockBookingSlot, User, makeReservation } from "./kris"

/**
 * Interfaz de los datos de entrada del agente.
 *
interface KrisRestaurantAgentInput {
  rid: number; //restaurant id
  city: string;      // Ciudad.
  date_time: string;   // Fecha y hora.
  party_size: number;     // Cantidad de personas.
  country: string;    // País.
  maximum: number;    // Número máximo de resultados.
  pricing: string;    // $$, $$$, $$$$
  amneties: string;   // wheelchair access o vacío
  seating: string;    // bar, counter, outdoor, high top
}
**/

interface KrisRestaurantAgentInput {
  rid: number;         // Restaurant id
  date_time: string;   // Fecha de reservación.
  party_size: number;  // Cantidad de personas.
  user: User;          // Datos del usuario.
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

// Crear la herramienta del agente.
const krisRestaurantAgentTool = createTool<KrisRestaurantAgentInput, KrisRestaurantAgentConfig>({
  // Metadatos del agente.
  metadata: {
    name: 'kris-restaurant-agent',
    version: '1.0.0',
    description: 'Restaurant booking agent.',
    capabilities: ['text-processing', 'booking'],
    author: 'KRIS Development Team',
    license: 'MIT',
  },

  // Esquema (schema) de la reservación.
  schema: {
    // Configurar datos de entrada de la reservación.
    input: {
      rid: numberField({
        required: true,
        description: "Restaurant ID (RID)",
      }),
      date_time: stringField({
        required: true,
        description: 'Horario',
        minLength: 16,
        maxLength: 16
      }),
      party_size: numberField({
        required: true,
        description: 'Número de personas',
        min: 1,
        default: 1,
      }),
      user: objectField({
        firstName: stringField({
          required: true,
          description: "Nombre(s) del usuario"
        }),
        lastName: stringField({
          required: true,
          description: "Apellido(s) del usuario"
        }),
        phone: objectField({
          number: numberField({
            required: true,
            description: "Número de teléfono",
            min: 0
          }),
          country_code: stringField({
            required: true,
            description: "Código del país del usuario",
            minLength: 2
          }),
          phone_type: stringField({
            required: true,
            description: "Tipo de teléfono"
          }),
        }, { required: true, description: "Número de teléfono" }),
        specialRequest: stringField({
          required: true,
          description: "Petición del usuario"
        }),
      }, { required: true, description: "Datos del usuario" })
    },

    /**
     * Configuration schema defines settings that can be provided via
     * environment variables or configuration files. These are typically
     * used for API keys, service endpoints, and operational parameters.
     */
    
    // Definir la configuración del agente.
    config: {
      api_key: apiKeyField({
        required: false,
        description: 'Clave de API no obligatoria para utilizar el agente con otros servicios',
      }),
      /*
      default_count: {
        type: 'number',
        required: false,
        description: 'Default count when not specified in input',
        default: 1,
      },*/
    },
  },

  /**
   * Lógica del negocio y procesamiento de la entrada.
   * 
   * @param input - Datos de entrada.
   * @param config - Configuración del agente.  
   * @param context - Contexto en la ejecución que contiene datos de seguimiento y los metadatos del agente.
   * @returns - Devuelve los resultados de la ejecución
   */

  async execute(input, config, context) {
    console.log(`Executing kris-restaurant-agent tool with execution ID: ${context.executionId}`);

    try {
      
      let res: any;                                                     // Resultado final.
      const RID: number = input.rid || 0;                               // RID
      const DATE_TIME: string = input.date_time || "";                  // Fecha.
      const PARTY_SIZE: number = input.party_size || 0;                 // No. personas.
      const USER: User = input.user || {};                              // Datos del usuario.
      const AVAIL = await getAvailability(RID, DATE_TIME, PARTY_SIZE);  // Disponibilidad.
      
      // Checar si la fecha está disponible.
      if (!AVAIL.success) {
        console.log("Error:", AVAIL.error);
      }
      else {
        console.log(`\nDisponible: ${Boolean(AVAIL.available)}`);

        if (AVAIL.available) {
          // Realizar la reservación.
          const RESERVATION = await makeReservation(RID, DATE_TIME, PARTY_SIZE, USER);
          res = RESERVATION;
          if (RESERVATION?.success) {
            console.log("\nLa reservación se realizó con éxito.\n")
            console.log(`\n${RESERVATION.data}\n`)
          }
        } else {
          console.log("\nNo hay disponibilidad para ese horario.\n");
          res = {success: false, data: {message: "Mesa no disponible."}}
        }
      }

      // Regresar información del JSON, metadatos, etc.
      return {
        status: 'success',
        data: {
          results: res,
          metadata: {
            execution_id: context.executionId,
            timestamp: context.timestamp.toISOString(),
            tool_version: '1.0.0',
          },
        },
      };
    } catch (error) {
      // Errores de procesamiento.
      console.error('Error processing message:', error);
      throw new Error(`Failed to process message: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});


/*
 * Función prinicipal.
 * GET
 * POST
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
