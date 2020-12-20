export const locationService = {
    getLocations,
    sendToServer,
    _connectGoogleApi,
    makeId,
    getWeather,

}
import { storage } from './storage-service.js'

const PLACES = 'placesDB';
const gPlaces = [];
const API_KEY = 'AIzaSyBzfpQbTtSYT__Qh9PIPLUnA9xBMKj1iFY';

function getLocations(obj) {
    gPlaces.push(obj)
    storage.saveToStorage(PLACES, gPlaces);
}

function makeId(length = 3) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}


function sendToServer(input) {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${input}&key=${API_KEY}`)
        .then(res => {
            var coords = { lat: res.data.results[0].geometry.location.lat, lng: res.data.results[0].geometry.location.lng }
            return coords;
        })
        .catch((err) => console.log('Had issues:', err))
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyBzfpQbTtSYT__Qh9PIPLUnA9xBMKj1iFY';
    var elGoogleApi = document.createElement('script');
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    elGoogleApi.async = true;
    document.body.append(elGoogleApi);

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve;
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}

function getWeather(lat, lng) {
    return axios.get(`api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}`)
        .then(weather => {
            console.log('weather', weather);
        })
        .catch(err => console.log(err))
}