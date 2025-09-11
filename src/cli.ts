import readline from 'readline';
import { getAvailability, lockBookingSlot, Phone, User, makeReservation } from './kris';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log("TEST KRIS");

  const rid = parseInt(await ask("INGRESA RESTAURANT ID: "), 10);
  const datetime = await ask("INGRESA FECHA Y HORA (YYYY-MM-DDTHH:MM): ");
  const people = parseInt(await ask("INGRESA NUMERO DE PERSONAS: "), 10);
  const user = {
    firstName: "Araceli",
    lastName: "Ruiz",
    phone: {
      number: 6621139324,
      country_code: "MX",
      phone_type: "mobile",

    },
    specialRequest: "buena vista"
  }

  const choice = await ask("ESCRIBE 'a' PARA CHECAR LA DISPONIBILIDAD. ");

  if (choice.toLowerCase() === 'a') {
    const avail = await getAvailability(rid, datetime, people);

    if (!avail.success) {
      console.log("Error:", avail.error);
    }
    else{
      console.log("Disponible: ", Boolean(avail.available));

      if (avail.available) {
        const reservation = await makeReservation(rid,datetime,people,user)
        if(reservation?.success){
          console.log("La reservacion se realizó con éxito")
          console.log(reservation.data.message)
        }

      } else {
        console.log("No hay disponibilidad para ese horario");
      }
    }

  } else {
    console.log("????");
  }

  rl.close();
}

main();
