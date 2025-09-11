import readline from 'readline';
import { getAvailability, lockBookingSlot } from './kris';

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

  const choice = await ask("ESCRIBE 'a' PARA CHECAR AVAILABILITY, 'l' PARA LOCK SLOT");

  if (choice.toLowerCase() === 'a') {
    const avail = await getAvailability(rid, datetime, people);

    if (!avail.success) {
      console.log("Error:", avail.error);
    }
    else{
      console.log("Disponible: ", Boolean(avail.available));

      if (avail.available) {
        console.log("Su horario esta disponible, haciendo slotlock");
        const lock = await lockBookingSlot(rid, datetime, people);
        if (!lock.success) {
          console.log("Lock falló:", lock.error);
        } 
        else {
          console.log("Lock OK:", lock.data);
        }
      } else {
        console.log("No hay disponibilidad para ese horario");
      }
    }
  } else if (choice.toLowerCase() === 'l') {
    const lock = await lockBookingSlot(rid, datetime, people);
    console.log("Lock result:", lock);
  } else {
    console.log("????");
  }

  rl.close();
}

main();
