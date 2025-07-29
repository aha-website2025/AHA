function initMap() {
  const styledMapType = new google.maps.StyledMapType([
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#d0d0d0" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#b0b0b0" }] // darker grey
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }]
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }]
    },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ visibility: "off" }]
    }
  ], { name: "Black & White" });

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.0446, lng: -118.2417 }, // Star Apartments
  zoom: 18,
  mapTypeControl: false
  });

  map.mapTypes.set("styled_map", styledMapType);
  map.setMapTypeId("styled_map");

  const projects = [
    {
      name: "Kalkbreite",
      lat: 47.3744,
      lng: 8.5204,
      url: "project.html?id=kalkbreite"
    },
    {
      name: "Star Apartments",
      lat: 34.0446,
      lng: -118.2417,
      url: "project.html?id=star-apartments"
    }
  ];

  projects.forEach(project => {
    const marker = new google.maps.Marker({
      position: { lat: project.lat, lng: project.lng },
      map: map,
      title: project.name
    });

    marker.addListener("click", () => {
      window.location.href = project.url;
    });
  });
}
