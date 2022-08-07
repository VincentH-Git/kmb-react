import { useEffect, useMemo, useState } from "react";
import { GoogleMap, useLoadScript, MarkerF, DirectionsRenderer, } from "@react-google-maps/api";
import '../css/Map.css';
import currentStop from '../bus-stop.svg';
import otherStop from '../bus-stop-in-grey.svg';
import { useParams } from "react-router-dom";

interface Props {
  latitude: number,
  longitude: number,
  busStopName:string,
}



export default function Map(props: Props) {
  const center = useMemo(() => ({ lat: props.latitude, lng: props.longitude }), []);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const directionsService = new google.maps.DirectionsService()
  let { stopId, route, direction, service } = useParams()

  const constructRoute = async () => {
    try {
      // for map route 
      let busDirection = (direction == "O") ? "outbound" : "inbound"
      let res3 = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${busDirection}/${service}`)
      let busRoute = await res3.json();
      let busStopArray = []

      // maximum allowed waypoints is 25, plus the origin, and destination
      for (let i = 0; i < busRoute.data.length - 1; i = i + Math.ceil(busRoute.data.length / 24)) {
        if (stopId != busRoute.data[i].stop) {
          let response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${busRoute.data[i].stop}`)
          let eachBusStop = await response.json();
          busStopArray.push({ lat: parseFloat(eachBusStop.data.lat), lng: parseFloat(eachBusStop.data.long) })
        }
      }

      //added destination to the array
      let response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${busRoute.data[busRoute.data.length - 1].stop}`)
      let lastBusStop = await response.json();
      busStopArray.push({ lat: parseFloat(lastBusStop.data.lat), lng: parseFloat(lastBusStop.data.long) })

      // set value suitable for DirectionsRenderer
      let result = await directionsService.route({
        origin: new google.maps.LatLng(busStopArray[0].lat, busStopArray[0].lng),
        destination: new google.maps.LatLng(busStopArray[busStopArray.length - 1].lat, busStopArray[busStopArray.length - 1].lng),
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: busStopArray.slice(1, busStopArray.length - 1).map(eachPoint => { return { location: new google.maps.LatLng(eachPoint.lat, eachPoint.lng) } })
      })
      setDirections(result)
    }
    catch (error) {
      console.log("error: " + error)
    }
  }
  useEffect(() => {
    constructRoute()
  }, [])

  return (
    <GoogleMap zoom={20} center={center} mapContainerClassName="mapContainer">
      <MarkerF position={center} icon={{ url: currentStop, scaledSize: new google.maps.Size(30, 30) }} label={{text: `${props.busStopName}`, className:"busStopLabel", color:"#3C4952", fontSize:"18px", fontWeight:"600"}} />
      {directions && (
        <DirectionsRenderer directions={directions} options={{ markerOptions: { icon: { url: otherStop, scaledSize: new google.maps.Size(30, 30) } }, preserveViewport: true, polylineOptions:{strokeColor:"#E41F31", strokeWeight:5} }} />
      )}
    </GoogleMap>
  );
}

