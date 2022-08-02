import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import Map from "./Map"
import "../css/BusDetails.css"
import { BsArrowLeft } from 'react-icons/bs';


export default function BusDetails() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: `${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}` || "",
  });
  if (!isLoaded) return <div>Loading...</div>;
  return (
    <div className="container">
      <div className="header">
            <BsArrowLeft color={"white"} size={"18px"}  style={{stroke: "white", strokeWidth: "1", paddingLeft: "10", paddingTop: "3"}}/>
            <div className="busNum">40</div>
            <div className="direction">往</div>
            <div className="destination">荃灣(麗城花園)</div>
      </div>
      <div className="map">
        <Map />
      </div>
    </div>
  );
}

