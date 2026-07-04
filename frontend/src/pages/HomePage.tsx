import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="p-6">
        <h1 className="text-4xl font-bold">
          Welcome to Running App 🏃
        </h1>

        <p className="mt-4 text-muted-foreground">
          Authentication is working!
        </p>
      </div>

      <div className="flex-1 px-6 pb-6">
        <MapContainer
          center={[28.6024, -81.2001]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-[600px] w-full rounded-xl"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[28.6024, -81.2001]}>
            <Popup>
              Welcome to Running App 🏃
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}