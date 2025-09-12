import request from 'supertest';
import krisRestaurantAgentTool from '../src/index';
import testTool from '@ai-spine/tools-testing';
import { getAvailability, lockBookingSlot, User, makeReservation } from "../src/kris"

// Caso de prueba completo.
async function testComplete(input: any) {
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
  return res;
}

// Caso 1. Checar si una reservación está disponible.
test("1.- Checar si una reservación está disponible.", () => {
  // Datos de entrada.
  const input = {
    rid: 5,
    date_time: "2025-03-05T7:30",
    party_size: 2,
    user: {
        firstName: "José",
        lastName: "Macías",
        phone: {
            number: 6624520526,
            country_code: "MX",
            phone_type: "mobile"
        },
        specialRequest: "segundo piso"
    }
  };

  return getAvailability(input.rid, input.date_time, input.party_size).then(
    avail => {expect(avail.available).toBe(true);}
  );
});

// Caso 2. Error si la hora no está disponible.
test("2.- Error si la hora no está disponible.", () => {
  // Datos de entrada.
  const input = {
    rid: 5,
    date_time: "2025-03-05T00:00",
    party_size: 2,
    user: {
        firstName: "José",
        lastName: "Macías",
        phone: {
            number: 6624520526,
            country_code: "MX",
            phone_type: "mobile"
        },
        specialRequest: "segundo piso"
    }
  };

  return getAvailability(input.rid, input.date_time, input.party_size).then(
    avail => {expect(avail.available).toBe(false);}
  );
});