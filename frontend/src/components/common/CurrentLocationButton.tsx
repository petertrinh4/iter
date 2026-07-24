import { LocateFixed } from "lucide-react";
import { useMap } from "react-leaflet";
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import L from "leaflet";

export default function CurrentLocationButton({
  location,
}: {
  location: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    const container = document.createElement("div");

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const root = createRoot(container);

    root.render(
      <button
        onClick={() => map.flyTo(location, 16)}
        className="
          rounded-xl
          bg-background
          border
          border-border
          p-3
          shadow-lg
          hover:bg-muted
          transition
        "
      >
        <LocateFixed size={20} />
      </button>
    );

    const control = new L.Control({
      position: "bottomleft",
    });

    control.onAdd = () => container;

    control.addTo(map);

    return () => {
      control.remove();
      root.unmount();
    };
  }, [map, location]);

  return null;
}
