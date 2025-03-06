/**
 * Converts degrees to radians
 *
 * @param {number} degrees - Value in degrees
 * @returns {number} - Value in radians
 */
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Calculates if a customer location is within a specified range of the restaurant
 *
 * @param {number} customerLat - Customer's latitude
 * @param {number} customerLng - Customer's longitude
 * @param {Object} restaurantLocation - Object containing restaurant's coordinates
 * @param {number} restaurantLocation.latitude - Restaurant's latitude
 * @param {number} restaurantLocation.longitude - Restaurant's longitude
 * @param {number} maxDistanceMeters - Maximum allowed distance in meters
 * @returns {boolean} - True if within range, false otherwise
 */
const isWithinRange = (customerLat, customerLng, restaurantLocation, maxDistanceMeters) => {
    // Check if parameters are valid
    if (!customerLat || !customerLng || !restaurantLocation || !restaurantLocation.latitude || !restaurantLocation.longitude || !maxDistanceMeters) {
        return false;
    }

    // Convert coordinates from degrees to radians
    const lat1 = toRadians(customerLat);
    const lon1 = toRadians(customerLng);
    const lat2 = toRadians(restaurantLocation.latitude);
    const lon2 = toRadians(restaurantLocation.longitude);

    // Radius of the Earth in meters
    const earthRadius = 6371000;

    // Haversine formula
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in meters
    const distance = earthRadius * c;

    return distance <= maxDistanceMeters;
};

module.exports = {
    isWithinRange,
    toRadians,
};
