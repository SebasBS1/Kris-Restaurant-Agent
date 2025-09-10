
import { createTool, stringField, numberField, booleanField, apiKeyField, arrayField, timeField, dateField, objectField, datetimeField } from '@ai-spine/tools';

export async function getAvailability(rid: number, datetime: string, people: number) {
  const url = `https://3fec281f-2e92-4e55-9ac9-0d882526eb2b.mock.pstmn.io/availability/${rid}`;

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

    return {
      success: true,
      data: response.data  // this will give you the availability slots JSON
    };
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

