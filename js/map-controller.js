import { locationService } from './services/location-service.js'
import { storage } from './services/storage-service.js'

const PLACES = 'placesDB';

var gGoogleMap;
window.onload = () => {
    initMap()
        .then(() => {
            addMarker({ lat: 32.0749831, lng: 34.9120554 });
            gGoogleMap.addListener('click', (ev) => {
                var placeName = prompt('Place name?')
                locationService.getLocations({
                    name: placeName,
                    coords: { lat: ev.latLng.lat(), lng: ev.latLng.lng() },
                    id: locationService.makeId(),
                    weather: locationService.getWeather(placeName),
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                })
                renderLocations();
            })
            let infoWindow = new google.maps.InfoWindow();
            gGoogleMap.addListener("click", (mapsMouseEvent) => {
                infoWindow = new google.maps.InfoWindow({
                    position: mapsMouseEvent.latLng,
                });
            });
        })
        .catch(console.log('INIT MAP ERROR'));


    document.querySelector('.btn').addEventListener('click', (ev) => {
        getUserPosition()
            .then(pos => {
                panTo(pos.coords.latitude, pos.coords.longitude);
                addMarker({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            })
            .catch(err => {
                console.log('err!!!', err);
            })
    })
    document.querySelector('.goToSearch-btn').addEventListener('click', () => {
        goToSearch()
    })
    document.querySelector('.copy-btn').addEventListener('click', () => {
        copyLink();
    })
}



function renderLocations() {
    // saveInService()
    var places = storage.loadFromStorage(PLACES);
    if (!places) return
    const strHtml = places.map(place => {
            return `
        <tr>
        <td>${place.name}</td>
        <td><button class="goTo-btn" data-lat="${place.coords.lat}" data-lng="${place.coords.lng}">Go There</button></td>
        <td><button class="btn-delete" data-name="${place.name}">Delete</button></td>
        </tr>
        `
        })
        // console.log(strHtml);
    document.querySelector('.thePlacesTable').innerHTML = strHtml.join('');

    var elBtnD = document.querySelectorAll('.btn-delete');
    elBtnD.forEach(elBtn => {
        var name = elBtn.dataset.name
        elBtn.addEventListener('click', () => {
            onDeletePlace(name)
        })
    })
    var elBtnG = document.querySelectorAll('.goTo-btn');
    console.log(elBtnG);
    elBtnG.forEach(elBtn => {
        var lat = +elBtn.dataset.lat;
        var lng = +elBtn.dataset.lng;
        elBtn.addEventListener('click', () => {
            onGoToPlace(lat, lng)
        })
    })
}

function goToSearch() {
    var elInput = document.querySelector('input').value;
    const prmRes = locationService.sendToServer(elInput)
    prmRes.then(res => {
            console.log('resSearch', res);
            onGoToPlace(res.lat, res.lng)
        })
        .catch(err => console.log(err))

}

function copyLink() {

}

function onDeletePlace(placeName) {
    deletePlace(placeName);
    renderLocations();
}

function deletePlace(placeName) {
    var places = storage.loadFromStorage(PLACES);
    var placeIdx = places.findIndex((place) => {
        return placeName === place.placeName;
    });
    if (!placeIdx) return;
    places.splice(placeIdx, 1);
    storage.saveToStorage(PLACES, places);
}

function onGoToPlace(lat, lng) {
    initMap(lat, lng);
    addMarker({ lat, lng });
}

export function initMap(lat = 32.0749831, lng = 34.9120554) {
    return locationService._connectGoogleApi()
        .then(() => {
            gGoogleMap = new google.maps.Map(
                document.querySelector('#map'), {
                    center: { lat, lng },
                    zoom: 15
                })
            addMarker({ lat, lng });
        })

}

function addMarker(loc) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gGoogleMap,
        title: 'Hello World!'
    });
    return marker;
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    gGoogleMap.panTo(laLatLng);
}

function getUserPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}