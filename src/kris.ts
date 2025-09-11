import 'dotenv/config';
import axios from 'axios';

import { createTool, stringField, numberField, booleanField, apiKeyField, arrayField, timeField, dateField, objectField, datetimeField } from '@ai-spine/tools';

function sameMinute(a: string, b: string): boolean {
  return a.slice(0, 16) === b.slice(0, 16);
}

export async function getAvailability(rid: number, datetime: string, people: number) {
  const url = `https://3fec281f-2e92-4e55-9ac9-0d882526eb2b.mock.pstmn.io/availability/${rid}?partysize=${people}&date_time=${datetime}`;

  try {
    const response = await axios.get(url, {
      params: {
        party_size: people,
        date_time: datetime,
        reservation_attribute: "default"
      },
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = response.data;

    if (Array.isArray(data?.times)) {
      const hit = data.times.find((t: any) => typeof t === "string" && sameMinute(t, datetime));
      return { success: true, available: !!hit };
    }

    return { success: true, available: false };
  } catch (error: any) {
    console.error("Error al obtener disponibilidad en OpenTable:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}



export async function lockBookingSlot(rid: number, datetime: string, people: number) {
  const url = `https://3fec281f-2e92-4e55-9ac9-0d882526eb2b.mock.pstmn.io/${rid}/lock`;

  try {
    const response = await axios.post(
      url,
      {
        "party_size": people,
        "date_time":datetime,
        "reservation_attribute":"default"
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return {
      success: true,
      data: "reservation" //response.data.reservation_token
    };
  } catch (error: any) {
    console.error("Error al crear slot lock en OpenTable:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

