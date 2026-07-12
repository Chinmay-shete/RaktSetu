# RaktSetu Location Data Collection & Usage Report

This document outlines in plain English exactly what location data RaktSetu requests, how it is collected, where it is stored in the database, and how it is utilized across the platform.

---

## 1. What Location Data is Collected?

When a Donor gives the browser permission to access their location, the application captures two types of location data:

### A. Live GPS Coordinates (Exact Location)
- **Latitude**: The precise north-south geographic coordinate.
- **Longitude**: The precise east-west geographic coordinate.

### B. User-Declared Location (Manual Input)
- **City**: The city/district the donor resides in (e.g. Pune, Satara).
- **Pincode**: The 6-digit postal code (e.g. 411001).

---

## 2. How is it Collected?

Location data is captured in two main phases:

### A. During Donor Registration (Step 3: Location Page)
- **Automatic Capture**: If the user clicks **"Enable live location for emergency alerts"**, the browser prompts for GPS permission. If accepted, the Geolocation API captures their precise coordinates.
- **Reverse Geocoding**: The application makes a request to OpenStreetMap's Nominatim service to attempt to auto-fill the **City** and **Pincode** based on the coordinates.
- **Manual Input**: If the user denies GPS permission, they can manually enter their **City** and **Pincode**. In this case, the system auto-resolves their coordinates to the center coordinates of their chosen city.

### B. During "Find Camps" Search (Real-time View)
- Every time a donor visits the **"Find Camps"** portal, the browser requests temporary live location access.
- This captures their current coordinates to calculate **exact real-time proximity distances** to hospitals and camps.

---

## 3. Where is it Stored?

Captured location data is saved in two main locations:

### A. Client-Side Browser Storage (`localStorage`)
- **Key**: `raktsetu_location`
- **Stored Data**: `{ "latitude": 18.5204, "longitude": 73.8567 }`
- **Key**: `raktsetu_donor_profile`
- **Stored Data**: City, Pincode, and GPS verification status.

### B. Database Server (MySQL)
The coordinates are sent to the backend endpoint `/api/v1/donor/location` and stored in the **`donors`** table:
- **`lat` (decimal 10,8)**: Stores the Latitude coordinate (e.g., `18.52040000`).
- **`lng` (decimal 11,8)**: Stores the Longitude coordinate (e.g., `73.85670000`).
- **`location` (point)**: A spatial geometry point type represented as `POINT(longitude latitude)` used for high-performance spatial database queries.
- **`city` (varchar)**: Stored in the `donors` table.
- **`pincode` (varchar)**: Stored in the `donors` table.

---

## 4. How is the Location Data Used?

Location coordinates are used for three critical features:

1. **Exact Proximity Distance**:
   - The application calculates the absolute distance (in kilometers) between the user's current live location and each hospital or blood donation camp using the **Haversine formula** (which calculates the shortest distance over the earth's curved surface).
2. **Proximity Sorting**:
   - Hospitals and camps are automatically sorted from nearest to farthest so the donor sees the closest available places first.
3. **Map Display & Boundary Auto-fit**:
   - Real-time coordinates place pins (`markers`) exactly where the hospital or camp is situated on the OpenStreetMap Leaflet map.
   - The map view automatically adjusts (`fitBounds`) to show all the pins in the district.
4. **Emergency Alerts (Future Capability)**:
   - Storing the spatial point in the database allows the system to send instant emergency notifications when a hospital in the donor's immediate vicinity (e.g., within 5–10 km) requires a matching blood type.
