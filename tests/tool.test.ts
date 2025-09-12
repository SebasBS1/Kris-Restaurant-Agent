import { getAvailability, lockBookingSlot, User, makeReservation } from "../src/kris"

// Caso de prueba completo.
async function testComplete(input: any) {
  let res: any;                                                     // Resultado final.                               // RID
  const DATE_TIME: string = input.date_time || "";                  // Fecha.
  const PARTY_SIZE: number = input.party_size || 0;                 // No. personas.
  let RID: number = input.rid || 80000;
  const USER: User = input.user || {};                              // Datos del usuario.
  const AVAIL = await getAvailability(RID, DATE_TIME, PARTY_SIZE);  // Disponibilidad.

  // Si no hay datos válidos en la fecha y el número de personas, establecer un RID inválido.
  ((DATE_TIME == "" || DATE_TIME == null) && (PARTY_SIZE < 1 || PARTY_SIZE == null)) ? RID = 80000 : RID = input.rid;

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
    rid: 1074796,
    date_time: "2025-03-05T08:00",
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

  return testComplete(input).then(
    res => {expect(res.data.message).toBe("1074796. We have a 5 minute grace period. Please call " + 
      "us if you are running later than 5 minutes after your reservation time.<br /><br />" + 
      "We may contact you about this reservation, so please ensure your email and phone number " + 
      "are up to date.<br /><br />Your table will be reserved for 1 hour 30 minutes for parties of " + 
      "up to 2; 2 hours for parties of up to 4; 2 hours 30 minutes for parties of up to 6; and 3 hours" + 
      " for parties of 7+.");}
  );
});

// Caso 2. Error si la hora no está disponible.
test("2.- Error si la fecha y el número de personas son inválidos.", () => {
  // Datos de entrada.
  const input = {
    rid: 5,
    date_time: "",
    party_size: 0,
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

  return testComplete(input).then(
    res => {expect(res.data.message).toBe("Mesa no disponible.");}
  );
});