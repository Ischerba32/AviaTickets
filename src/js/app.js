import "../css/style.css";
import "./plugins";
import locations from "./store/locations";
import formUI from "./views/form";
import currencyUI from "./views/currency";
import ticketsUI from "./views/tickets";

const testTickets = [{
  airline_name: "Белавиа",
  airline_logo: "",
  origin_name: "Минск",
  destination_name: "Москва",
  departure_at: "16.12.2020 09:00",
  return_at: "18.12.2020 18:00",
  price: 480,
  transfers: 1,
  flight_number: 452
},{
  airline_name: "Turkish Airline",
  airline_logo: "",
  origin_name: "Минск",
  destination_name: "Москва",
  departure_at: "18.12.2020 09:00",
  return_at: "20.12.2020 18:00",
  price: 580,
  transfers: 2,
  flight_number: 123
},{
  airline_name: "Polish Airlines",
  airline_logo: "",
  origin_name: "Минск",
  destination_name: "Москва",
  departure_at: "14.12.2020 09:00",
  return_at: "16.12.2020 18:00",
  price: 500,
  transfers: 3,
  flight_number: 556
}];
document.addEventListener("DOMContentLoaded", (e) => {
  const form = formUI.form;
  
  ticketsUI.renderTickets(testTickets);

  const objOfAirlines = testTickets.reduce((acc, item) => {
    acc[item.airline_name] = item;
    return acc;
  }, {});
  const arrOfAirlines = Object.keys(objOfAirlines);
  const buffer = document.querySelector(".tickets-section .filter");
  buffer.innerHTML = " ";
  arrOfAirlines.forEach((item) => {
    buffer.insertAdjacentHTML(
      "afterbegin",
      `
    <p>
    <label>
    <input type="checkbox" checked="checked" value="${item}" />
    <span>${item}</span>
    </label>
    </p>
    `
    );
  });
  const inputs = document.querySelectorAll(".filter input");
  inputs.forEach((input) => {
    input.addEventListener("click", () => {
      //очистить контейнер или поля для авиакомпаний
      let arrayTemp = [];
      let inputsChecked = document.querySelectorAll("input:checked");
      inputsChecked.forEach((inputCheck) => {
        let airFiltered = testTickets.filter(
          (item) => item.airline_name == `${inputCheck.value}`
        );

        arrayTemp = arrayTemp.concat(airFiltered);
      });
      arrayTemp.sort((prev, next) =>
        prev.departure_at > next.departure_at ? 1 : -1
      );
      ticketsUI.renderTickets(arrayTemp);
    });
  });


  // Events
  initApp();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    onFormSubmit();
  });

  // handlers
  async function initApp() {
    await locations.init();
    formUI.setAutocompleteData(locations.shortCities);
  }

  async function onFormSubmit() {
    try {
      const origin = locations.getCityCodeByKey(formUI.originValue);
      const destination = locations.getCityCodeByKey(formUI.destinationValue);
      const depart_date = formUI.departDateValue;
      const return_date = formUI.returnDateValue;
      const currency = currencyUI.currecyValue;

      await locations.fetchTickets({
        origin,
        destination,
        depart_date,
        return_date,
        currency,
      });
      ticketsUI.renderTickets(locations.lastSearch);
      
      console.log(locations.lastSearch);

      const objOfAirlines = locations.lastSearch.reduce((acc, item) => {
        acc[item.airline_name] = item;
        return acc;
      }, {});
      const arrOfAirlines = Object.keys(objOfAirlines);
      const buffer = document.querySelector(".tickets-section .filter");
      buffer.innerHTML = " ";
      arrOfAirlines.forEach((item) => {
        buffer.insertAdjacentHTML(
          "afterbegin",
          `
        <p>
        <label>
        <input type="checkbox" checked="checked" value="${item}" />
        <span>${item}</span>
        </label>
        </p>
        `
        );
      });
      const inputs = document.querySelectorAll(".filter input");
      inputs.forEach((input) => {
        input.addEventListener("click", () => {
          //очистить контейнер или поля для авиакомпаний
          let arrayTemp = [];
          let inputsChecked = document.querySelectorAll("input:checked");
          inputsChecked.forEach((inputCheck) => {
            let airFiltered = locations.lastSearch.filter(
              (item) => item.airline_name == `${inputCheck.value}`
            );

            arrayTemp = arrayTemp.concat(airFiltered);
          });
          arrayTemp.sort((prev, next) =>
            prev.departure_at > next.departure_at ? 1 : -1
          );
          ticketsUI.renderTickets(arrayTemp);
        });
      });
    } catch (error) {
      alert(`Check your input data!\n Error: ${error}`);
    }
  }
});
