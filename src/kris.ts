import 'dotenv/config';
import axios from 'axios';


function sameMinute(a: string, b: string): boolean {
  return a.slice(0, 16) === b.slice(0, 16);
}

export async function getAvailability(rid: number, datetime: string, people: number) {
  let url = `https://3fec281f-2e92-4e55-9ac9-0d882526eb2b.mock.pstmn.io/availability/?party_size=${people}&date_time=${datetime}&id=${rid}`;

  // Si no hay datos válidos en la fecha y el número de personas, establecer un RID inválido.
  if ((datetime == "" || datetime == null) && (people < 1 || people == null)){
    rid = 80000;
    url = `https://3fec281f-2e92-4e55-9ac9-0d882526eb2b.mock.pstmn.io/availability/?id=${rid}`;
  }

  try {
    const response = await axios.get(url, {
      params: {
        party_size: people,
        date_time: datetime,
        reservation_attribute: 'default',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    if (typeof data?.party_size === 'number' && people > data.party_size) {
      return {
        success: true,
        available: false,
      };
    }

    if (Array.isArray(data?.times)) {
      const hit = data.times.find((t: any) => typeof t === 'string' && sameMinute(t, datetime));
      return { success: true, available: !!hit };
    }

    return { success: true, available: false };
  } catch (error: any) {
    console.error(
      'Error al obtener disponibilidad en OpenTable:',
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

export async function lockBookingSlot(rid: number, datetime: string, people: number) {
  const url = `https://3fec281f-2e92-4e55-9ac9-0d882526eb2b.mock.pstmn.io/${rid}/lock?id=${rid}`;

  try {
    const response = await axios.post(
      url,
      {
        party_size: people,
        date_time: datetime,
        reservation_attribute: 'default',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data, //response.data.reservation_token
    };
  } catch (error: any) {
    console.error('Error al crear slot lock en OpenTable:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

export type User = {
  firstName: string;
  lastName: string;
  phone: Phone;
  specialRequest: string | null;
};
export type Phone = {
  number: Number;
  country_code: string;
  phone_type: string;
};

export async function getInfo() {
  //crea un tipo User que se mandará a makeReservation
}
export async function makeReservation(rid: number, datetime: string, people: number, user: User) {
  const lock = await lockBookingSlot(rid, datetime, people);
  const url = `https://3fec281f-2e92-4e55-9ac9-0d882526eb2b.mock.pstmn.io/reservations?id=${rid}`;

  if (!lock.success) {
    console.log('Lock falló:', lock.error);
  } else {
    console.log('Lock OK:', lock.data);
    try {
      const response = await axios.post(url, {
        reservation_token: lock.data.reservation_token,
        reservation_attribute: 'default',
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone,
        special_request: user.specialRequest,
      });
      return {
        success: true,
        data: response.data, //response.data.reservation_token
      };
    } catch (error: any) {
      console.error(
        'Error al reservar:',
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }
}
