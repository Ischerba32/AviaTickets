import locationsInstance, {Locations} from '../locations';
import {formatDate} from '../../helpers/date';
import api, {Api} from '../../services/apiService';
// import { describe } from 'yargs';

const countries = [{
    code: 'UKR',
    name: 'Ukraine'
}]
const cities = [{
    full_name: "Харьков, Украина",
    country_code: 'UKR',
    name: 'Kharkiv',
    code: 'KH'
}]
const airlines = [{
    country_code: 'UKR',
    name: 'Airlines',
    code: 'AVIA',
    logo: "http://pics.avs.io/200/200/AVIA.png"
}]

const tickets = [{
  airline: "AVIA",
  airline_logo: "http://pics.avs.io/200/200/AVIA.png",
  airline_name: "Airlines",
  departure_at: "02 Dec 2021 10:20",
  destination: "MSQ",
  destination_name: "Минск",
  expires_at: "2021-12-02T20:57:49Z",
  flight_number: 1476,
  origin: "KH",
  origin_name: "Kharkiv",
  price: 476,
  return_at: "05 Dec 2021 12:40",
  transfers: 2,
}]

jest.mock('../../services/apiService', () => {
    const mockApi = {
        countries: jest.fn(() => Promise.resolve([{
            code: 'UKR',
            name: 'Ukraine'
        }])),
        cities: jest.fn(() => Promise.resolve([{
            country_code: 'UKR',
            name: 'Kharkiv',
            full_name: "Харьков, Украина",
            code: 'KH'
        }])),
        airlines: jest.fn(() => Promise.resolve([{
            country_code: 'UKR',
            name: 'Airlines',
            code: 'AVIA'
        }])),
        tickets: jest.fn(() => Promise.resolve([{
            airline: "AVIA",
            airline_logo: "http://pics.avs.io/200/200/AVIA.png",
            airline_name: "Airlines",
            departure_at: "02 Dec 2021 10:20",
            destination: "MSQ",
            destination_name: "Минск",
            expires_at: "2021-12-02T20:57:49Z",
            flight_number: 1476,
            origin: 'KH',
            origin_name: "Kharkiv",
            price: 476,
            return_at: "05 Dec 2021 12:40",
            transfers: 2,
        }]))
    }
    return {
        Api: jest.fn(() => mockApi)
    }
})

const apiService = new Api()

describe('Location store tests', ()=>{
    beforeEach(() =>{
        locationsInstance.countries = locationsInstance.serializeCountries(countries)
        locationsInstance.cities = locationsInstance.serializeCities(cities)
    })
    it('Check location instance is instance of Locations class', () =>{
        expect(locationsInstance).toBeInstanceOf(Locations);
    })
    it('Success locations instance fields', () =>{
        const instance = new Locations(api, {formatDate})
        expect(instance.countries).toBe(null);
        expect(instance.shortCities).toEqual({});
        expect(instance.formatDate).toEqual(formatDate);
    })
    it('Checking correct countries serialize', () =>{
        const res = locationsInstance.serializeCountries(countries)
        const expectedData = {
            UKR: {
                code: 'UKR',
                name: 'Ukraine'
            }
        }
        expect(res).toEqual(expectedData)
    })
    it('Checking countries serialize with incorrect data', () =>{
        const res = locationsInstance.serializeCountries(null)
        const expectedData = {}
        expect(res).toEqual(expectedData)
    })
    it('Checking correct cities serialize', () =>{
        const res = locationsInstance.serializeCities(cities)
        const expectedData = {
            KH: {
                country_code: 'UKR',
                name: 'Kharkiv',
                code: 'KH',
                country_name: 'Ukraine',
                full_name: 'Kharkiv, Ukraine'
            }
        }
        expect(res).toEqual(expectedData)
    })
    it('Checking correct get cities name by code', () =>{
        const res = locationsInstance.getCityNameByCode('KH')
        expect(res).toBe('Kharkiv')
    })
    it('Checking correct init method call', () =>{
        const instance = new Locations(apiService, { formatDate })
        expect(instance.init()).resolves.toEqual([countries, cities, airlines])
    })
    it("Checking getting airline name by incorrect code", () =>{
      const res = locationsInstance.getAirlineNameByCode('BY');
      expect(res).not.toBe('Airlines');
    })
    it("Checking getting city code by empty key",()=>{
      const res = locationsInstance.getCityCodeByKey("");
      expect(res).toBeUndefined()
    })
    it("Checking fetching tickets without params", async () =>{
      const res =  await locationsInstance.fetchTickets("");
      expect(res).toBeUndefined();
    })
    it("Checking catching serializing tickets errors", () =>{
      const instance = new Locations(apiService, { formatDate })
      expect(instance.init()).resolves.toEqual([countries, cities, airlines])
      expect(() => instance.serializeTickets(tickets)).toThrow(Error);
    })


})
