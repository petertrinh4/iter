//OSRM
const express = require('express');
const router = express.Router();
const Run = require('../models/Run');

routes.get('/api/routes/circuit', async (req, res) => {
    const {userId, title, waypoints} = req.body;

    // 1. Validate the incoming request data from the frontend
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 3) {
        return res.status(400).json({ error: 'At least three waypoints are required to calculate a circuit route.' });
    }

    //2. Fetch the actual running path from OSRM API
    const osrmData = await getCircuitRoute(waypoints);

    //3. Construct the MongoDB document
    const newRun = new Run({
        userId,
        title: title || "Custom Circuit Run",
        distanceInMeters: osrmData.distance,
        route: osrmData.route // This is the GeoJSON data returned from OSRM
    });
}
