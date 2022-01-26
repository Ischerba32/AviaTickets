import api from "../services/apiService";
import { formatDate } from "../helpers/date";
export class Locations {
  constructor(api, helpers) {
    this.api = api;
    this.countries = null;
    this.cities = null;
    this.shortCities = {};
    this.lastSearch = {};
    this.airlines = {};
    this.formatDate = helpers.formatDate;
  }
  async init() {
    const response = await Promise.all([
      this.api.countries(),
      this.api.cities(),
      this.api.airlines(),
    ]);

    const [countries, cities, airlines] = response;
    this.countries = this.serializeCountries(countries);
    this.cities = this.serializeCities(cities);
    this.shortCities = this.createShortCities(this.cities);
    this.airlines = this.serializeAirlines(airlines);

    return response;
  }

  getCityCodeByKey(key) {
    if(!key) return undefined;
    const city = Object.values(this.cities).find(
      (item) => item.full_name === key
    );
    console.log(city);
    return city.code;
  }

  getCityNameByCode(code) {
    try{
      const cityName = this.cities[code].name;
    }
    catch{
      throw new Error("empty or bad code!");
    }
    return this.cities[code].name;
  }

  getAirlineNameByCode(code) {
    return this.airlines[code] ? this.airlines[code].name : "";
  }

  getAirLineLogoByCode(code) {
    return this.airlines[code] ? this.airlines[code].logo : "";
  }

  createShortCities(cities) {
    return Object.entries(cities).reduce((acc, [, city]) => {
      acc[city.full_name] = null;
      return acc;
    }, {});
  }

  // serializeCountries(countries) {
  //   return countries.reduce((acc, country) => {
  //     acc[country.code] = country;
  //     return acc;
  //   }, {});
  // }

  serializeCountries(countries) {
    if(!Array.isArray(countries) || !countries.length) return {};
    return countries.reduce((acc, country) => {
      acc[country.code] = country;
      return acc;
    }, {});
  }

  serializeCities(cities) {
    return cities.reduce((acc, city) => {
      const country_name = this.countries[city.country_code].name;
      city.name = city.name || city.name_translations.en;
      const full_name = `${city.name}, ${country_name}`;
      acc[city.code] = {
        ...city,
        country_name,
        full_name,
      };
      return acc;
    }, {});
  }
  serializeAirlines(airlines) {
    return airlines.reduce((acc, item) => {
      item.logo = `http://pics.avs.io/200/200/${item.code}.png`;
      item.name = item.name || item.name_translations.en;
      acc[item.code] = item;
      return acc;
    }, {});
  }

  async fetchTickets(params) {
    if(!params) return undefined;
    const response = await this.api.prices(params);
    this.lastSearch = this.serializeTickets(response.data);
    console.log(this.lastSearch);
  }

  // getAirlineList(lastSearch){
  //   this.lastSearch.reduce((acc, item) =>{
  //     acc[item.airline_name] = item;
  //     return acc;
  //   },{});
  // }
  serializeTickets(tickets) {
    try {
      return Object.values(tickets).map((ticket) => {
        return {
          ...ticket,
          origin_name: this.getCityNameByCode(ticket.origin),
          destination_name: this.getCityNameByCode(ticket.destination),
          airline_logo: this.getAirLineLogoByCode(ticket.airline),
          airline_name: this.getAirlineNameByCode(ticket.airline),
          departure_at: this.formatDate(ticket.departure_at, "dd MMM yyyy hh:mm"),
          return_at: this.formatDate(ticket.return_at, "dd MMM yyyy hh:mm"),
        };
      });
    } catch (error) {
      throw new Error("error!");
    }
    //return serializedTickets;
  }
}

const locations = new Locations(api, { formatDate });

export default locations;
