import { useMemo } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import '../css/Map.css';
import vector from '../bus-stop.svg';

interface Props {
  latitude: number,
  longitude: number,

}

export default function Map(props:Props) {
  const center = useMemo(() => ({ lat: props.latitude, lng: props.longitude }), []);

  return (
    <GoogleMap zoom={20} center={center} mapContainerClassName="mapContainer">
      <MarkerF position={center} icon={{ url: vector, scaledSize: new google.maps.Size(30, 30) }}/>
    </GoogleMap>
  );
}

